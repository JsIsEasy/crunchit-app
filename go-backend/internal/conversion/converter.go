package conversion

import (
	"context"
	"fmt"
	"image"
	_ "image/jpeg"
	"image/png"
	"os"
)

type ProgressFunc func(progress int) error

type Converter interface {
	Convert(ctx context.Context, inputPath string, outputPath string, reportProgress ProgressFunc) error
}

type JPEGToPNGConverter struct{}
type PNGToJPEGConverter struct{}

func NewJpegToPngConverter() *JPEGToPNGConverter {
	return &JPEGToPNGConverter{}
}

func NewPngToJpegConverter() *PNGToJPEGConverter {
	return &PNGToJPEGConverter{}
}

func (JPEGToPNGConverter) Convert(ctx context.Context, inputPath string, outputPath string, updateProgress ProgressFunc) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	err := updateProgress(10)
	if err != nil {
		return err
	}

	inputF, err := os.Open(inputPath)

	if err != nil {
		return fmt.Errorf("file opening failed: %w", err)
	}
	defer inputF.Close()

	err = updateProgress(30)
	if err != nil {
		return err
	}

	img, format, err := image.Decode(inputF)

	if err != nil {
		return fmt.Errorf("jpeg image decoding failed: %w", err)
	}

	err = updateProgress(50)
	if err != nil {
		return err
	}

	if format != "jpeg" {
		return fmt.Errorf("unsupported input format: expected jpeg, got %v", format)
	}

	pngFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer pngFile.Close()

	err = updateProgress(80)
	if err != nil {
		return err
	}

	err = png.Encode(pngFile, img)
	if err != nil {
		return fmt.Errorf("failed to encode file: %w", err)
	}

	err = updateProgress(100)
	if err != nil {
		return err
	}

	return nil
}

func (PNGToJPEGConverter) Convert(ctx context.Context, inputPath string, outputPath string) error {
	return nil
}
