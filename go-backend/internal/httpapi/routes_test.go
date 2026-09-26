package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func newTestAPI() *API {
	return &API{}
}

func TestHealthRoute(t *testing.T) {
	api := newTestAPI()
	handler := api.Routes()

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	var respBody struct {
		Status string `json:"status"`
	}

	err := json.NewDecoder(resp.Body).Decode(&respBody)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if respBody.Status != "Ok" {
		t.Fatalf("expected status = 'Ok' got %s", respBody.Status)
	}

}

func TestReadyRoute(t *testing.T) {
	api := newTestAPI()
	handler := api.Routes()

	req := httptest.NewRequest(http.MethodGet, "/readyz", nil)

	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	result := w.Result()
	defer req.Body.Close()

}
