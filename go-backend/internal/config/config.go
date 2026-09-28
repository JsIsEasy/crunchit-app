package config

import (
	"errors"
	"os"
	"strconv"
)

var (
	ErrInvalidDbURL             = errors.New("db url is invalid")
	ErrInvalidAddr              = errors.New("http address is invalid")
	ErrInvalidStorage           = errors.New("invalid storage directory")
	ErrInvalidFileSize          = errors.New("invalid max file size")
	ErrInvalidMaxFiles          = errors.New("invalid max files")
	ErrInvalidWorkerConcurrency = errors.New("invalid worker concurrency")
	ErrIntParsingFailed         = errors.New("failed to parse int value")
)

type Config struct {
	DatabaseUrl       string
	HttpAddress       string
	StorageDir        string
	MaxFileSizeBytes  int64
	MaxFiles          int
	WorkerConcurrency int
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
	dbUrl, exist := getEnvKey("DATABASE_URL", "test-url")
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

	_maxFileSizeMB, exist := getEnvKey("MAX_FILE_SIZE_MB", "10")
	if !exist {
		return Config{}, ErrInvalidFileSize
	}

	maxFileSize, err := strconv.ParseInt(_maxFileSizeMB, 10, 64)
	if err != nil {
		return Config{}, ErrIntParsingFailed
	}

	maxFileSizeBytes := maxFileSize * 1024 * 1024

	_maxFiles, exist := getEnvKey("MAX_FILES", "5")
	if !exist {
		return Config{}, ErrInvalidMaxFiles
	}

	maxFiles, err := strconv.Atoi(_maxFiles)
	if err != nil {
		return Config{}, ErrIntParsingFailed
	}

	_workerConcurrency, exist := getEnvKey("WORKER_CONCURRENCY", "10")
	if !exist {
		return Config{}, ErrInvalidWorkerConcurrency
	}

	workerConcurrency, err := strconv.Atoi(_workerConcurrency)
	if err != nil {
		return Config{}, ErrIntParsingFailed
	}

	return Config{
		DatabaseUrl:       dbUrl,
		HttpAddress:       addr,
		StorageDir:        storageDir,
		MaxFileSizeBytes:  maxFileSizeBytes,
		MaxFiles:          maxFiles,
		WorkerConcurrency: workerConcurrency,
	}, nil

}

func (c *Config) Validate() error {
	if c.DatabaseUrl == "" {
		return ErrInvalidDbURL
	}

	if c.HttpAddress == "" {
		return ErrInvalidAddr
	}

	if c.MaxFiles == 0 {
		return ErrInvalidMaxFiles
	}

	if c.StorageDir == "" {
		return ErrInvalidStorage
	}

	if c.WorkerConcurrency == 0 {
		return ErrInvalidWorkerConcurrency
	}

	if c.MaxFileSizeBytes == 0 {
		return ErrInvalidFileSize
	}

	return nil
}
