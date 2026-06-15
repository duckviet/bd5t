package impl

import (
	"slices"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

var criteriaScoreOrder = []string{
	string(domain.CriterionTypeDaoDuc),
	string(domain.CriterionTypeHocTap),
	string(domain.CriterionTypeTheLuc),
	string(domain.CriterionTypeTinhNguyen),
	string(domain.CriterionTypeHoiNhap),
}

func calculateCriteriaScores(evidences []*domain.Evidence) []domain.CriteriaScore {
	type aggregate struct {
		activityIDs map[string]struct{}
		awardScore  int
	}

	aggregates := make(map[string]*aggregate, len(criteriaScoreOrder))
	for _, criteria := range criteriaScoreOrder {
		aggregates[criteria] = &aggregate{activityIDs: map[string]struct{}{}}
	}

	for _, evidence := range evidences {
		if evidence == nil || !evidence.IsApproved() {
			continue
		}

		criteriaCodes := evidenceCriteriaCodes(evidence)
		if len(criteriaCodes) == 0 {
			continue
		}

		awardScore := awardScoreForLevel(evidence.AwardLevel)
		for _, criteria := range criteriaCodes {
			agg, ok := aggregates[criteria]
			if !ok {
				continue
			}

			agg.activityIDs[evidence.ActivityID] = struct{}{}
			if awardScore > agg.awardScore {
				agg.awardScore = awardScore
			}
		}
	}

	results := make([]domain.CriteriaScore, 0, len(criteriaScoreOrder))
	for _, criteria := range criteriaScoreOrder {
		agg := aggregates[criteria]
		count := len(agg.activityIDs)
		participationScore := participationScoreForCriteria(criteria, count)
		awardScore := agg.awardScore
		total := participationScore + awardScore
		if total > 200 {
			total = 200
		}

		results = append(results, domain.CriteriaScore{
			Criteria:              criteria,
			Label:                 criteriaDisplayLabel(criteria),
			Score:                 total,
			MaxScore:              200,
			ParticipationScore:    participationScore,
			AwardScore:            awardScore,
			ApprovedActivityCount: count,
			AwardLevel:            awardLevelForScore(awardScore),
		})
	}

	return results
}

func evidenceCriteriaCodes(evidence *domain.Evidence) []string {
	if evidence == nil {
		return nil
	}

	codes := make([]string, 0, len(evidence.Criteria)+1)
	codes = append(codes, evidence.Criteria...)
	if len(codes) == 0 && evidence.CriterionType != nil {
		codes = append(codes, *evidence.CriterionType)
	}

	if len(codes) == 0 {
		return nil
	}

	unique := make([]string, 0, len(codes))
	seen := map[string]struct{}{}
	for _, code := range codes {
		if code == "" {
			continue
		}
		if _, ok := seen[code]; ok {
			continue
		}
		seen[code] = struct{}{}
		unique = append(unique, code)
	}

	slices.Sort(unique)
	return unique
}

func participationScoreForCriteria(criteria string, count int) int {
	switch criteria {
	case string(domain.CriterionTypeTinhNguyen):
		switch {
		case count >= 5:
			return 200
		case count >= 3:
			return 120
		case count >= 1:
			return 80
		default:
			return 0
		}
	default:
		switch {
		case count >= 2:
			return 100
		case count == 1:
			return 50
		default:
			return 0
		}
	}
}

func awardScoreForLevel(level *string) int {
	if level == nil {
		return 0
	}

	switch domain.AwardLevel(*level) {
	case domain.AwardLevelKhuyenKhich:
		return 85
	case domain.AwardLevelBa:
		return 90
	case domain.AwardLevelNhi:
		return 95
	case domain.AwardLevelNhat:
		return 100
	default:
		return 0
	}
}

func awardLevelForScore(score int) domain.AwardLevel {
	switch score {
	case 85:
		return domain.AwardLevelKhuyenKhich
	case 90:
		return domain.AwardLevelBa
	case 95:
		return domain.AwardLevelNhi
	case 100:
		return domain.AwardLevelNhat
	default:
		return domain.AwardLevelNone
	}
}

func criteriaDisplayLabel(code string) string {
	switch code {
	case string(domain.CriterionTypeDaoDuc):
		return "Đạo đức tốt"
	case string(domain.CriterionTypeHocTap):
		return "Học tập tốt"
	case string(domain.CriterionTypeTheLuc):
		return "Thể lực tốt"
	case string(domain.CriterionTypeTinhNguyen):
		return "Tình nguyện tốt"
	case string(domain.CriterionTypeHoiNhap):
		return "Hội nhập tốt"
	default:
		return code
	}
}
