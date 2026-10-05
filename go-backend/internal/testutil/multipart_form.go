package testutil

import (
	"bytes"
	"fmt"
	"mime/multipart"
	"testing"
)

func CreateMultipartForm(t *testing.T, operation string, formKey string, filename string, size int) (*bytes.Buffer, *multipart.Writer, error) {
	t.Helper()
	if size < 0 {
		return nil, nil, fmt.Errorf("file size must not be negative: %d", size)
	}

	fileContent := make([]byte, size)

	for i := range fileContent {
		fileContent[i] = byte(i % 256)
	}

	var buf bytes.Buffer

	writer := multipart.NewWriter(&buf)

	part, err := writer.CreateFormFile(formKey, filename)

	if err != nil {
		return nil, nil, err
	}

	if _, err := part.Write(fileContent); err != nil {
		return nil, nil, err
	}

	part, err = writer.CreateFormField("operation")
	if err != nil {
		return nil, nil, err
	}

	if _, err := part.Write([]byte(operation)); err != nil {
		return nil, nil, err
	}

	if err := writer.Close(); err != nil {
		return nil, nil, err
	}

	return &buf, writer, nil

}
