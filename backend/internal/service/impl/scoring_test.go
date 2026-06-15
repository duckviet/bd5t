package impl

import (
	"testing"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

func TestCalculateCriteriaScoresRewardsAndCaps(t *testing.T) {
	evidences := []*domain.Evidence{
		{
			ID:         "e-1",
			ActivityID: "a-1",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeDaoDuc)},
			AwardLevel: stringPtr(string(domain.AwardLevelNhat)),
		},
		{
			ID:         "e-2",
			ActivityID: "a-2",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeDaoDuc)},
			AwardLevel: stringPtr(string(domain.AwardLevelNhi)),
		},
		{
			ID:         "e-3",
			ActivityID: "a-2",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeDaoDuc)},
			AwardLevel: stringPtr(string(domain.AwardLevelKhuyenKhich)),
		},
	}

	scores := calculateCriteriaScores(evidences)
	got := scoreByCriteria(scores, string(domain.CriterionTypeDaoDuc))
	if got.Score != 200 {
		t.Fatalf("DAO_DUC score = %d, want 200", got.Score)
	}
	if got.ParticipationScore != 100 {
		t.Fatalf("DAO_DUC participation = %d, want 100", got.ParticipationScore)
	}
	if got.AwardScore != 100 {
		t.Fatalf("DAO_DUC award = %d, want 100", got.AwardScore)
	}
	if got.ApprovedActivityCount != 2 {
		t.Fatalf("DAO_DUC approved activities = %d, want 2", got.ApprovedActivityCount)
	}
}

func TestCalculateCriteriaScoresVolunteerThresholds(t *testing.T) {
	evidences := []*domain.Evidence{
		{
			ID:         "v-1",
			ActivityID: "va-1",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeTinhNguyen)},
		},
		{
			ID:         "v-2",
			ActivityID: "va-2",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeTinhNguyen)},
		},
		{
			ID:         "v-3",
			ActivityID: "va-3",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeTinhNguyen)},
		},
		{
			ID:         "v-4",
			ActivityID: "va-4",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeTinhNguyen)},
		},
		{
			ID:         "v-5",
			ActivityID: "va-5",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeTinhNguyen)},
		},
	}

	scores := calculateCriteriaScores(evidences)
	got := scoreByCriteria(scores, string(domain.CriterionTypeTinhNguyen))
	if got.Score != 200 {
		t.Fatalf("TINH_NGUYEN score = %d, want 200", got.Score)
	}
	if got.ParticipationScore != 200 {
		t.Fatalf("TINH_NGUYEN participation = %d, want 200", got.ParticipationScore)
	}
	if got.AwardScore != 0 {
		t.Fatalf("TINH_NGUYEN award = %d, want 0", got.AwardScore)
	}
}

func TestCalculateCriteriaScoresDeduplicatesActivityPerCriterion(t *testing.T) {
	evidences := []*domain.Evidence{
		{
			ID:         "d-1",
			ActivityID: "dup-activity",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeHocTap)},
			AwardLevel: stringPtr(string(domain.AwardLevelNhat)),
		},
		{
			ID:         "d-2",
			ActivityID: "dup-activity",
			Status:     domain.StatusApproved,
			Criteria:   []string{string(domain.CriterionTypeHocTap)},
			AwardLevel: stringPtr(string(domain.AwardLevelBa)),
		},
	}

	scores := calculateCriteriaScores(evidences)
	got := scoreByCriteria(scores, string(domain.CriterionTypeHocTap))
	if got.ApprovedActivityCount != 1 {
		t.Fatalf("HOC_TAP approved activities = %d, want 1", got.ApprovedActivityCount)
	}
	if got.Score != 150 {
		t.Fatalf("HOC_TAP score = %d, want 150", got.Score)
	}
}

func scoreByCriteria(scores []domain.CriteriaScore, criteria string) domain.CriteriaScore {
	for _, score := range scores {
		if score.Criteria == criteria {
			return score
		}
	}

	return domain.CriteriaScore{}
}
