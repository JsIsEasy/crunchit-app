package httpapi

import (
	"context"
	"io"
	"log/slog"
	"net/http"

	"github.com/crunchit/internal/jobs"
)

type API struct {
	JobService       JobService
	DB               DBPinger
	Logger           *slog.Logger
	MaxFileSizeBytes int64
}

type JobService interface {
	CreateJob(
		ctx context.Context,
		operation jobs.Operation,
		filename string,
		input io.Reader,
	) (jobs.Job, error)

	GetJob(
		ctx context.Context,
		id string,
	) (jobs.Job, error)
}

type DBPinger interface {
	Ping(ctx context.Context) error
}

func NewAPI(
	jobService JobService,
	db DBPinger,
	logger *slog.Logger,
	maxFileSizeBytes int64) *API {
	return &API{
		JobService:       jobService,
		DB:               db,
		Logger:           logger,
		MaxFileSizeBytes: maxFileSizeBytes,
	}
}

func (api *API) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", api.createHealthHandler)
	mux.HandleFunc("GET /readyz", api.readyHandler)
	mux.HandleFunc("POST /jobs", api.createJobHandler)
	mux.HandleFunc("GET /jobs/{ID}", api.getJobHandler)

	return mux
}
