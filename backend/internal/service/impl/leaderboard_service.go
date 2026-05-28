package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
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
		items[i] = leaderboardItemToDTO(item)
	}

	return &ListLeaderboardResult{
		Items:    items,
		Total:    result.Total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *LeaderboardService) GetLeaderboardDetail(ctx context.Context, studentID string) (*dto.LeaderboardDetail, error) {
	detail, err := s.leaderboardRepo.GetByStudentID(ctx, studentID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get leaderboard detail")
	}
	if detail == nil {
		return nil, errors.ErrNotFound("Student")
	}

	stats := make([]dto.LeaderboardCriteriaStat, 0, len(detail.CriteriaStats))
	for _, stat := range detail.CriteriaStats {
		stats = append(stats, dto.LeaderboardCriteriaStat{
			Criteria:           stat.Criteria,
			Label:              criteriaLabel(stat.Criteria, stat.Label),
			ApprovedActivities: int32(stat.ApprovedActivities),
		})
	}

	row := leaderboardItemToDTO(&detail.LeaderboardItem)
	return &dto.LeaderboardDetail{
		Rank:          row.Rank,
		UserId:        row.UserId,
		StudentId:     row.StudentId,
		UserName:      row.UserName,
		UnitId:        row.UnitId,
		UnitName:      row.UnitName,
		ClassName:     detail.ClassName,
		TotalApproved: row.TotalApproved,
		TotalScore:    row.TotalScore,
		CriteriaStats: stats,
	}, nil
}

func leaderboardItemToDTO(item *domain.LeaderboardItem) *dto.LeaderboardItem {
	if item == nil {
		return nil
	}

	row := &dto.LeaderboardItem{
		Rank:          int32(item.Rank),
		UserId:        item.UserID,
		StudentId:     item.StudentID,
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
	return row
}

func criteriaLabel(code string, fallback string) string {
	switch code {
	case "DAO_DUC":
		return "Đạo đức tốt"
	case "HOC_TAP":
		return "Học tập tốt"
	case "THE_LUC":
		return "Thể lực tốt"
	case "TINH_NGUYEN":
		return "Tình nguyện tốt"
	case "HOI_NHAP":
		return "Hội nhập tốt"
	default:
		return fallback
	}
}
