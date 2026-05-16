package interfaces

import "context"

type AdminAPIService interface {
	BulkReviewEvidence (ctx context.Context, req interface{}) (interface{}, error)
	CreateActivity (ctx context.Context, req interface{}) (interface{}, error)
	DeleteActivity (ctx context.Context, req interface{}) (interface{}, error)
	GetAdminEvidenceStats (ctx context.Context, req interface{}) (interface{}, error)
	ListAdminActivities (ctx context.Context, req interface{}) (interface{}, error)
	ListAdminEvidences (ctx context.Context, req interface{}) (interface{}, error)
	ReviewEvidence (ctx context.Context, req interface{}) (interface{}, error)
	UpdateActivity (ctx context.Context, req interface{}) (interface{}, error)
}
