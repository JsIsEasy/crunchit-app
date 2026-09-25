package conversion

import (
	"context"
	"fmt"
	"image"
	_ "image/jpeg"
	"image/png"
	"os"
)

type Converter interface {
	Convert(ctx context.Context, inputPath string, outputPath string) error
}

type JPEGToPNGConverter struct{}
type PNGToJPEGConverter struct{}

func NewJpegToPngConverter() *JPEGToPNGConverter {
	return &JPEGToPNGConverter{}
}

func NewPngToJpegConverter() *PNGToJPEGConverter {
	return &PNGToJPEGConverter{}
}

func (JPEGToPNGConverter) Convert(ctx context.Context, inputPath string, outputPath string) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	inputF, err := os.Open(inputPath)
	if err != nil {
		return fmt.Errorf("file opening failed: %w", err)
	}
	defer inputF.Close()

	img, format, err := image.Decode(inputF)
	if err != nil {
		return fmt.Errorf("jpeg image decoding failed: %w", err)
	}

	if format != "jpeg" {
		return fmt.Errorf("unsupported input format: expected jpeg, got %v", format)
	}

	pngFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer pngFile.Close()

	err = png.Encode(pngFile, img)
	if err != nil {
		return fmt.Errorf("failed to encode file: %w", err)
	}

	return nil
}

func (PNGToJPEGConverter) Convert(ctx context.Context, inputPath string, outputPath string) error {
	return nil
}
