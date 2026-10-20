package testutil

import (
	"context"
	"testing"

	"github.com/crunchit/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
)

type TestDatabase struct {
	Pool *pgxpool.Pool
	URL  string
}

func StartPostgres(
	ctx context.Context,
	t testing.TB,
	migrationsDir string,
) *TestDatabase {
	t.Helper()

	container, err := postgres.Run(
		ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("crunchit_test"),
		postgres.WithUsername("app"),
		postgres.WithPassword("app"),
		postgres.BasicWaitStrategies(),
	)
	if err != nil {
		t.Fatalf("start postgres container: %v", err)
	}

	t.Cleanup(func() {
		if err := testcontainers.TerminateContainer(container); err != nil {
			t.Errorf("terminate postgres container: %v", err)
		}
	})

	databaseURL, err := container.ConnectionString(
		ctx,
		"sslmode=disable",
	)
	if err != nil {
		t.Fatalf("get postgres connection string: %v", err)
	}
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		t.Fatalf("create postgres pool: %v", err)
	}
	t.Cleanup(func() {
		pool.Close()
	})

	if err := pool.Ping(ctx); err != nil {
		t.Fatalf("ping postgres container: %v", err)
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		t.Fatal(err)
	}

	config.MaxConns = 4
	pool, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		t.Fatal(err)
	}

	if err := db.RunMigrations(databaseURL, migrationsDir); err != nil {
		t.Fatalf("run test database migrations: %v", err)
	}

	return &TestDatabase{
		Pool: pool,
		URL:  databaseURL,
	}
}
