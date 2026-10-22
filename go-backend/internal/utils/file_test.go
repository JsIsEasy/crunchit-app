package utils

import (
	"fmt"
	"testing"
	"time"
)

func TestBuildInputFileNameSuccess(t *testing.T) {

	tests := []struct {
		Name string
	}{
		{
			Name: "",
		}}

	for _, _ := range tests {
		jobId := fmt.Sprintf("job-%d", time.Now().UnixNano())
		inputFileName, err := BuildInputFileName(jobId, "karan_nakra.jpg")

		if err != nil {
			t.Fatalf("expected to build input file name successfully, got %v", err)
		}

		if inputFileName == "" {
			t.Fatal("expected a non-empty value for input file name")
		}
	}

}
