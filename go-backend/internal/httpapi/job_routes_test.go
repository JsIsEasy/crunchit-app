package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"sync"
	"testing"

	"github.com/crunchit/internal/conversion"
	"github.com/crunchit/internal/jobs"
	"github.com/crunchit/internal/testutil"
	"github.com/jackc/pgx/v5"
)

type fakeStore struct {
	mu   sync.RWMutex
	jobs map[string]jobs.Job
}

const (
	ErrNoRowFound = "err-no-row-found"
	ErrTxnClosed  = "err-txn-closed"
)

func (s *fakeStore) CreateJob(ctx context.Context, job jobs.Job) error {
	if errMsg := ctx.Value("err-msg"); errMsg != nil {
		msg, parsed := errMsg.(string)
		if !parsed {
			return errors.New("unable to parse err message")
		}
		return errors.New(msg)
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs[job.ID] = job
	return nil
}

func (s *fakeStore) GetJob(ctx context.Context, jobID string) (jobs.Job, error) {
	if dbErr, ok := ctx.Value("db-error").(string); ok && dbErr != "" {
		switch dbErr {
		case ErrNoRowFound:
			return jobs.Job{}, pgx.ErrNoRows
		case ErrTxnClosed:
			return jobs.Job{}, pgx.ErrTxClosed
		default:
			return jobs.Job{}, errors.New("unexpected error type")
		}
	}

	return s.jobs[jobID], nil
}

func (s *fakeStore) UpdateJob(ctx context.Context, job jobs.Job) (jobs.Job, error) {

	s.mu.Lock()
	defer s.mu.Unlock()

	s.jobs[job.ID] = job
	return s.jobs[job.ID], nil
}

func newFakeService(storageDir string) JobService {
	store := &fakeStore{
		jobs: make(map[string]jobs.Job),
	}

	converters := jobs.Converters{
		jobs.JpgToPng: conversion.JPEGToPNGConverter{},
	}

	return jobs.NewService(store, converters, storageDir)
}

func newFakeLogger() *slog.Logger {
	return slog.New(
		slog.NewTextHandler(io.Discard, nil),
	)
}

func newFakeAPI(t *testing.T, maxFileSizeBytes int64) (*API, string) {
	t.Helper()

	tempDir := t.TempDir()
	service := newFakeService(tempDir)
	logger := newFakeLogger()
	db := newStubDB()
	return NewAPI(service, db, logger, maxFileSizeBytes), tempDir
}

func TestCreateJobHandlerFailures(tt *testing.T) {

	tests := []struct {
		name               string
		fileName           string
		fileKey            string
		fileSize           int
		maxFileSizeBytes   int64
		expectedStatusCode int
		expectedErrMsg     string
		hasAttachedFiles   bool
		operation          jobs.Operation
	}{
		{
			name:               "payload size overload error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           10 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusRequestEntityTooLarge,
			expectedErrMsg:     ErrLargeRequestEntity,
			hasAttachedFiles:   true,
		},
		{
			name:               "file size overload error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1<<20 + 500,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusRequestEntityTooLarge,
			expectedErrMsg:     ErrLargeUploadFile,
			hasAttachedFiles:   true,
			operation:          jobs.JpgToPng,
		},
		{
			name:               "file is missing error",
			fileName:           "image.jpg",
			fileKey:            "not-a-file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusBadRequest,
			expectedErrMsg:     ErrFileRequired,
			hasAttachedFiles:   false,
			operation:          jobs.JpgToPng,
		},
		{
			name:               "file operation is required error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusBadRequest,
			expectedErrMsg:     ErrOperationRequired,
			hasAttachedFiles:   true,
			operation:          "",
		},
		{
			name:               "file operations not supported error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusBadRequest,
			hasAttachedFiles:   true,
			expectedErrMsg:     ErrNotSupportedOperation,
			operation:          "one-to-another",
		},
		{
			name:               "job creation failed",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusInternalServerError,
			hasAttachedFiles:   true,
			expectedErrMsg:     ErrCreateJobFailed,
			operation:          "jpg-to-png",
		},
	}

	for _, _test := range tests {
		tc := _test

		tt.Run(tc.name, func(t *testing.T) {

			api, _ := newFakeAPI(t, tc.maxFileSizeBytes)

			buf, formWriter, err := testutil.CreateMultipartForm(t, string(tc.operation), tc.fileKey, tc.fileName, tc.fileSize)

			req := httptest.NewRequest("POST", "/jobs", buf)
			req.Header.Set("Content-type", formWriter.FormDataContentType())

			ctx := context.WithValue(req.Context(), "err-msg", "failed to create job")
			req = req.WithContext(ctx)

			w := httptest.NewRecorder()
			defer req.Body.Close()

			api.Routes().ServeHTTP(w, req)

			resp := w.Result()
			defer resp.Body.Close()

			var errMessage struct {
				Error string `json:"error"`
			}

			if resp.StatusCode != tc.expectedStatusCode {
				t.Fatalf("expected status=%d, got=%d", tc.expectedStatusCode, resp.StatusCode)
			}

			err = json.NewDecoder(resp.Body).Decode(&errMessage)
			if err != nil {
				t.Fatalf("expected no error while decoding, got: %v", err)
			}

			if errMessage.Error != tc.expectedErrMsg {
				t.Fatalf("expected error mismatch")
			}
		})
	}
}

func TestCreateJobHandlerSuccess(t *testing.T) {
	api, _ := newFakeAPI(t, 10<<20)

	buf, writer, err := testutil.CreateMultipartForm(t, string(jobs.JpgToPng), "file", "image.jpg", 1<<20)
	if err != nil {
		t.Fatalf("multipart form creation failed, %v", err)
	}

	req := httptest.NewRequest("POST", "/jobs", buf)
	req.Header.Set("Content-type", writer.FormDataContentType())
	defer req.Body.Close()

	w := httptest.NewRecorder()

	api.Routes().ServeHTTP(w, req)
	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, resp.StatusCode)
	}

	job := CreateOrGetJobResponse{}

	err = json.NewDecoder(resp.Body).Decode(&job)
	if err != nil {
		t.Fatalf("expected no err when parsing json, got %v", err)
	}

	if job.ID == "" {
		t.Fatalf("expected job id to be populated")
	}
	if job.Operation != jobs.JpgToPng {
		t.Fatalf("expected operation: %s, got: %s", jobs.JpgToPng, job.Operation)
	}
	if job.Status != jobs.StatusQueued {
		t.Fatalf("expected status: %s, got: %s", jobs.StatusQueued, job.Status)
	}
	if job.OriginalFileName != "image.jpg" {
		t.Fatalf("expected original file name: %s, got: %s", "image.jpg", job.OriginalFileName)
	}
	if job.UpdatedAt.IsZero() {
		t.Fatalf("expected updated at to be non-zero, got %v", job.UpdatedAt)
	}
	if job.CreatedAt.IsZero() {
		t.Fatalf("expected created at to be a non-zero, got %v", job.CreatedAt)
	}
}

func TestGetJobRoutesFailure(tt *testing.T) {
	api, _ := newFakeAPI(tt, 10<<20)

	tests := []struct {
		name       string
		jobID      string
		statusCode int
		dbError    string
		errMsg     string
	}{
		{
			name:       "no job exist with job id",
			jobID:      "test-job-id",
			statusCode: http.StatusNotFound,
			dbError:    ErrNoRowFound,
			errMsg:     ErrNoJobFound,
		},
		{
			name:       "txn is closed",
			jobID:      "test-job-id",
			statusCode: http.StatusInternalServerError,
			dbError:    ErrTxnClosed,
			errMsg:     ErrJobRetrievalFailed,
		},
	}

	for _, _test := range tests {
		tc := _test
		tt.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()

			ctx := context.Background()

			req := httptest.NewRequest("GET", fmt.Sprintf("/jobs/%s", tc.jobID), nil)

			if tc.dbError != "" {
				ctx = context.WithValue(ctx, "db-error", tc.dbError)
			}

			api.Routes().ServeHTTP(w, req.WithContext(ctx))

			resp := w.Result()

			defer req.Body.Close()

			var errorMsg struct {
				Error string `json:"error"`
			}

			if resp.StatusCode != tc.statusCode {
				t.Fatalf("expected status code = %d, got %d", tc.statusCode, resp.StatusCode)
			}

			json.NewDecoder(resp.Body).Decode(&errorMsg)

			if errorMsg.Error != tc.errMsg {
				t.Fatalf("expected err %v, got %v", ErrNoJobFound, errorMsg.Error)
			}
		})
	}
}

func TestGetJobRouteSuccess(t *testing.T) {
	api, storageDir := newFakeAPI(t, 10<<20)

	ctx := context.Background()

	filePath := filepath.Join(storageDir, "input.jpg")

	reader, err := testutil.CreateNewFileReader(t, filePath)
	if err != nil {
		t.Fatalf("create new file reader: %v", err)
	}

	savedJob, err := api.JobService.CreateJob(ctx, jobs.JpgToPng, "input.jpg", reader)
	if err != nil {
		t.Fatalf("create job: %v", err)
	}

	path := fmt.Sprintf("/jobs/%s", savedJob.ID)

	req := httptest.NewRequest("GET", path, nil)
	w := httptest.NewRecorder()

	defer req.Body.Close()

	api.Routes().ServeHTTP(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}

	var job CreateOrGetJobResponse

	err = json.NewDecoder(resp.Body).Decode(&job)
	if err != nil {
		t.Fatalf("json decode: %v", err)
	}
	if job.ID != savedJob.ID {
		t.Fatalf("expected job ID %s, got %s", savedJob.ID, job.ID)
	}
	if job.Status != jobs.StatusQueued {
		t.Fatalf("expected status %s, got %s", jobs.StatusQueued, job.Status)
	}
	if job.Operation != savedJob.Operation {
		t.Fatalf("expected operation %s, got %s", savedJob.Operation, job.Operation)
	}
	if job.OriginalFileName != savedJob.OriginalFilename {
		t.Fatalf("expected file name %s, got %s", savedJob.OriginalFilename, job.OriginalFileName)
	}
}

func TestDownloadRoutesFailure(tt *testing.T) {
	api, tempDir := newFakeAPI(tt, 10<<20)

	filePath := filepath.Join(tempDir, "input.jpg")

	reader, err := testutil.CreateNewFileReader(tt, filePath)
	if err != nil {
		tt.Fatalf("file reader: %v", err)
	}

	ctx := context.Background()

	job, err := api.JobService.CreateJob(ctx, jobs.JpgToPng, "input.jpg", reader)
	job.Status = jobs.JobStatus(jobs.StatusReady)

	updatedJob, err := api.JobService.UpdateJob(ctx, job)
	if err != nil {
		tt.Fatalf("update job: %v", err)
	}

	tests := []struct {
		name       string
		jobID      string
		statusCode int
		dbError    string
		errMsg     string
	}{
		{
			name:       "no job exist",
			jobID:      "test-job-id",
			statusCode: http.StatusNotFound,
			dbError:    ErrNoRowFound,
			errMsg:     ErrNoJobFound,
		},
		{
			name:       "job retrieval failed",
			jobID:      "test-job-id",
			statusCode: http.StatusInternalServerError,
			dbError:    ErrTxnClosed,
			errMsg:     ErrJobRetrievalFailed,
		},
		{
			name:       "job status is not ready",
			jobID:      "test-job-id",
			statusCode: http.StatusConflict,
			dbError:    "",
			errMsg:     ErrJobNotReady,
		},
		{
			name:       "job output path unavailable",
			jobID:      updatedJob.ID,
			statusCode: http.StatusInternalServerError,
			dbError:    "",
			errMsg:     ErrUnavailableDownload,
		},
	}

	for _, _test := range tests {
		tc := _test

		tt.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()

			ctx := context.Background()

			req := httptest.NewRequest("GET", fmt.Sprintf("/jobs/%s/download", tc.jobID), nil)

			if tc.dbError != "" {
				ctx = context.WithValue(ctx, "db-error", tc.dbError)
			}

			api.Routes().ServeHTTP(w, req.WithContext(ctx))

			resp := w.Result()

			defer req.Body.Close()

			var errorMsg struct {
				Error string `json:"error"`
			}

			if resp.StatusCode != tc.statusCode {
				t.Fatalf("expected status code = %d, got %d", tc.statusCode, resp.StatusCode)
			}

			json.NewDecoder(resp.Body).Decode(&errorMsg)

			if errorMsg.Error != tc.errMsg {
				t.Fatalf("expected err %v, got %v", ErrNoJobFound, errorMsg.Error)
			}

		})
	}
}

func TestDownloadRoutesSuccess(t *testing.T) {
	api, tempDir := newFakeAPI(t, 10<<20)

	filePath := filepath.Join(tempDir, "input.jpg")
	reader, err := testutil.CreateNewFileReader(t, filePath)
	if err != nil {
		t.Fatalf("file reader: %v", err)
	}

	ctx := context.Background()

	job, err := api.JobService.CreateJob(ctx, jobs.JpgToPng, "input.jpg", reader)
	if err != nil {
		t.Fatalf("create job: %v", err)
	}

	job.Status = jobs.StatusReady
	job.OutputPath = filepath.Join(filepath.Dir(job.InputPath), "output.png")

	_, err = api.JobService.UpdateJob(ctx, job)
	if err != nil {
		t.Fatalf("update job: %v", err)
	}

	w := httptest.NewRecorder()

	req := httptest.NewRequest("GET", fmt.Sprintf("/jobs/%s/download", job.ID), nil)

	api.Routes().ServeHTTP(w, req.WithContext(ctx))

	resp := w.Result()
	defer resp.Body.Close()

	if got := resp.Header.Get("Content-Disposition"); got != "attachment; filename=input.jpg" {
		t.Fatalf("expected attachment filename input.jpg, got %q", got)
	}

	defer req.Body.Close()
}
