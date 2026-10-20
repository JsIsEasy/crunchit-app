package worker

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/crunchit/internal/jobs"
)

type JobClaimer interface {
	ClaimNextQueuedJob(ctx context.Context) (jobs.Job, error)
}

type JobProcessor interface {
	ProcessJob(ctx context.Context, job jobs.Job) error
}

type Worker struct {
	claimer   JobClaimer
	processor JobProcessor
	interval  time.Duration
	logger    *slog.Logger
}

func New(
	claimer JobClaimer,
	processor JobProcessor,
	interval time.Duration,
	logger *slog.Logger,
) *Worker {
	if logger == nil {
		logger = slog.Default()
	}

	return &Worker{
		claimer:   claimer,
		processor: processor,
		interval:  interval,
		logger:    logger,
	}
}

func (w *Worker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			{
				w.logger.Info("worker stopped")
				return
			}
		case <-ticker.C:
			{
				w.processOne(ctx)
			}
		}
	}
}

func (w *Worker) processOne(ctx context.Context) {
	job, err := w.claimer.ClaimNextQueuedJob(ctx)
	if err != nil {
		if errors.Is(err, jobs.ErrNoQueuedJobs) {
			w.logger.Info(
				"no available jobs to process, returning...",
			)
			// no available job to process
			return
		}

		if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
			return
		}

		w.logger.Error(
			"failed to claim queued job",
			"error", err,
		)
		return
	}

	w.logger.Info(
		"job process starting:",
		"job_id", job.ID,
	)

	if err := w.processor.ProcessJob(ctx, job); err != nil {
		w.logger.Error(
			"job processing failed",
			"job_id", job.ID,
			"error", err,
		)
		return
	}

	w.logger.Info(
		"job processed successfully",
		"job_id", job.ID,
	)
}
