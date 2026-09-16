package app

import (
	"context"
	"net/http"

	"github.com/crunchit/internal/config"
	"github.com/crunchit/internal/httpapi"
)

type App struct {
	Config config.Config
	Server *http.Server
}

func New(ctx context.Context, cfg config.Config) (*App, error) {

	api := &httpapi.API{}

	server := &http.Server{
		Addr:    cfg.HttpAddress,
		Handler: api.Routes(),
	}

	return &App{
		Server: server,
	}, nil
}

func (app *App) Close() {

}
