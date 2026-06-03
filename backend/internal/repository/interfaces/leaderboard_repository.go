package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type LeaderboardFilter struct {
	UnitID *string
	Search string
}

type LeaderboardResult struct {
	Items []*domain.LeaderboardItem
	Total int
}

type LeaderboardRepository interface {
	List(ctx context.Context, filter LeaderboardFilter, page, pageSize int) (*LeaderboardResult, error)
	GetByStudentID(ctx context.Context, studentID string) (*domain.LeaderboardDetail, error)
}
