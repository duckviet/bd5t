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
	evidenceRepo    interfaces.EvidenceRepository
}

func NewLeaderboardService(leaderboardRepo interfaces.LeaderboardRepository, evidenceRepo interfaces.EvidenceRepository) *LeaderboardService {
	return &LeaderboardService{leaderboardRepo: leaderboardRepo, evidenceRepo: evidenceRepo}
}

type ListLeaderboardResult struct {
	Items    []*dto.LeaderboardItem
	Total    int
	Page     int
	PageSize int
}

func (s *LeaderboardService) ListLeaderboard(ctx context.Context, unitID *string, search string, page, pageSize int) (*ListLeaderboardResult, error) {
	filter := interfaces.LeaderboardFilter{
		UnitID: unitID,
		Search: search,
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

	approved := domain.StatusApproved
	evidences, err := s.evidenceRepo.List(ctx, detail.UserID, interfaces.EvidenceFilter{Status: &approved}, 1, 1000)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list approved evidences")
	}

	criteriaScores := calculateCriteriaScores(evidences.Evidences)
	stats := make([]dto.LeaderboardCriteriaStat, 0, len(criteriaScores))
	totalScore := 0
	totalApproved := 0
	seenActivities := map[string]struct{}{}
	for _, evidence := range evidences.Evidences {
		if evidence == nil || !evidence.IsApproved() {
			continue
		}
		if _, ok := seenActivities[evidence.ActivityID]; !ok {
			seenActivities[evidence.ActivityID] = struct{}{}
		}
	}
	totalApproved = len(seenActivities)

	for _, stat := range criteriaScores {
		totalScore += stat.Score
		stats = append(stats, dto.LeaderboardCriteriaStat{
			Criteria:           stat.Criteria,
			Label:              criteriaLabel(stat.Criteria, stat.Label),
			ApprovedActivities: int32(stat.ApprovedActivityCount),
			Score:              int32(stat.Score),
			MaxScore:           int32(stat.MaxScore),
			ParticipationScore: int32(stat.ParticipationScore),
			AwardScore:         int32(stat.AwardScore),
			AwardLevel:         string(stat.AwardLevel),
		})
	}

	awards := make([]dto.LeaderboardDetailAwardsInner, 0)
	for _, evidence := range evidences.Evidences {
		if evidence == nil || !evidence.IsApproved() {
			continue
		}
		if evidence.AwardLevel != nil && *evidence.AwardLevel != "" && *evidence.AwardLevel != "NONE" {
			awards = append(awards, dto.LeaderboardDetailAwardsInner{
				ActivityTitle: evidence.ActivityTitle,
				ReviewLevel:   evidence.ReviewLevel,
				AwardLevel:    *evidence.AwardLevel,
			})
		}
	}

	row := leaderboardItemToDTO(&detail.LeaderboardItem)
	row.TotalApproved = int32(totalApproved)
	row.TotalScore = int32(totalScore)
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
		Awards:        awards,
	}, nil
}

func leaderboardItemToDTO(item *domain.LeaderboardItem) *dto.LeaderboardItem {
	if item == nil {
		return nil
	}

	row := &dto.LeaderboardItem{
		Rank:              int32(item.Rank),
		UserId:            item.UserID,
		StudentId:         item.StudentID,
		UserName:          item.UserName,
		TotalApproved:     int32(item.TotalApproved),
		TotalScore:        int32(item.TotalScore),
		HighestAwardLevel: item.HighestAwardLevel,
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
