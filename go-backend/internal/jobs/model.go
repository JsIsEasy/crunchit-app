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
	JpgToPng Operation = "jpg-to-png"
	PngToJpg Operation = "png-to-jpg"
)

type Job struct {
	ID               string
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
