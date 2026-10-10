package jobs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

type Service struct {
	store      Store
	converters Converters
	storageDir string
}

func NewService(store Store, converters Converters, storageDir string) *Service {
	return &Service{
		store:      store,
		converters: converters,
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
		return Job{}, fmt.Errorf("create job: %w", err)
	}

	if inputReader == nil {
		return Job{}, errors.New("create job: input reader is nil")
	}

	if _, exists := s.converters[operation]; !exists {
		return Job{}, fmt.Errorf(
			"create job: unsupported operation %q",
			operation,
		)
	}

	jobId := fmt.Sprintf("job-%d", time.Now().UnixNano())
	dirName := s.getFileDir(jobId)

	cleanup := func(cause error) error {
		if cleanupErr := os.RemoveAll(dirName); cleanupErr != nil {
			return errors.Join(
				cause,
				fmt.Errorf(
					"cleanup job directory %q: %w",
					dirName,
					cleanupErr,
				),
			)
		}
		return cause
	}

	if err := os.MkdirAll(dirName, 0755); err != nil {
		return Job{}, cleanup(
			fmt.Errorf(
				"create job directory %q: %w",
				dirName,
				err,
			))
	}

	inputPath := filepath.Join(dirName, "input.jpg")

	inputFile, err := os.OpenFile(
		inputPath,
		os.O_CREATE|os.O_WRONLY|os.O_TRUNC,
		0600,
	)
	if err != nil {
		return Job{}, cleanup(
			fmt.Errorf(
				"create input file %q: %w",
				inputPath,
				err,
			),
		)
	}

	_, copyErr := io.Copy(inputFile, inputReader)

	closeErr := inputFile.Close()

	if copyErr != nil {
		cause := fmt.Errorf(
			"save uploaded file %q: %w",
			originalFilename,
			copyErr,
		)

		if closeErr != nil {
			cause = errors.Join(
				cause,
				fmt.Errorf(
					"close input file %q: %w",
					inputPath,
					closeErr,
				),
			)

		}
		return Job{}, cleanup(cause)
	}

	if err := ctx.Err(); err != nil {
		return Job{}, fmt.Errorf("create job: %w", err)
	}

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

	if err = s.store.CreateJob(ctx, job); err != nil {
		return Job{}, cleanup(
			fmt.Errorf(
				"persist job %q: %w",
				job.ID,
				err,
			),
		)
	}

	return job, nil
}

func (s *Service) GetJob(
	ctx context.Context,
	jobID string,
) (Job, error) {
	if err := ctx.Err(); err != nil {
		return Job{}, fmt.Errorf("retrieve job: %w", err)
	}

	job, err := s.store.GetJob(ctx, jobID)
	if err != nil {
		return Job{}, fmt.Errorf("retrieve job: %w", err)
	}

	return job, nil
}

func (s *Service) UpdateJob(
	ctx context.Context,
	job Job,
) (Job, error) {
	if err := ctx.Err(); err != nil {
		return Job{}, fmt.Errorf("update job: %w", err)
	}

	job, err := s.store.UpdateJob(ctx, job)
	if err != nil {
		return Job{}, err
	}

	return job, nil
}

func (s *Service) ProcessJob(
	ctx context.Context,
	jobID string,
) error {

	if err := ctx.Err(); err != nil {
		return fmt.Errorf("process job: %w", err)
	}

	job, err := s.GetJob(ctx, jobID)
	if err != nil {
		return fmt.Errorf("process job: %w", err)
	}

	if job.Status != StatusQueued {
		return fmt.Errorf("process job: unexpected status, expected %v, got %v", StatusQueued, job.Status)
	}

	job, err = s.store.ClaimNextQueuedJob(ctx)
	if err != nil {
		return fmt.Errorf("process job: %w", err)
	}

	outputPath := filepath.Join(s.storageDir, "output.jpg") // this needs to take dynamic mime type

	converter := s.converters[job.Operation]

	err = converter.Convert(ctx, job.InputPath, outputPath, func(progress int) error {
		job.Progress = progress

		if progress == 100 {
			job.OutputPath = outputPath
			job.Status = StatusReady

			_, err := s.UpdateJob(ctx, job)
			if err != nil {
				return err
			}
		}

		job.Status = StatusProcessing

		_, err := s.UpdateJob(ctx, job)
		if err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		job.Error = err.Error()
		job.Status = StatusFailed

		_, updateErr := s.UpdateJob(ctx, job)

		if updateErr != nil {
			return errors.Join(
				err,
				fmt.Errorf("process job: %w", updateErr))
		}

		return fmt.Errorf("process job: %w", updateErr)
	}

	return nil

}
