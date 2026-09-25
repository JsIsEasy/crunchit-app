package jobs

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrJobCreationFailed = errors.New("failed to create new job.")
)

type Store interface {
	CreateJob(ctx context.Context, job Job) error
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
		return ErrJobCreationFailed
	}

	return nil
}
