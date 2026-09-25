package testutil

import (
	"image"
	"image/jpeg"
	"os"
	"testing"
)

func WriteJPEGFixture(
	t testing.TB,
	path string,
	width int,
	height int,
) {
	t.Helper()

	file, err := os.Create(path)
	if err != nil {
		t.Fatalf("failed to create jpeg fixture: %v", err)
	}

	img := image.NewRGBA(image.Rect(0, 0, width, height))

	if err := jpeg.Encode(file, img, nil); err != nil {
		file.Close()
		t.Fatalf("failed to encode jpeg fixture: %v", err)
	}

	if err := file.Close(); err != nil {
		t.Fatalf("failed to close jpeg fixture: %v", err)
	}
}
