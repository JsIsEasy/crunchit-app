package db

import (
	"errors"
	"fmt"
	"net/url"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(databaseUrl, migrationDir string) error {
	absolutePath, err := filepath.Abs(migrationDir)
	if err != nil {
		return fmt.Errorf("resolve migrations directory: %w", err)
	}

	sourceURL := (&url.URL{
		Scheme: "file",
		Path:   absolutePath,
	}).String()

	migrator, err := migrate.New(sourceURL, databaseUrl)
	if err != nil {
		return fmt.Errorf(
			"create migration runner: %q %w",
			sourceURL,
			err)
	}

	defer func() {
		_, _ = migrator.Close()
	}()

	if err := migrator.Up(); err != nil &&
		!errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("run migrations: %w", err)
	}
	return nil
}
