package jobs

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNoQueuedJobs = errors.New("no queued jobs available")

type Store interface {
	CreateJob(ctx context.Context, job Job) error
	GetJob(ctx context.Context, jobID string) (Job, error)
	UpdateJob(ctx context.Context, job Job) (Job, error)
	ClaimNextQueuedJob(ctx context.Context) (Job, error)
}

type PostgresStore struct {
	db *pgxpool.Pool
}

func NewPostgresStore(db *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{db: db}
}

func (s *PostgresStore) CreateJob(ctx context.Context, job Job) error {
	query := `INSERT INTO conversion_jobs (
			  id, 
			  operation, 
			  original_filename,
			  input_path,
			  output_path,
			  status,
			  progress,
			  error,
			  created_at,
			  updated_at) VALUES
			  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := s.db.Exec(
		ctx,
		query,
		job.ID,
		job.Operation,
		job.OriginalFilename,
		job.InputPath,
		job.OutputPath,
		job.Status,
		job.Progress,
		job.Error,
		job.CreatedAt,
		job.UpdatedAt)
	if err != nil {
		return fmt.Errorf("insert job: %w", err)
	}

	return nil
}

func (s *PostgresStore) GetJob(ctx context.Context, jobID string) (Job, error) {
	query := `SELECT
	          id,
			  operation,
			  original_filename,
			  input_path,
			  output_path,
			  status,
			  progress,
			  error,
			  created_at,
			  updated_at FROM
			  conversion_jobs
			  WHERE id= $1;`

	job := Job{}
	row := s.db.QueryRow(ctx, query, jobID)

	err := row.Scan(
		&job.ID,
		&job.Operation,
		&job.OriginalFilename,
		&job.InputPath,
		&job.OutputPath,
		&job.Status,
		&job.Progress,
		&job.Error,
		&job.CreatedAt,
		&job.UpdatedAt)
	if err != nil {
		return Job{}, fmt.Errorf("get job: %w", err)
	}

	return job, nil
}

func (s *PostgresStore) UpdateJob(ctx context.Context, job Job) (Job, error) {
	const updateQuery = `
		UPDATE conversion_jobs
		SET status = $1,
			progress = $2,
			error = $3,
			output_path = $4,
			updated_at = now()
		WHERE id = $5
		RETURNING id, operation, original_filename, input_path,
	    output_path, status, progress, error, created_at, updated_at`

	updatedJob := Job{}
	err := s.db.QueryRow(
		ctx,
		updateQuery,
		job.Status,
		job.Progress,
		job.Error,
		job.OutputPath,
		job.ID,
	).Scan(
		&updatedJob.ID,
		&updatedJob.Operation,
		&updatedJob.OriginalFilename,
		&updatedJob.InputPath,
		&updatedJob.OutputPath,
		&updatedJob.Status,
		&updatedJob.Progress,
		&updatedJob.Error,
		&updatedJob.CreatedAt,
		&updatedJob.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return Job{}, fmt.Errorf("update job: %w", pgx.ErrNoRows)
		}

		return Job{}, fmt.Errorf("update job: %w", err)
	}

	return updatedJob, nil
}

func (s *PostgresStore) ClaimNextQueuedJob(ctx context.Context) (Job, error) {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Job{}, fmt.Errorf("begin claim transaction: %w", err)
	}

	var job Job

	query := `
			  Select
			  	id,
				operation,
				original_file_name,
				input_path,
				output_path,
				status,
				progress,
				error,
				created_at,
				updated_at,
			  FROM conversion_jobs
			  WHERE status = $1
			  ORDER BY created_at ASC
			  FOR UPDATE SKIP LOCKED
			  LIMIT 1
			  `
	err = tx.
		QueryRow(ctx, query, StatusQueued).
		Scan(
			&job.ID,
			&job.Operation,
			&job.OriginalFilename,
			&job.InputPath,
			&job.OutputPath,
			&job.Status,
			&job.Progress,
			&job.Error,
			&job.CreatedAt,
			&job.UpdatedAt,
		)

	if errors.Is(err, pgx.ErrNoRows) {
		_ = tx.Rollback(ctx)
		return Job{}, ErrNoQueuedJobs
	}
	if err != nil {
		_ = tx.Rollback(ctx)
		return Job{}, fmt.Errorf("find queued job: %w", err)
	}

	updateQuery := `
		UPDATE conversion_jobs
		SET status = $1, updated_at = now()
		WHERE id = $2
		RETURNING status, updated_at
	`

	if err := tx.
		QueryRow(ctx, updateQuery, StatusProcessing, job.ID).Scan(&job.Status, &job.UpdatedAt); err != nil {
		_ = tx.Rollback(ctx)
		return Job{}, fmt.Errorf("claim job %q: %w", job.ID, err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Job{}, fmt.Errorf("commit job claim %q: %w", job.ID, err)
	}

	job.Status = StatusProcessing
	job.UpdatedAt = time.Now().UTC()

	return job, nil

}
