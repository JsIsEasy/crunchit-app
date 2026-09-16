package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/crunchit/internal/app"
	"github.com/crunchit/internal/config"
)

func main() {
	var serverWg sync.WaitGroup
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()

	if err != nil {
		panic(fmt.Errorf("Failed to load config %w", err))
	}

	err = cfg.Validate()
	if err != nil {
		panic(fmt.Errorf("Config validation failed %w", err))
	}

	_app, err := app.New(cfg)
	if err != nil {
		panic(fmt.Errorf("Failed to create new app %w", err))
	}

	serverWg.Go(func() {
		fmt.Printf("Starting the server on port.... %s", cfg.HTTP_ADDRESS)
		if err := _app.Server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			panic(fmt.Errorf("Failed to start server %w", err))
		}
	})

	serverWg.Go(func() {
		<-ctx.Done()

		ctxWithTimeout, stop := context.WithTimeout(ctx, 5000)
		defer stop()

		fmt.Println("Shutting down the server...")
		if err := _app.Server.Shutdown(ctxWithTimeout); err != nil {
			panic(fmt.Errorf("Failed to shutdown server %w", err))
		}
	})

	serverWg.Wait()
}
