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

	return matrix, nil
}

func (s *ProgressService) RecalculateProgress(ctx context.Context, userID string) error {
	activities, err := s.activityRepo.List(ctx, nil, 1, 1000)
	if err != nil {
		return errors.ErrInternalError(err, "failed to list activities")
	}

	for _, activity := range activities.Activities {
		criteriaDocs, err := s.activityRepo.GetCriteriaDocsByActivityID(ctx, activity.ID)
		if err != nil {
			continue
		}

		var totalScore int
		var completedCriteria []domain.CompletedCriteria

		for _, cd := range criteriaDocs {
			approvedCount := 0
			for i := 0; i < cd.MaxScore; i++ {
				approvedCount++
			}

			completedCriteria = append(completedCriteria, domain.CompletedCriteria{
				CriteriaID:       cd.CriteriaID,
				CriteriaType:     string(cd.CriteriaType),
				CriteriaTitle:    cd.Title,
				CriteriaDocID:    cd.ID,
				CriteriaDocTitle: cd.Title,
				Score:            cd.MaxScore,
				EvidenceCount:    approvedCount,
			})
			totalScore += cd.MaxScore
		}

		progress := &domain.Progress{
			UserID:     userID,
			ActivityID: activity.ID,
			TotalScore: totalScore,
		}

		if len(completedCriteria) > 0 {
			progress.CompletedCriteria = completedCriteria
		}

		if err := s.progressRepo.Upsert(ctx, progress); err != nil {
			return errors.ErrInternalError(err, "failed to upsert progress")
		}
	}

	return nil
}
