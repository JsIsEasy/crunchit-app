package httpapi

import (
	"net/http"
)

type API struct {
}

func (api *API) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", api.createHealthHandler)

	return mux
}
