package config

import (
	"errors"
	"os"
)

var (
	ErrInvalidDbURL             = errors.New("Db url is invalid")
	ErrInvalidAddr              = errors.New("Http address is invalid")
	ErrInvalidStorage           = errors.New("Invalid storage directory")
	ErrInvalidFileSize          = errors.New("Invalid max file size")
	ErrInvalidMaxFiles          = errors.New("Invalid max files")
	ErrInvalidWorkerConcurrency = errors.New("Invalid worker concurrency")
)

type Config struct {
	DATABASE_URL       string
	HTTP_ADDRESS       string
	STORAGE_DIR        string
	MAX_FILE_SIZE      string
	MAX_FILES          string
	WORKER_CONCURRENCY string
}

func getEnvKey(key string, fallback string) (string, bool) {
	value, exist := os.LookupEnv(key)
	if exist {
		return value, true
	}

	if fallback == "" {
		return "", false
	}

	return fallback, true
}

func Load() (Config, error) {
	dbUrl, exist := getEnvKey("DATABASE_URL", "empty-fallback")

	if !exist {
		return Config{}, ErrInvalidDbURL
	}

	addr, exist := getEnvKey("HTTP_ADDRESS", ":8080")

	if !exist {
		return Config{}, ErrInvalidAddr
	}

	storageDir, exist := getEnvKey("STORAGE_DIR", "download-")

	if !exist {
		return Config{}, ErrInvalidStorage
	}

	maxFileSize, exist := getEnvKey("MAX_FILE_SIZE", "10")

	if !exist {
		return Config{}, ErrInvalidFileSize
	}

	maxFiles, exist := getEnvKey("MAX_FILES", "5")

	if !exist {
		return Config{}, ErrInvalidMaxFiles
	}

	workerConcurrency, exist := getEnvKey("WORKER_CONCURRENCY", "10")

	if !exist {
		return Config{}, ErrInvalidWorkerConcurrency
	}

	return Config{
		DATABASE_URL:       dbUrl,
		HTTP_ADDRESS:       addr,
		STORAGE_DIR:        storageDir,
		MAX_FILE_SIZE:      maxFileSize,
		MAX_FILES:          maxFiles,
		WORKER_CONCURRENCY: workerConcurrency,
	}, nil

}

func (c *Config) Validate() error {
	return nil
}
