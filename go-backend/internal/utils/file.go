package utils

import (
	"errors"
	"fmt"
	"path/filepath"
)

var (
	ErrInvalidFileExt = errors.New("file extension is invalid.")
)

func extractFileExtension(fileName string) (string, error) {
	fileExt := filepath.Ext(fileName)
	if fileExt == "" {
		return "", fmt.Errorf("extract file extension: %s", fileExt)
	}
	return fileExt, nil
}

func BuildInputFileName(
	jobId string,
	originalFileName string) (string, error) {

	fileExt, err := extractFileExtension(originalFileName)

	if err != nil {
		return "", err
	}
	return fmt.Sprintf("file_%s%s", jobId, fileExt), nil
}
