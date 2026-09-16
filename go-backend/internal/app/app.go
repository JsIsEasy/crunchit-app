package app

import (
	"net/http"

	"github.com/crunchit/internal/config"
	"github.com/crunchit/internal/httpapi"
)

type App struct {
	Server *http.Server
}

func New(cfg config.Config) (*App, error) {

	server := &http.Server{
		Addr:    cfg.HTTP_ADDRESS,
		Handler: httpapi.Routes(),
	}

	return &App{
		Server: server,
	}, nil
}
