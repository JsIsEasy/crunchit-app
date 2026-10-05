package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type StubDB struct{}

func (StubDB) Ping(ctx context.Context) error {
	if unavailable := ctx.Value("db-error"); unavailable != nil {
		return errors.New("db is unavailable")
	}
	return nil
}

func newStubDB() StubDB {
	return StubDB{}
}

func TestHealthRoute(t *testing.T) {
	db := StubDB{}
	api := &API{DB: db}
	handler := api.Routes()

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}

	var respBody struct {
		Status string `json:"status"`
	}

	err := json.NewDecoder(resp.Body).Decode(&respBody)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if respBody.Status != StatusOk {
		t.Fatalf("expected status = %s, got %s", StatusOk, respBody.Status)
	}

}

func TestReadyRouteServiceAvailability(tt *testing.T) {
	tests := []struct {
		name          string
		serviceStatus string
		statusCode    int
		reqHasError   bool
		serviceName   string
		appStatus     string
	}{
		{
			name:          "DB status unavailable",
			serviceStatus: Unavailable,
			reqHasError:   true,
			statusCode:    http.StatusServiceUnavailable,
			serviceName:   "database",
			appStatus:     StatusNotReady,
		},
		{
			name:          "DB status is available",
			serviceStatus: StatusOk,
			reqHasError:   false,
			statusCode:    http.StatusOK,
			serviceName:   "database",
			appStatus:     StatusReady,
		},
	}

	db := newStubDB()
	api := &API{DB: db}

	handler := api.Routes()

	for _, _test := range tests {

		tc := _test

		tt.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
			defer req.Body.Close()

			if tc.reqHasError {
				newCtx := context.WithValue(req.Context(), "db-error", true)
				req = req.WithContext(newCtx)
			}

			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)
			resp := w.Result()
			defer resp.Body.Close()

			var respBody struct {
				Status string         `json:"status"`
				Checks map[string]any `json:"checks"`
			}

			if resp.StatusCode != tc.statusCode {
				t.Fatalf("expected status code=%d, got %d", tc.statusCode, resp.StatusCode)
			}

			err := json.NewDecoder(resp.Body).Decode(&respBody)

			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if respBody.Status != tc.appStatus {
				t.Fatalf("expected service status=%s, got %s", tc.appStatus, respBody.Status)
			}

			switch tc.serviceName {

			case "database":
				dbStatus, exist := respBody.Checks["database"]
				if !exist {
					t.Fatalf("expected response body to have database status")
				}

				if dbStatus != tc.serviceStatus {
					t.Fatalf("expected to receive db status=%s, got %s", tc.serviceStatus, dbStatus)
				}
			default:
				t.Fatalf("unexpected service name")
			}
		})
	}
}
