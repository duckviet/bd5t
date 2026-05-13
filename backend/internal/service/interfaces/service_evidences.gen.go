package interfaces

import "context"

type EvidencesAPIService interface {
	CreateEvidence(ctx context.Context, req interface{}) (interface{}, error)
	DeleteEvidence(ctx context.Context, req interface{}) (interface{}, error)
	ListEvidences(ctx context.Context, req interface{}) (interface{}, error)
}
