package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/crunchit/internal/app"
	"github.com/crunchit/internal/config"
)

func main() {
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	if err := cfg.Validate(); err != nil {
		log.Fatalf("config validation failed: %v", err)
	}

	mode := "api"

	if len(os.Args) > 1 {
		mode = os.Args[1]
	}

	switch mode {
	case "api":
		if err := runAPI(ctx, cfg); err != nil {
			log.Fatalf("api failed: %v", err)
		}
	case "worker":
		if err := runWorker(ctx, cfg); err != nil {
			log.Fatalf("worker failed: %v", err)
		}
	default:
		log.Fatalf("unknown mode %q; expected api or worker", mode)
	}
}

func runAPI(ctx context.Context, cfg config.Config) error {

	application, err := app.New(ctx, cfg)
	if err != nil {
		return fmt.Errorf("failed to create app: %w", err)
	}

	defer application.Close()

	serverErr := make(chan error, 1)
	var serverWg sync.WaitGroup

	serverWg.Go(func() {
		log.Printf("starting server on %s", cfg.HttpAddress)

		if err := application.Server.ListenAndServe(); err != nil &&
			!errors.Is(err, http.ErrServerClosed) {
			serverErr <- fmt.Errorf("server start error: %w", err)
		}
	})

	var runErr error

	select {
	case runErr = <-serverErr:
		log.Println("server stopped unexpectedly")
	case <-ctx.Done():
		log.Println("shutdown signal received")
	}

	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	log.Println("shutting down server...")

	if err := application.Server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("failed to shut down server: %w", err)
	}

	serverWg.Wait()

	return runErr
}

func runWorker(ctx context.Context, cfg config.Config) error {
	workerApp, err := app.NewWorker(ctx, cfg)
	if err != nil {
		return fmt.Errorf("failed to create worker app: %w", err)
	}

	workerApp.Worker.Start(ctx)

	return nil
}
