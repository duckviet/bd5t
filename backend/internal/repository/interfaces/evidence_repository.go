package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type EvidenceFilter struct {
	ActivityID    *string
	Status        *string
	Search        *string
	Criteria      *string
	SubmittedFrom *string
	SubmittedTo   *string
	UnitID        *string
	ClassName     *string
	Sort          *string
	AwardLevel    *string
	AwardOnly     *bool
}

type AwardEvidenceFilter struct {
	ActivityID *string
	AwardLevel *string
	UnitID     *string
	Search     *string
}

type EvidenceListResult struct {
	Evidences []*domain.Evidence
	Total     int
}

type EvidenceStats struct {
	Pending       int
	ApprovedToday int
	RejectedToday int
	Total         int
}

type EvidenceRepository interface {
	List(ctx context.Context, userID string, filter EvidenceFilter, page, pageSize int) (*EvidenceListResult, error)
	ListAll(ctx context.Context, filter EvidenceFilter, page, pageSize int) (*EvidenceListResult, error)
	GetStats(ctx context.Context) (*EvidenceStats, error)
	GetByID(ctx context.Context, id string) (*domain.Evidence, error)
	Create(ctx context.Context, evidence *domain.Evidence) error
	Delete(ctx context.Context, id string) error
	UpdateStatus(ctx context.Context, id string, status string, reviewNote *string, reviewedBy string, score *int, awardLevel *string) error
	ListAwardEvidences(ctx context.Context, filter AwardEvidenceFilter, page, pageSize int) (*EvidenceListResult, error)
	BulkUpdateAwardLevel(ctx context.Context, ids []string, awardLevel *string) error
	ListAwardActivities(ctx context.Context, search *string, page, pageSize int) ([]*domain.AwardActivityOverview, int, error)
}
