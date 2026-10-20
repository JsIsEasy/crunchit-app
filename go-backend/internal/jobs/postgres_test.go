package jobs

import (
	"context"
	"testing"

	"github.com/crunchit/internal/testutil"
)

func TestPostgresContainer(t *testing.T) {
	ctx := context.Background()
	testDB := testutil.StartPostgres(ctx, t, "../../../migrations")

	if err := testDB.Pool.Ping(ctx); err != nil {
		t.Fatalf("expected database to be reachable: %v", err)
	}
}
