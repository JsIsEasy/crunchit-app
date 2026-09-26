package app

import (
	"context"
	"fmt"
	"net/http"

	"github.com/crunchit/internal/config"
	"github.com/crunchit/internal/conversion"
	"github.com/crunchit/internal/db"
	"github.com/crunchit/internal/httpapi"
	"github.com/crunchit/internal/jobs"
	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	Config config.Config
	Server *http.Server
	DB     *pgxpool.Pool
}

func New(ctx context.Context, cfg config.Config) (*App, error) {
	dbPool, err := db.Open(ctx, cfg.DatabaseUrl)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	store := jobs.NewPostgresStore(dbPool)
	converters := jobs.Converters{
		jobs.JpgToPng: conversion.JPEGToPNGConverter{},
	}
	service := jobs.NewService(store, converters, cfg.StorageDir)

	api := httpapi.NewAPI(service, dbPool, cfg.MaxFileSizeBytes)

	server := &http.Server{
		Addr:    cfg.HttpAddress,
		Handler: api.Routes(),
	}

	return &App{
		Server: server,
		DB:     dbPool,
	}, nil
}

func (app *App) Close() {
	if app.DB != nil {
		app.DB.Close()
	}
}
