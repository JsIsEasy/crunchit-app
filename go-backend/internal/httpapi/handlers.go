package httpapi

import "net/http"

func (api *API) createHealthHandler(w http.ResponseWriter, req *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"Status": "Ok"})
}
