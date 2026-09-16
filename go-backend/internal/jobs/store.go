package jobs

type JobStatus string
type Operation string

const (
	StatusQueued     = "STATUS_QUEUED"
	StatusProcessing = "STATUS_PROCESSING"
	StatusFailed     = "STATUS_FAILED"
	StatusDone       = "STATUS_DONE"
)

const (
	JpgToPng = "JPG-TO-PNG"
	PngToJpb = "PNG-TO-JPG"
)

type Job struct {
	id          string
	operation   string
	input_path  string
	output_path string
	status      JobStatus
	progress    string
	error       string
	created_at  string
	updated_at  string
}
