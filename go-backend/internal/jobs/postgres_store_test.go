package jobs

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/crunchit/internal/testutil"
)

const MIGRATIONS_PATH = "../../../migrations"

type claimResult struct {
	job Job
	err error
}

func NewTestPostgresSetup(t *testing.T) (context.Context, *PostgresStore) {
	t.Helper()
	ctx := context.Background()
	testDB := testutil.StartPostgres(ctx, t, MIGRATIONS_PATH)

	testPgStore := NewPostgresStore(testDB.Pool)
	return ctx, testPgStore
}

func NewTestJob() Job {
	return Job{
		ID:               fmt.Sprintf("job-%d", time.Now().UnixNano()),
		Operation:        JpgToPng,
		OriginalFilename: "input.jpg",
		InputPath:        "",
		OutputPath:       "",
		Status:           StatusQueued,
		Progress:         0,
		Error:            "",
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}
}

func TestNoQueuedJobsError(t *testing.T) {
	ctx, testPgStore := NewTestPostgresSetup(t)

	_, err := testPgStore.ClaimNextQueuedJob(ctx)
	if !errors.Is(err, ErrNoQueuedJobs) {
		t.Fatalf("expected error mismatch: %v", err)
	}
}

func TestClaimNextQueuedJobsWithMultipleWorkers(t *testing.T) {
	ctx, testPgStore := NewTestPostgresSetup(t)

	job := NewTestJob()
	err := testPgStore.CreateJob(ctx, job)
	if err != nil {
		t.Fatalf("create job error %v", err)
	}

	t.Cleanup(func() {
		testPgStore.db.Exec(
			ctx,
			`DELETE FROM jobs WHERE id = $1`,
			job.ID)
	})

	start := make(chan struct{})
	results := make(chan claimResult, 2)

	var workers sync.WaitGroup

	for range 2 {
		workers.Go(func() {

			<-start

			claimedJob, err := testPgStore.ClaimNextQueuedJob(ctx)

			results <- claimResult{
				job: claimedJob,
				err: err,
			}
		})
	}

	close(start)
	workers.Wait()
	close(results)

	var successfulClaims int
	var noJobResults int

	for result := range results {
		switch {
		case result.err == nil:
			successfulClaims++

			if result.job.ID != job.ID {
				t.Fatalf("claimed unexpected job: %s", result.job.ID)
			}
		case errors.Is(result.err, ErrNoQueuedJobs):
			noJobResults++

		default:
			t.Fatalf("unexpected claim error: %v", result.err)
		}
	}
	if successfulClaims != 1 {
		t.Fatalf("expected exactly one successful claim, got %d", successfulClaims)
	}

	if noJobResults != 1 {
		t.Fatalf("expected exactly one no-job result, got %d", noJobResults)
	}
}

func TestClaimNextQueuedSuccess(t *testing.T) {
	ctx, testPgStore := NewTestPostgresSetup(t)

	job := NewTestJob()
	err := testPgStore.CreateJob(ctx, job)
	if err != nil {
		t.Fatalf("create job error %v", err)
	}

	t.Cleanup(func() {
		_, _ = testPgStore.db.Exec(ctx,
			`DELETE FROM jobs WHERE id = $1`,
			job.ID)
	})

	queuedJob, err := testPgStore.ClaimNextQueuedJob(ctx)
	if err != nil {
		t.Fatalf("claim next job error: %v", err)
	}

	if queuedJob.ID != job.ID {
		t.Fatalf("expected job id mismatch: %v", err)
	}
	if queuedJob.Status != StatusProcessing {
		t.Fatalf("expected job status mismatch: %v", err)
	}
}
