package jobs

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store interface {
	CreateJob(ctx context.Context, job Job) error
	GetJob(ctx context.Context, jobID string) (Job, error)
	UpdateJob(ctx context.Context, job Job) (Job, error)
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
