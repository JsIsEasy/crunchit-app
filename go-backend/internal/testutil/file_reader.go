package testutil

import (
	"fmt"
	"io"
	"os"
	"testing"
)

func CreateNewFileReader(t *testing.T, filePath string) (io.Reader, error) {
	t.Helper()

	WriteJPEGFixture(t, filePath, 100, 100)

	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("file reader: %w", err)
	}

	return file, nil
}
