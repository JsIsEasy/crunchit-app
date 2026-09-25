package httpapi

import (
	"context"
	"net/http"
	"time"
)

func (api *API) createHealthHandler(w http.ResponseWriter, req *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"Status": "Ok"})
}

func (api *API) readyHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := api.DB.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"status": "not_ready",
			"checks": map[string]string{
				"database": "unavailable",
			},
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ready",
		"checks": map[string]string{
			"database": "ok",
		},
	})
}
