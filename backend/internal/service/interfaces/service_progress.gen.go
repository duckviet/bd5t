package interfaces

import "context"

type ProgressAPIService interface {
	GetProgress(ctx context.Context, req interface{}) (interface{}, error)
}
