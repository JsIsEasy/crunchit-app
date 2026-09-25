package jobs

import (
	"context"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"
	"testing"
)

type DummyTestStore struct {
	JobDB map[string]Job
}

func (s *DummyTestStore) CreateJob(ctx context.Context, job Job) error {
	s.JobDB[job.ID] = job
	return nil
}

type DummyTestConverter struct{}

func (DummyTestConverter) Convert(ctx context.Context, inputPath string, outputPath string) error {
	return nil
}

func writeJPEGFixture(
	t *testing.T,
	path string,
	width int,
	height int,
) {
	t.Helper()

	file, err := os.Create(path)
	if err != nil {
		t.Fatalf("TestCreateJob: failed to create jpeg fixture: %v", err)
	}

	img := image.NewRGBA(image.Rect(0, 0, width, height))

	if err := jpeg.Encode(file, img, nil); err != nil {
		file.Close()
		t.Fatalf("TestCreateJob: failed to encode jpeg fixture: %v", err)
	}

	if err := file.Close(); err != nil {
		t.Fatalf("TestCreateJob: failed to close jpeg fixture: %v", err)
	}
}

func NewDummyStore() *DummyTestStore {
	return &DummyTestStore{
		JobDB: make(map[string]Job)}
}

func NewDummyConverter() DummyTestConverter {
	return DummyTestConverter{}
}

func newTestService(t *testing.T) (*Service, *DummyTestStore) {
	t.Helper()

	store := NewDummyStore()
	converter := NewDummyConverter()

	return NewService(store, converter, t.TempDir()), store
}

func TestCreateJob(t *testing.T) {
	service, store := newTestService(t)

	fileName := "input.jpg"

	inputPath := filepath.Join(t.TempDir(), fileName)
	writeJPEGFixture(t, inputPath, 100, 100)

	file, err := os.Open(inputPath)
	if err != nil {
		t.Fatalf("failed to open input file: %v", err)
	}
	defer file.Close()

	ctx := context.Background()

	job, err := service.CreateJob(ctx, JpgToPng, fileName, file)
	if err != nil {
		t.Fatalf("expected job creation to succeed, got: %v", err)
	}

	if job.Status != StatusQueued {
		t.Fatalf("expected Status=%s, got %s", StatusQueued, job.Status)
	}

	if job.Progress != 0 {
		t.Fatalf("expected Progress=0, got %d", job.Progress)
	}

	if job.Operation != JpgToPng {
		t.Fatalf("expected Operation=%s, got %s", JpgToPng, job.Operation)
	}

	if job.OriginalFilename != fileName {
		t.Fatalf("expected Job.OriginalFilename=%s, got %s", fileName, job.OriginalFilename)
	}

	savedJob, exists := store.JobDB[job.ID]
	if !exists {
		t.Fatalf("expected job to be saved in store")
	}

	if savedJob.OriginalFilename != fileName {
		t.Fatalf("expected filename %s, got %s", fileName, savedJob.OriginalFilename)
	}

}
