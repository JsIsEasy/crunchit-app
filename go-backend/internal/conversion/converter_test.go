package conversion

import (
	"context"
	"image"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"testing"
)

func writeJPEGFixture(
	t *testing.T,
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

func TestJpegToPngConvertor(t *testing.T) {
	tempDir := t.TempDir()

	inputPath := filepath.Join(tempDir, "input.jpg")
	outputPath := filepath.Join(tempDir, "output.png")

	writeJPEGFixture(t, inputPath, 100, 80)

	gc := GoConverter{}

	err := gc.Convert(
		context.Background(),
		inputPath,
		outputPath,
	)
	if err != nil {
		t.Fatalf("expected conversion to succeed, got %v", err)
	}

	outputFile, err := os.Open(outputPath)
	if err != nil {
		t.Fatalf("expected output file to exist, got %v", err)
	}
	defer outputFile.Close()

	convertedImage, format, err := image.Decode(outputFile)
	if err != nil {
		t.Fatalf("expected output to be a valid image, got %v", err)
	}

	if format != "png" {
		t.Fatalf("expected output format png, got %s", format)
	}

	bounds := convertedImage.Bounds()

	if bounds.Dx() != 100 {
		t.Fatalf("expected width 100, got %d", bounds.Dx())
	}

	if bounds.Dy() != 80 {
		t.Fatalf("expected height 80, got %d", bounds.Dy())
	}
}

func TestConvert_InvalidInput(t *testing.T) {
	tempDir := t.TempDir()

	inputPath := filepath.Join(tempDir, "invalid.jpg")
	outputPath := filepath.Join(tempDir, "output.png")

	err := os.WriteFile(inputPath,
		[]byte("this is not real jpg"),
		0644)
	if err != nil {
		t.Fatalf("failed to create invalid input: %v", err)
	}

	gc := GoConverter{}

	err = gc.Convert(context.Background(), inputPath, outputPath)
	if err == nil {
		t.Fatal("expected conversion to fail for invalid input")
	}
}

func TestConvert_NonJpegFormat(t *testing.T) {
	tempDir := t.TempDir()

	inputPath := filepath.Join(tempDir, "input.png")
	outputPath := filepath.Join(tempDir, "output.png")

	inputFile, err := os.Create(inputPath)
	if err != nil {
		t.Fatalf("failed to create png input: %v", err)
	}

	img := image.NewRGBA(image.Rect(0, 0, 50, 50))

	if err := png.Encode(inputFile, img); err != nil {
		inputFile.Close()
		t.Fatalf("failed to encode png fixture: %v", err)
	}

	if err := inputFile.Close(); err != nil {
		t.Fatalf("failed to close png fixture: %v", err)
	}

	err = GoConverter{}.Convert(context.Background(), inputPath, outputPath)
	if err != nil {
		t.Fatalf("expected conversion to reject non-JPEG input")
	}

}
