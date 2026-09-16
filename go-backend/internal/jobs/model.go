package jobs

import "time"

type JobStatus string
type Operation string

const (
	StatusQueued     JobStatus = "queued"
	StatusProcessing JobStatus = "processing"
	StatusFailed     JobStatus = "failed"
	StatusReady      JobStatus = "ready"
)

const (
	JpgToPng = "jpg-to-png"
	PngToJpg = "png-to-jpg"
)

type Job struct {
	Id               string
	Operation        Operation
	OriginalFilename string
	InputPath        string
	OutputPath       string
	Status           JobStatus
	Progress         int
	Error            string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
