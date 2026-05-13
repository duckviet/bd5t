package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type EvidenceFilter struct {
	ActivityID *string
	Status     *string
}

type EvidenceListResult struct {
	Evidences []*domain.Evidence
	Total     int
}

type EvidenceRepository interface {
	List(ctx context.Context, userID string, filter EvidenceFilter, page, pageSize int) (*EvidenceListResult, error)
	GetByID(ctx context.Context, id string) (*domain.Evidence, error)
	Create(ctx context.Context, evidence *domain.Evidence) error
	Delete(ctx context.Context, id string) error
	UpdateStatus(ctx context.Context, id string, status string, reviewNote *string, reviewedBy string) error
}
