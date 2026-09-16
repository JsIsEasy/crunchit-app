package httpapi

import (
	"encoding/json"
	"net/http"
)

func writeJson(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func Routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, req *http.Request) {
		writeJson(w, 200, map[string]string{"status": "OK"})
	})

	return mux
}
