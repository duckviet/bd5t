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

type fakeEvidenceRepoForLeaderboard struct {
	evidences []*domain.Evidence
}

func (r *fakeEvidenceRepoForLeaderboard) List(context.Context, string, interfaces.EvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return &interfaces.EvidenceListResult{Evidences: r.evidences}, nil
}

func (r *fakeEvidenceRepoForLeaderboard) ListAll(context.Context, interfaces.EvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForLeaderboard) GetStats(context.Context) (*interfaces.EvidenceStats, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForLeaderboard) GetByID(context.Context, string) (*domain.Evidence, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForLeaderboard) Create(context.Context, *domain.Evidence) error {
	return nil
}

func (r *fakeEvidenceRepoForLeaderboard) Delete(context.Context, string) error {
	return nil
}

func (r *fakeEvidenceRepoForLeaderboard) UpdateStatus(context.Context, string, string, *string, string, *int, *string) error {
	return nil
}

func (r *fakeEvidenceRepoForLeaderboard) ListAwardEvidences(context.Context, interfaces.AwardEvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForLeaderboard) ListAwardActivities(context.Context, *string, int, int) ([]*domain.AwardActivityOverview, int, error) {
	return nil, 0, nil
}

func (r *fakeEvidenceRepoForLeaderboard) BulkUpdateAwardLevel(context.Context, []string, *string) error {
	return nil
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
	service := NewLeaderboardService(repo, &fakeEvidenceRepoForLeaderboard{})

	result, err := service.ListLeaderboard(context.Background(), nil, "", 1, 20)
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
			},
		},
	}
	evidenceRepo := &fakeEvidenceRepoForLeaderboard{
		evidences: []*domain.Evidence{
			{ID: "e-1", UserID: "user-1", ActivityID: "a-1", ActivityTitle: "Hoạt động 1", Status: domain.StatusApproved, Criteria: []string{string(domain.CriterionTypeDaoDuc)}, AwardLevel: stringPtr(string(domain.AwardLevelNhat))},
			{ID: "e-2", UserID: "user-1", ActivityID: "a-2", ActivityTitle: "Hoạt động 2", Status: domain.StatusApproved, Criteria: []string{string(domain.CriterionTypeDaoDuc)}, AwardLevel: stringPtr(string(domain.AwardLevelNhi))},
			{ID: "e-3", UserID: "user-1", ActivityID: "a-3", ActivityTitle: "Hoạt động 3", Status: domain.StatusApproved, Criteria: []string{string(domain.CriterionTypeHocTap)}},
			{ID: "e-4", UserID: "user-1", ActivityID: "a-4", ActivityTitle: "Hoạt động 4", Status: domain.StatusApproved, Criteria: []string{string(domain.CriterionTypeTinhNguyen)}},
		},
	}
	service := NewLeaderboardService(repo, evidenceRepo)

	detail, err := service.GetLeaderboardDetail(context.Background(), "22040001")
	if err != nil {
		t.Fatalf("GetLeaderboardDetail returned error: %v", err)
	}
	if detail.StudentId != "22040001" || detail.Rank != 2 {
		t.Fatalf("detail = %+v, want studentId/rank mapped", detail)
	}
	if detail.ClassName == nil || *detail.ClassName != className {
		t.Fatalf("className = %v, want %q", detail.ClassName, className)
	}
	if detail.TotalApproved != 4 {
		t.Fatalf("total approved = %d, want 4", detail.TotalApproved)
	}
	if detail.TotalScore != 330 {
		t.Fatalf("total score = %d, want 330", detail.TotalScore)
	}
	if len(detail.CriteriaStats) != 5 {
		t.Fatalf("criteria stats = %d, want 5", len(detail.CriteriaStats))
	}
	if detail.CriteriaStats[0].Label != "Đạo đức tốt" {
		t.Fatalf("first criteria label = %q, want Đạo đức tốt", detail.CriteriaStats[0].Label)
	}
	if detail.CriteriaStats[0].Score != 200 {
		t.Fatalf("DAO_DUC score = %d, want 200", detail.CriteriaStats[0].Score)
	}
	if detail.CriteriaStats[1].Score != 50 {
		t.Fatalf("HOC_TAP score = %d, want 50", detail.CriteriaStats[1].Score)
	}
	if detail.CriteriaStats[3].Score != 80 {
		t.Fatalf("TINH_NGUYEN score = %d, want 80", detail.CriteriaStats[3].Score)
	}
	if len(detail.Awards) != 2 {
		t.Fatalf("awards count = %d, want 2", len(detail.Awards))
	}
	if detail.Awards[0].ActivityTitle != "Hoạt động 1" || detail.Awards[0].AwardLevel != "NHAT" {
		t.Fatalf("first award = %+v, want title Hoạt động 1, level NHAT", detail.Awards[0])
	}
	if detail.Awards[1].ActivityTitle != "Hoạt động 2" || detail.Awards[1].AwardLevel != "NHI" {
		t.Fatalf("second award = %+v, want title Hoạt động 2, level NHI", detail.Awards[1])
	}
}

func TestGetLeaderboardDetailMissingStudent(t *testing.T) {
	service := NewLeaderboardService(&fakeLeaderboardRepository{details: map[string]*domain.LeaderboardDetail{}}, &fakeEvidenceRepoForLeaderboard{})

	if _, err := service.GetLeaderboardDetail(context.Background(), "missing"); err == nil {
		t.Fatal("GetLeaderboardDetail accepted missing student")
	}
}
