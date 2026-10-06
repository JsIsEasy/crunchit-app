package httpapi

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/crunchit/internal/jobs"
	"github.com/jackc/pgx/v5"
)

type CreateJobRequest struct {
	FileName  string `json:"fileName"`
	Operation string `json:"Operation"`
}

type CreateOrGetJobResponse struct {
	ID               string         `json:"id"`
	Operation        jobs.Operation `json:"operation"`
	OriginalFileName string         `json:"original_filename"`
	Status           jobs.JobStatus `json:"status"`
	Progress         int            `json:"progress"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
}

func (api *API) createJobHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	const multipartOverhead = 1 << 20
	requestLimit := api.MaxFileSizeBytes + multipartOverhead

	// Limit the complete request body.
	r.Body = http.MaxBytesReader(
		w,
		r.Body,
		requestLimit,
	)

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		var maxBytesError *http.MaxBytesError

		if errors.As(err, &maxBytesError) {
			writeError(
				w,
				http.StatusRequestEntityTooLarge,
				"request body exceeds the allowed limit",
			)
			return
		}

		if errors.Is(err, http.ErrMissingFile) {
			writeError(
				w,
				http.StatusBadRequest,
				"file is required",
			)
			return
		}

		writeError(
			w,
			http.StatusBadRequest,
			"invalid multipart form",
		)
		return
	}

	defer file.Close()

	if fileHeader.Size > api.MaxFileSizeBytes {
		writeError(
			w,
			http.StatusRequestEntityTooLarge,
			"uploaded file is too large",
		)
		return
	}

	operationValue := strings.TrimSpace(
		r.FormValue("operation"),
	)

	if operationValue == "" {
		writeError(
			w,
			http.StatusBadRequest,
			"operation is required",
		)
		return
	}

	if operationValue != string(jobs.JpgToPng) && operationValue != string(jobs.PngToJpg) {
		writeError(
			w,
			http.StatusBadRequest,
			"operation is not supported",
		)
		return
	}

	job, err := api.JobService.CreateJob(
		r.Context(),
		jobs.Operation(operationValue),
		fileHeader.Filename,
		file)
	if err != nil {
		api.Logger.Error(
			"create job failed",
			"error", err,
		)
		writeError(
			w,
			http.StatusInternalServerError,
			"failed to create job",
		)
		return
	}

	writeJSON(w, http.StatusCreated, CreateOrGetJobResponse{
		ID:               job.ID,
		Operation:        job.Operation,
		OriginalFileName: job.OriginalFilename,
		Status:           job.Status,
		Progress:         job.Progress,
		CreatedAt:        job.CreatedAt,
		UpdatedAt:        job.UpdatedAt,
	})
}

func (api *API) getJobHandler(w http.ResponseWriter, req *http.Request) {
	jobID := req.PathValue("ID")

	if jobID == "" {
		writeError(
			w,
			http.StatusBadRequest,
			"invalid job ID")
		return
	}

	job, err := api.JobService.GetJob(req.Context(), jobID)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(
			w,
			http.StatusNotFound,
			"no job found",
		)
		return
	}
	if err != nil {
		api.Logger.Error(
			"job retrieval failed",
			"error:", err,
		)
		writeError(
			w,
			http.StatusInternalServerError,
			"job retrieval failed",
		)
		return
	}

	writeJSON(w, http.StatusOK, CreateOrGetJobResponse{
		ID:               job.ID,
		Operation:        job.Operation,
		OriginalFileName: job.OriginalFilename,
		Status:           job.Status,
		Progress:         job.Progress,
		CreatedAt:        job.CreatedAt,
		UpdatedAt:        job.UpdatedAt,
	})
}
