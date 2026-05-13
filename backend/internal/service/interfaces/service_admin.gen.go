package interfaces

import "context"

type AdminAPIService interface {
	CreateActivity (ctx context.Context, req interface{}) (interface{}, error)
	DeleteActivity (ctx context.Context, req interface{}) (interface{}, error)
	ReviewEvidence (ctx context.Context, req interface{}) (interface{}, error)
	UpdateActivity (ctx context.Context, req interface{}) (interface{}, error)
}
