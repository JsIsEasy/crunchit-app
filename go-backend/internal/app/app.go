package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/crunchit/internal/config"
	"github.com/crunchit/internal/conversion"
	"github.com/crunchit/internal/db"
	"github.com/crunchit/internal/httpapi"
	"github.com/crunchit/internal/jobs"
	"github.com/crunchit/internal/logging"
	"github.com/crunchit/internal/worker"
	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	Config config.Config
	Server *http.Server
	DB     *pgxpool.Pool
}

type WorkerApp struct {
	DB     *pgxpool.Pool
	Worker *worker.Worker
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

	logger := logging.New()
	service := jobs.NewService(store, converters, cfg.StorageDir)
	api := httpapi.NewAPI(service, dbPool, logger, cfg.MaxFileSizeBytes)

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

func NewWorker(ctx context.Context, cfg config.Config) (*WorkerApp, error) {
	dbPool, err := db.Open(ctx, cfg.DatabaseUrl)
	if err != nil {
		return nil, fmt.Errorf("open worker database; %w", err)
	}

	cleanupDB := func() {
		dbPool.Close()
	}

	store := jobs.NewPostgresStore(dbPool)

	converters := jobs.Converters{
		jobs.JpgToPng: conversion.JPEGToPNGConverter{},
	}

	service := jobs.NewService(
		store,
		converters,
		cfg.StorageDir,
	)

	jobWorker := worker.New(
		store,
		service,
		1*time.Second,
		slog.Default(),
	)
	_ = cleanupDB

	return &WorkerApp{
		DB:     dbPool,
		Worker: jobWorker,
	}, nil
}

func (a *WorkerApp) Close() {
	if a.DB != nil {
		a.DB.Close()
	}
}
