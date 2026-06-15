package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type ProgressService struct {
	progressRepo interfaces.ProgressRepository
	evidenceRepo interfaces.EvidenceRepository
	activityRepo interfaces.ActivityRepository
}

func NewProgressService(
	progressRepo interfaces.ProgressRepository,
	evidenceRepo interfaces.EvidenceRepository,
	activityRepo interfaces.ActivityRepository,
) *ProgressService {
	return &ProgressService{
		progressRepo: progressRepo,
		evidenceRepo: evidenceRepo,
		activityRepo: activityRepo,
	}
}

func (s *ProgressService) GetProgress(ctx context.Context, userID string) (*dto.ProgressMatrix, error) {
	progressList, err := s.progressRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get progress")
	}

	approved := domain.StatusApproved
	evidenceList, err := s.evidenceRepo.List(ctx, userID, interfaces.EvidenceFilter{Status: &approved}, 1, 1000)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get approved evidences")
	}
	criteriaScores := calculateCriteriaScores(evidenceList.Evidences)

	matrix := &dto.ProgressMatrix{
		UserId:     userID,
		Activities: make([]dto.ProgressMatrixCell, 0, len(progressList)),
	}

	for _, p := range progressList {
		activity, err := s.activityRepo.GetByID(ctx, p.ActivityID)
		if err != nil || activity == nil {
			continue
		}

		cell := dto.ProgressMatrixCell{
			ActivityId:        p.ActivityID,
			ActivityTitle:     activity.Title,
			TotalScore:        int32(p.TotalScore),
			CompletedCriteria: make([]dto.ProgressMatrixCellCompletedCriteriaInner, 0, len(p.CompletedCriteria)),
		}

		for _, c := range p.CompletedCriteria {
			criteriaID := c.CriteriaDocID
			if criteriaID == "" {
				criteriaID = c.CriteriaID
			}
			criteriaTitle := c.CriteriaDocTitle
			if criteriaTitle == "" {
				criteriaTitle = c.CriteriaTitle
			}
			cell.CompletedCriteria = append(cell.CompletedCriteria, dto.ProgressMatrixCellCompletedCriteriaInner{
				CriteriaDocId:    criteriaID,
				CriteriaDocTitle: criteriaTitle,
				Score:            int32(c.Score),
				EvidenceCount:    int32(c.EvidenceCount),
			})
		}

		matrix.Activities = append(matrix.Activities, cell)
	}

	matrix.CriteriaScores = make([]dto.ProgressMatrixCriteriaScoresInner, 0, len(criteriaScores))
	for _, score := range criteriaScores {
		matrix.CriteriaScores = append(matrix.CriteriaScores, dto.ProgressMatrixCriteriaScoresInner{
			Criteria:              score.Criteria,
			Label:                 score.Label,
			Score:                 int32(score.Score),
			MaxScore:              int32(score.MaxScore),
			ParticipationScore:    int32(score.ParticipationScore),
			AwardScore:            int32(score.AwardScore),
			ApprovedActivityCount: int32(score.ApprovedActivityCount),
			AwardLevel:            string(score.AwardLevel),
		})
	}

	return matrix, nil
}

func (s *ProgressService) RecalculateProgress(ctx context.Context, userID string) error {
	activities, err := s.activityRepo.List(ctx, nil, 1, 1000)
	if err != nil {
		return errors.ErrInternalError(err, "failed to list activities")
	}

	for _, activity := range activities.Activities {
		if err := s.RecalculateForUserActivity(ctx, userID, activity.ID); err != nil {
			return err
		}
	}

	return nil
}

// RecalculateForUserActivity recalculates total score for a specific user and activity
// by summing approved evidence scores.
func (s *ProgressService) RecalculateForUserActivity(ctx context.Context, userID, activityID string) error {
	// Use evidenceRepo.List to fetch approved evidences for the user and activity
	filter := interfaces.EvidenceFilter{ActivityID: &activityID}
	res, err := s.evidenceRepo.List(ctx, userID, filter, 1, 1000)
	if err != nil {
		return errors.ErrInternalError(err, "failed to list evidences for progress recalc")
	}

	scores := calculateCriteriaScores(res.Evidences)
	completedCriteria := make([]domain.CompletedCriteria, 0, len(scores))
	total := 0
	for _, score := range scores {
		if score.Score == 0 {
			continue
		}

		completedCriteria = append(completedCriteria, domain.CompletedCriteria{
			CriteriaID:         score.Criteria,
			CriteriaType:       score.Criteria,
			CriteriaTitle:      score.Label,
			CriteriaDocID:      score.Criteria,
			CriteriaDocTitle:   score.Label,
			Score:              score.Score,
			ParticipationScore: score.ParticipationScore,
			AwardScore:         score.AwardScore,
			AwardLevel:         string(score.AwardLevel),
			EvidenceCount:      score.ApprovedActivityCount,
		})
		total += score.Score
	}

	progress := &domain.Progress{
		UserID:     userID,
		ActivityID: activityID,
		TotalScore: total,
	}

	if len(completedCriteria) > 0 {
		progress.CompletedCriteria = completedCriteria
	}

	if err := s.progressRepo.Upsert(ctx, progress); err != nil {
		return errors.ErrInternalError(err, "failed to upsert progress")
	}

	return nil
}
