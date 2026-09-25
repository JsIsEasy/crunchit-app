package jobs

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/crunchit/internal/conversion"
)

type Service struct {
	store      Store
	converter  conversion.Converter
	storageDir string
}

func NewService(store Store, converter conversion.Converter, storageDir string) *Service {
	return &Service{
		store:      store,
		converter:  converter,
		storageDir: storageDir}
}

func (s *Service) getFileDir(fileName string) string {
	return filepath.Join(s.storageDir, "jobs", fileName)
}

func (s *Service) CreateJob(
	ctx context.Context,
	operation Operation,
	originalFilename string,
	inputReader io.Reader) (Job, error) {

	if err := ctx.Err(); err != nil {
		return Job{}, err
	}

	jobId := fmt.Sprintf("job-%d", time.Now().UnixNano())
	dirName := s.getFileDir(jobId)

	cleanup := func() {
		_ = os.RemoveAll(dirName)
	}

	if err := os.MkdirAll(dirName, 0755); err != nil {
		return Job{}, fmt.Errorf("failed to create job directory, error: %w", err)
	}

	inputPath := filepath.Join(dirName, "input.jpg")

	inputFile, err := os.OpenFile(inputPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)
	if err != nil {

		removeDirErr := os.Remove(s.getFileDir(jobId))
		if removeDirErr != nil {
			return Job{}, fmt.Errorf("failed to create file: %s, error: %w \n failed to remove job directory, error: %w", jobId, removeDirErr, err)
		}

		return Job{}, fmt.Errorf("failed to create file: %s, error: %w", jobId, err)
	}

	defer inputFile.Close()

	now := time.Now().UTC()
	job := Job{
		ID:               jobId,
		Operation:        operation,
		Status:           StatusQueued,
		InputPath:        inputPath,
		OriginalFilename: originalFilename,
		Progress:         0,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	if _, err = io.Copy(inputFile, inputReader); err != nil {
		cleanup()
		return Job{}, fmt.Errorf("failed to save input file, error: %w", err)
	}

	if err = s.store.CreateJob(ctx, job); err != nil {
		cleanup()
		return Job{}, fmt.Errorf("failed to create job, error: %w", err)
	}

	return job, nil
}
