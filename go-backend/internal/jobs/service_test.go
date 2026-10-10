package jobs

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"testing"

	"github.com/crunchit/internal/conversion"
	"github.com/crunchit/internal/testutil"
	"github.com/jackc/pgx/v5"
)

type FakeTestStore struct {
	mu    sync.RWMutex
	JobDB map[string]Job
	Err   error
}

func (s *FakeTestStore) CreateJob(ctx context.Context, job Job) error {
	if s.Err != nil {
		return s.Err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.JobDB[job.ID] = job
	return nil
}

func (s *FakeTestStore) GetJob(ctx context.Context, jobID string) (Job, error) {
	if s.Err != nil {
		return Job{}, s.Err
	}

	job, exists := s.JobDB[jobID]
	if !exists {
		return Job{}, pgx.ErrNoRows
	}

	return job, nil
}

func (s *FakeTestStore) UpdateJob(ctx context.Context, job Job) (Job, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.JobDB[job.ID] = job

	return s.JobDB[job.ID], nil
}

func (s *FakeTestStore) ClaimNextQueuedJob(ctx context.Context) (Job, error) {
	return Job{}, nil
}

func newFakeStore(err error) *FakeTestStore {
	if err != nil {
		return &FakeTestStore{
			JobDB: make(map[string]Job),
			Err:   err}
	}

	return &FakeTestStore{
		JobDB: make(map[string]Job)}
}

func newFakeConverters() Converters {
	converters := Converters{
		JpgToPng: conversion.JPEGToPNGConverter{},
	}
	return converters
}

func newFakeService(t *testing.T, err error) *Service {
	t.Helper()

	store := newFakeStore(err)
	converters := newFakeConverters()

	return NewService(store, converters, t.TempDir())
}

type failingReader struct {
	Err error
}

func (f *failingReader) Read([]byte) (int, error) {
	return 0, f.Err
}

func TestCreateJob(t *testing.T) {
	service := newFakeService(t, nil)

	fileName := "input.jpg"

	inputPath := filepath.Join(t.TempDir(), fileName)
	testutil.WriteJPEGFixture(t, inputPath, 100, 100)

	file, err := os.Open(inputPath)
	if err != nil {
		t.Fatalf("failed to open input file: %v", err)
	}
	defer file.Close()

	ctx := context.Background()

	job, err := service.CreateJob(ctx, JpgToPng, fileName, file)
	if err != nil {
		t.Fatalf("expected job creation to succeed, got: %v", err)
	}

	if job.Status != StatusQueued {
		t.Fatalf("expected Status=%s, got %s", StatusQueued, job.Status)
	}

	if job.Progress != 0 {
		t.Fatalf("expected Progress=0, got %d", job.Progress)
	}

	if job.Operation != JpgToPng {
		t.Fatalf("expected Operation=%s, got %s", JpgToPng, job.Operation)
	}

	if job.OriginalFilename != fileName {
		t.Fatalf("expected OriginalFilename=%s, got %s", fileName, job.OriginalFilename)
	}

	savedJob, err := service.GetJob(ctx, job.ID)
	if err != nil {
		t.Fatalf("expected no err when trying to get saved job, got %v", err)
	}
	if savedJob.OriginalFilename != fileName {
		t.Fatalf("expected filename %s, got %s", fileName, savedJob.OriginalFilename)
	}

}

func TestCreateJobStoreFailure(t *testing.T) {
	expectedError := errors.New("database is unavailable")
	service := newFakeService(t, expectedError)

	dir := t.TempDir()

	filePath := filepath.Join(dir, "input.jpg")

	testutil.WriteJPEGFixture(t, filePath, 100, 100)

	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open input file: %v", err)
	}
	defer file.Close()

	ctx := context.Background()

	_, err = service.CreateJob(ctx, JpgToPng, "input.jpg", file)
	if !errors.Is(err, expectedError) {
		t.Fatalf("expected error %v, got: %v", expectedError, err)
	}
}

func TestCreateJobContextCancelled(t *testing.T) {
	service := newFakeService(t, nil)

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	dir := t.TempDir()

	filePath := filepath.Join(dir, "input.jpg")

	testutil.WriteJPEGFixture(t, filePath, 100, 100)

	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open input file: %v", err)
	}
	defer file.Close()

	_, err = service.CreateJob(ctx, JpgToPng, "input.jpg", file)
	if err == nil {
		t.Fatalf("expected to fail with error, got no error")
	}
}

func TestCreateJobInputReadFailure(t *testing.T) {
	service := newFakeService(t, nil)

	dir := t.TempDir()

	filePath := filepath.Join(dir, "input.jpg")

	testutil.WriteJPEGFixture(t, filePath, 100, 100)

	uploadErr := errors.New("upload stream failed")

	reader := &failingReader{
		Err: uploadErr,
	}
	_, err := service.CreateJob(context.Background(), JpgToPng, "input.jpg", reader)
	if err == nil {
		t.Fatalf("expected to save file upload, got not error")
	}
}

func TestGetJobReturn404Error(t *testing.T) {
	ctx := context.Background()

	service := newFakeService(t, nil)

	_, err := service.GetJob(ctx, "test-job-id")
	if !errors.Is(err, pgx.ErrNoRows) {
		t.Fatalf("expected err %v, got %v", pgx.ErrNoRows, err)
	}
}

func TestGetJobReturnCtxCancelledErr(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	service := newFakeService(t, nil)

	_, err := service.GetJob(ctx, "test-job-id")
	if err == nil {
		t.Fatalf("expected to fail with ctx err got no err")
	}
}

func TestGetJobReturnsCreatedJob(t *testing.T) {
	ctx := context.Background()

	service := newFakeService(t, nil)

	tempDir := t.TempDir()

	fileName := "input.jpg"
	filePath := filepath.Join(tempDir, fileName)

	reader, err := testutil.CreateNewFileReader(t, filePath)
	if err != nil {
		t.Fatalf("expected no error when opening a file, got %v", err)
	}

	job, err := service.CreateJob(ctx, JpgToPng, fileName, reader)
	if err != nil {
		t.Fatalf("expected no error during job creation, got %v", err)
	}
	if job.Error != "" {
		t.Fatalf("expected no error in saved job, got %s", job.Error)
	}
	if job.Status != StatusQueued {
		t.Fatalf("expected job status=%s, got %s", StatusQueued, job.Status)
	}

	_, err = service.GetJob(ctx, job.ID)
	if err != nil {
		t.Fatalf("expected no error when job is fetched, got %v", err)
	}
}
