package jobs

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"

	"github.com/crunchit/internal/testutil"
)

type DummyTestStore struct {
	JobDB map[string]Job
	Err   error
}

func (s *DummyTestStore) CreateJob(ctx context.Context, job Job) error {
	if s.Err != nil {
		return s.Err
	}

	s.JobDB[job.ID] = job
	return nil
}

type DummyTestConverter struct{}

func (DummyTestConverter) Convert(ctx context.Context, inputPath string, outputPath string) error {
	return nil
}

func NewDummyStore(err error) *DummyTestStore {
	if err != nil {
		return &DummyTestStore{
			JobDB: make(map[string]Job),
			Err:   err}
	}

	return &DummyTestStore{
		JobDB: make(map[string]Job)}
}

func NewDummyConverter() DummyTestConverter {
	return DummyTestConverter{}
}

func newTestService(t *testing.T, err error) (*Service, *DummyTestStore) {
	t.Helper()

	store := NewDummyStore(err)
	converter := NewDummyConverter()

	return NewService(store, converter, t.TempDir()), store
}

type failingReader struct {
	Err error
}

func (f *failingReader) Read([]byte) (int, error) {
	return 0, f.Err
}

func TestCreateJob(t *testing.T) {
	service, store := newTestService(t, nil)

	fileName := "input.jpg"

	inputPath := filepath.Join(t.TempDir(), fileName)
	testutil.WriteJPEGFixture(t, inputPath, 100, 100)

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

func TestCreateJob_StoreFailure(t *testing.T) {
	expectedError := errors.New("database is unavailable")
	service, _ := newTestService(t, expectedError)

	dir := t.TempDir()

	filePath := filepath.Join(dir, "input.jpg")

	testutil.WriteJPEGFixture(t, filePath, 100, 100)

	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open input file: %v", err)
	}
	defer file.Close()

	ctx := context.Background()

	_, err = service.CreateJob(ctx, JpgToPng, "input.jpg", file)
	if !errors.Is(err, expectedError) {
		t.Fatalf("expected creation job error %v, got: %v", expectedError, err)
	}
}

func TestCreateJob_ContextCancelled(t *testing.T) {
	service, _ := newTestService(t, nil)

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	dir := t.TempDir()

	filePath := filepath.Join(dir, "input.jpg")

	testutil.WriteJPEGFixture(t, filePath, 100, 100)

	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open input file: %v", err)
	}
	defer file.Close()

	_, err = service.CreateJob(ctx, JpgToPng, "input.jpg", file)
	if err != nil {
		t.Fatalf("expected to fail with cancelled context, got %v", err)
	}
}

func TestCreateJob_InputReadFailure(t *testing.T) {
	service, _ := newTestService(t, nil)

	dir := t.TempDir()

	filePath := filepath.Join(dir, "input.jpg")

	testutil.WriteJPEGFixture(t, filePath, 100, 100)

	uploadErr := errors.New("upload stream failed")

	reader := &failingReader{
		Err: uploadErr,
	}
	_, err := service.CreateJob(context.Background(), JpgToPng, "input.jpg", reader)
	if err == nil {
		t.Fatalf("expected to save file upload, got not error")
	}
}
