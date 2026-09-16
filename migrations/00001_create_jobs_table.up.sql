CREATE TYPE job_status AS ENUM (
    'queued',
    'processing',
    'ready',
    'failed'
);

CREATE TYPE conversion_operation as ENUM (
    'jpg-to-png',
    'png-to-jpg'
);

CREATE TABLE conversion_jobs (
    id TEXT PRIMARY KEY,
    operation conversion_operation NOT NULL,
    original_filename TEXT NOT NULL,
    input_path TEXT NOT NULL,
    output_path TEXT,
    status job_status NOT NULL DEFAULT 'queued',
    progress INTEGER NOT NULL DEFAULT 0 
        CHECK(progress between 0 AND 100),
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversion_jobs_status_created 
ON conversion_jobs (status, created_at);