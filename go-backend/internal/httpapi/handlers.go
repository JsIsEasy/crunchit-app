package httpapi

import (
	"context"
	"net/http"
	"time"
)

const (
	StatusNotReady string = "not_ready"
	StatusReady    string = "ready"
	StatusOk       string = "ok"
	Unavailable    string = "unavailable"
)

func (api *API) createHealthHandler(w http.ResponseWriter, req *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"Status": StatusOk})
}

func (api *API) readyHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := api.DB.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"status": StatusNotReady,
			"checks": map[string]string{
				"database": Unavailable,
			},
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"status": StatusReady,
		"checks": map[string]string{
			"database": StatusOk,
		},
	})
}
