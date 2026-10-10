package httpapi

import (
	"errors"
	"mime"
	"net/http"
	"path/filepath"
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

const (
	ErrMethodNotAllowed      = "method not allowed"
	ErrLargeRequestEntity    = "request body exceeds the allowed limit"
	ErrFileRequired          = "file is required"
	ErrInvalidMultipartForm  = "invalid multipart form"
	ErrLargeUploadFile       = "uploaded file is too large"
	ErrOperationRequired     = "operation is required"
	ErrNotSupportedOperation = "operation is not supported"
	ErrCreateJobFailed       = "failed to create job"
)

const (
	ErrInvalidJobID        = "invalid job ID"
	ErrNoJobFound          = "no job found"
	ErrJobRetrievalFailed  = "job retrieval failed"
	ErrJobNotReady         = "job not ready for download"
	ErrUnavailableDownload = "download file is unavailable"
)

func (api *API) createJobHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, ErrMethodNotAllowed)
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
				ErrLargeRequestEntity,
			)
			return
		}

		if errors.Is(err, http.ErrMissingFile) {
			writeError(
				w,
				http.StatusBadRequest,
				ErrFileRequired,
			)
			return
		}

		writeError(
			w,
			http.StatusBadRequest,
			ErrInvalidMultipartForm,
		)
		return
	}

	defer file.Close()

	if fileHeader.Size > api.MaxFileSizeBytes {
		writeError(
			w,
			http.StatusRequestEntityTooLarge,
			ErrLargeUploadFile,
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
			ErrOperationRequired,
		)
		return
	}

	if operationValue != string(jobs.JpgToPng) && operationValue != string(jobs.PngToJpg) {
		writeError(
			w,
			http.StatusBadRequest,
			ErrNotSupportedOperation,
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
			ErrCreateJobFailed,
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

func (api *API) getJobHandler(w http.ResponseWriter, r *http.Request) {
	jobID := r.PathValue("ID")

	if jobID == "" {
		writeError(
			w,
			http.StatusBadRequest,
			ErrInvalidJobID)
		return
	}

	job, err := api.JobService.GetJob(r.Context(), jobID)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(
			w,
			http.StatusNotFound,
			ErrNoJobFound,
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
			ErrJobRetrievalFailed,
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

func (api *API) downloadJobHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, ErrMethodNotAllowed)
		return
	}

	jobID := r.PathValue("ID")
	if jobID == "" {
		writeError(
			w,
			http.StatusBadRequest,
			ErrInvalidJobID)
		return
	}

	job, err := api.JobService.GetJob(r.Context(), jobID)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(
			w,
			http.StatusNotFound,
			ErrNoJobFound,
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
			ErrJobRetrievalFailed,
		)
		return
	}

	if job.Status != jobs.StatusReady {
		writeError(
			w,
			http.StatusConflict,
			ErrJobNotReady)
		return
	}

	if job.OutputPath == "" {
		api.Logger.Error(
			"completed job has no output path",
			"job_id", job.ID,
		)

		writeError(
			w,
			http.StatusInternalServerError,
			ErrUnavailableDownload,
		)
	}

	filename := filepath.Base(job.OriginalFilename)
	if filename == "." || filename == string(filepath.Separator) {
		filename = "download"
	}

	contentDisposition := mime.FormatMediaType(
		"attachment",
		map[string]string{
			"filename": filename,
		},
	)

	w.Header().Set("Content-Disposition", contentDisposition)
	http.ServeFile(w, r, job.OutputPath)
}
