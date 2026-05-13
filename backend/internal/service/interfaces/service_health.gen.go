package interfaces

import "context"

type HealthAPIService interface {
	Healthz(ctx context.Context, req interface{}) (interface{}, error)
	Readyz(ctx context.Context, req interface{}) (interface{}, error)
}
