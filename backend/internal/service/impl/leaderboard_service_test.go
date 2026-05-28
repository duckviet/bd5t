package impl

import (
	"context"
	"testing"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type fakeLeaderboardRepository struct {
	listResult *interfaces.LeaderboardResult
	details    map[string]*domain.LeaderboardDetail
}

func (r *fakeLeaderboardRepository) List(context.Context, interfaces.LeaderboardFilter, int, int) (*interfaces.LeaderboardResult, error) {
	return r.listResult, nil
}

func (r *fakeLeaderboardRepository) GetByStudentID(_ context.Context, studentID string) (*domain.LeaderboardDetail, error) {
	return r.details[studentID], nil
}

func TestListLeaderboardMapsStudentID(t *testing.T) {
	repo := &fakeLeaderboardRepository{
		listResult: &interfaces.LeaderboardResult{
			Total: 1,
			Items: []*domain.LeaderboardItem{
				{
					Rank:          1,
					UserID:        "user-1",
					StudentID:     "22040001",
					UserName:      "Nguyen Van A",
					TotalApproved: 3,
					TotalScore:    25,
				},
			},
		},
	}
	service := NewLeaderboardService(repo)

	result, err := service.ListLeaderboard(context.Background(), nil, 1, 20)
	if err != nil {
		t.Fatalf("ListLeaderboard returned error: %v", err)
	}
	if len(result.Items) != 1 {
		t.Fatalf("items = %d, want 1", len(result.Items))
	}
	if result.Items[0].StudentId != "22040001" {
		t.Fatalf("studentId = %q, want 22040001", result.Items[0].StudentId)
	}
}

func TestGetLeaderboardDetailMapsStats(t *testing.T) {
	className := "K56A1"
	repo := &fakeLeaderboardRepository{
		details: map[string]*domain.LeaderboardDetail{
			"22040001": {
				LeaderboardItem: domain.LeaderboardItem{
					Rank:          2,
					UserID:        "user-1",
					StudentID:     "22040001",
					UserName:      "Nguyen Van A",
					ClassName:     &className,
					TotalApproved: 4,
					TotalScore:    40,
				},
				CriteriaStats: []domain.LeaderboardCriteriaStat{
					{Criteria: "DAO_DUC", Label: "Tiêu chí Đạo đức tốt", ApprovedActivities: 2},
					{Criteria: "HOC_TAP", Label: "Tiêu chí Học tập tốt", ApprovedActivities: 1},
					{Criteria: "THE_LUC", Label: "Tiêu chí Thể lực tốt", ApprovedActivities: 0},
					{Criteria: "TINH_NGUYEN", Label: "Tiêu chí Tình nguyện tốt", ApprovedActivities: 1},
					{Criteria: "HOI_NHAP", Label: "Tiêu chí Hội nhập tốt", ApprovedActivities: 0},
				},
			},
		},
	}
	service := NewLeaderboardService(repo)

	detail, err := service.GetLeaderboardDetail(context.Background(), "22040001")
	if err != nil {
		t.Fatalf("GetLeaderboardDetail returned error: %v", err)
	}
	if detail.StudentId != "22040001" || detail.Rank != 2 || detail.TotalApproved != 4 {
		t.Fatalf("detail = %+v, want studentId/rank/totals mapped", detail)
	}
	if detail.ClassName == nil || *detail.ClassName != className {
		t.Fatalf("className = %v, want %q", detail.ClassName, className)
	}
	if len(detail.CriteriaStats) != 5 {
		t.Fatalf("criteria stats = %d, want 5", len(detail.CriteriaStats))
	}
	if detail.CriteriaStats[0].Label != "Đạo đức tốt" {
		t.Fatalf("first criteria label = %q, want Đạo đức tốt", detail.CriteriaStats[0].Label)
	}
}

func TestGetLeaderboardDetailMissingStudent(t *testing.T) {
	service := NewLeaderboardService(&fakeLeaderboardRepository{details: map[string]*domain.LeaderboardDetail{}})

	if _, err := service.GetLeaderboardDetail(context.Background(), "missing"); err == nil {
		t.Fatal("GetLeaderboardDetail accepted missing student")
	}
}
