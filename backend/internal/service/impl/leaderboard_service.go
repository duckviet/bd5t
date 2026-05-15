package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type LeaderboardService struct {
	leaderboardRepo interfaces.LeaderboardRepository
}

func NewLeaderboardService(leaderboardRepo interfaces.LeaderboardRepository) *LeaderboardService {
	return &LeaderboardService{leaderboardRepo: leaderboardRepo}
}

type ListLeaderboardResult struct {
	Items    []*dto.LeaderboardItem
	Total    int
	Page     int
	PageSize int
}

func (s *LeaderboardService) ListLeaderboard(ctx context.Context, unitID *string, page, pageSize int) (*ListLeaderboardResult, error) {
	filter := interfaces.LeaderboardFilter{
		UnitID: unitID,
	}

	result, err := s.leaderboardRepo.List(ctx, filter, page, pageSize)
	if err != nil {
		return nil, err
	}

	items := make([]*dto.LeaderboardItem, len(result.Items))
	for i, item := range result.Items {
		row := &dto.LeaderboardItem{
			Rank:          int32(item.Rank),
			UserId:        item.UserID,
			UserName:      item.UserName,
			TotalApproved: int32(item.TotalApproved),
			TotalScore:    int32(item.TotalScore),
		}
		if item.UnitID != nil {
			row.UnitId = item.UnitID
		}
		if item.UnitName != nil {
			row.UnitName = item.UnitName
		}
		items[i] = row
	}

	return &ListLeaderboardResult{
		Items:    items,
		Total:    result.Total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}
