package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
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
	store := &fakeStore{}

	converters := make(map[jobs.Operation]conversion.Converter)

	return jobs.NewService(store, converters, storageDir)
}

func TestCreateJobHandlerMaxBytesFailure(tt *testing.T) {
	service := newFakeService("test-downloads")
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

			api := &API{
				JobService:       service,
				DB:               db,
				MaxFileSizeBytes: tc.maxFileSizeBytes,
			}

			buf, formWriter, err := testutil.CreateMultipartForm(t, string(tc.operation), tc.fileKey, tc.fileName, tc.fileSize)

			req := httptest.NewRequest("POST", "/jobs", buf)
			req.Header.Set("Content-type", formWriter.FormDataContentType())

			ctx := context.WithValue(req.Context(), "err-msg", "failed to create job")
			req = req.WithContext(ctx)

			resp := httptest.NewRecorder()
			defer req.Body.Close()

			api.Routes().ServeHTTP(resp, req)

			result := resp.Result()

			var errMessage struct {
				Error string `json:"error"`
			}

			if result.StatusCode != tc.expectedStatusCode {
				t.Fatalf("expected status=%d, got=%d", tc.expectedStatusCode, result.StatusCode)
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
