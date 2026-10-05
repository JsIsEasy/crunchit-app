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
	"sync"
	"testing"
	"time"

	"github.com/crunchit/internal/conversion"
	"github.com/crunchit/internal/jobs"
	"github.com/crunchit/internal/testutil"
)

type fakeStore struct {
	mu   sync.Mutex
	jobs map[string]jobs.Job
}

func (s *fakeStore) CreateJob(ctx context.Context, job jobs.Job) error {
	if errMsg := ctx.Value("err-msg"); errMsg != nil {
		msg, parsed := errMsg.(string)
		if !parsed {
			return errors.New("unable to parse err message")
		}
		return errors.New(msg)
	}

	id := fmt.Sprintf("job-%d", time.Now().UnixNano())

	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs[id] = job
	return nil
}

func newFakeService(storageDir string) JobService {
	store := &fakeStore{
		jobs: make(map[string]jobs.Job),
	}

	converters := make(map[jobs.Operation]conversion.Converter)

	return jobs.NewService(store, converters, storageDir)
}

func newFakeLogger() *slog.Logger {
	return slog.New(
		slog.NewTextHandler(io.Discard, nil),
	)
}

func TestCreateJobHandlerFailures(tt *testing.T) {
	tempDir := tt.TempDir()
	service := newFakeService(tempDir)
	db := newStubDB()

	tests := []struct {
		testName           string
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
			testName:           "payload size overload error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           10 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusRequestEntityTooLarge,
			expectedErrMsg:     "request body exceeds the allowed limit",
			hasAttachedFiles:   true,
		},
		{
			testName:           "file size overload error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1<<20 + 500,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusRequestEntityTooLarge,
			expectedErrMsg:     "uploaded file is too large",
			hasAttachedFiles:   true,
			operation:          jobs.JpgToPng,
		},
		{
			testName:           "file is missing error",
			fileName:           "image.jpg",
			fileKey:            "not-a-file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusBadRequest,
			expectedErrMsg:     "file is required",
			hasAttachedFiles:   false,
			operation:          jobs.JpgToPng,
		},
		{
			testName:           "file operation is required error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusBadRequest,
			expectedErrMsg:     "operation is required",
			hasAttachedFiles:   true,
			operation:          "",
		},
		{
			testName:           "file operations not supported error",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusBadRequest,
			hasAttachedFiles:   true,
			expectedErrMsg:     "operation is not supported",
			operation:          "one-to-another",
		},
		{
			testName:           "job creation failed",
			fileName:           "image.jpg",
			fileKey:            "file",
			fileSize:           1 << 20,
			maxFileSizeBytes:   1 << 20,
			expectedStatusCode: http.StatusInternalServerError,
			hasAttachedFiles:   true,
			expectedErrMsg:     "failed to create job",
			operation:          "jpg-to-png",
		},
	}

	for _, _test := range tests {
		tc := _test

		tt.Run(tc.testName, func(t *testing.T) {

			logger := newFakeLogger()
			api := NewAPI(service, db, logger, tc.maxFileSizeBytes)

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
	tempDir := t.TempDir()

	service := newFakeService(tempDir)
	logger := newFakeLogger()

	db := newStubDB()

	api := NewAPI(service, db, logger, 10<<20)

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

	job := CreateJobResponse{}

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
