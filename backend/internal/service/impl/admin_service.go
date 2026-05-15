package impl

import (
	"context"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/duckviet/bd5t/backend/pkg/pointer"
)

type AdminService struct {
	evidenceRepo interfaces.EvidenceRepository
	activityRepo interfaces.ActivityRepository
	progressSvc  *ProgressService
}

func NewAdminService(
	evidenceRepo interfaces.EvidenceRepository,
	activityRepo interfaces.ActivityRepository,
	progressSvc *ProgressService,
) *AdminService {
	return &AdminService{
		evidenceRepo: evidenceRepo,
		activityRepo: activityRepo,
		progressSvc:  progressSvc,
	}
}

func (s *AdminService) ReviewEvidence(ctx context.Context, adminID, evidenceID string, req *dto.ReviewEvidenceRequest) (*dto.EvidenceItem, error) {
	evidence, err := s.evidenceRepo.GetByID(ctx, evidenceID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get evidence")
	}
	if evidence == nil {
		return nil, errors.ErrEvidenceNotFound()
	}

	if !evidence.IsPending() && !req.ForceOverride {
		return nil, errors.ErrEvidenceAlreadyReviewed()
	}

	var reviewNote *string
	if req.ReviewNote != nil {
		reviewNote = req.ReviewNote
	}

	// Convert optional score from request to *int for repository
	var scorePtr *int
	if req.Score != nil {
		v := int(*req.Score)
		scorePtr = &v
	}

	if err := s.evidenceRepo.UpdateStatus(ctx, evidenceID, req.Status, reviewNote, adminID, scorePtr); err != nil {
		return nil, errors.ErrInternalError(err, "failed to update evidence status")
	}

	evidence.Status = req.Status
	evidence.ReviewNote = reviewNote
	reviewedAt := time.Now()
	evidence.ReviewedAt = &reviewedAt
	evidence.ReviewedBy = &adminID

	// After status update, if approved, recalculate progress for the user/activity
	if req.Status == domain.StatusApproved {
		// best-effort recalc; not wrapped in the same DB transaction currently
		if err := s.progressSvc.RecalculateForUserActivity(ctx, evidence.UserID, evidence.ActivityID); err != nil {
			return nil, errors.ErrInternalError(err, "failed to recalc progress")
		}
	}

	return mapper.DomainToEvidenceItem(evidence), nil
}

func (s *AdminService) CreateActivity(ctx context.Context, req *dto.CreateActivityRequest) (*dto.ActivityDetail, error) {
	existing, err := s.activityRepo.GetBySlug(ctx, req.Slug)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to check slug existence")
	}
	if existing != nil {
		return nil, errors.ErrActivitySlugExists()
	}

	activity := &domain.Activity{
		Title:    req.Title,
		IsActive: true,
	}

	if req.Description != nil {
		activity.Description = req.Description
	}
	activity.Slug = pointer.ToPtr(req.Slug)
	if req.ThumbnailUrl != nil {
		activity.ThumbnailURL = req.ThumbnailUrl
	}
	if req.ShortDescription != nil {
		activity.ShortDescription = req.ShortDescription
	}
	if req.Location != nil {
		activity.Location = req.Location
	}
	if req.TargetAudience != nil {
		activity.TargetAudience = req.TargetAudience
	}
	if req.Rules != nil {
		activity.Rules = req.Rules
	}
	if req.Rewards != nil {
		activity.Rewards = req.Rewards
	}
	if req.ContactInfo != nil {
		activity.ContactInfo = req.ContactInfo
	}
	if req.UnitId != nil {
		activity.UnitID = req.UnitId
	}
	if req.RegistrationUrl != nil {
		activity.RegistrationURL = req.RegistrationUrl
	}
	if req.ReviewLevel != nil {
		activity.ReviewLevel = req.ReviewLevel
	}
	if req.Organizer != nil {
		activity.Organizer = req.Organizer
	}

	if req.StartDate != nil {
		startDate, err := time.Parse("2006-01-02", *req.StartDate)
		if err == nil {
			activity.StartDate = &startDate
		}
	}
	if req.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *req.EndDate)
		if err == nil {
			activity.EndDate = &endDate
		}
	}

	created, err := s.activityRepo.Create(ctx, activity)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to create activity")
	}

	if len(req.Criteria) > 0 {
		if err := s.activityRepo.SetCriteria(ctx, created.ID, req.Criteria); err != nil {
			return nil, errors.ErrInternalError(err, "failed to set activity criteria")
		}
	}

	criteria, err := s.activityRepo.GetCriteriaDocsByActivityID(ctx, created.ID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get activity criteria")
	}

	return mapper.ActivityToDetailDTO(created, criteria), nil
}

func (s *AdminService) UpdateActivity(ctx context.Context, id string, req *dto.UpdateActivityRequest) (*dto.ActivityDetail, error) {
	activity, err := s.activityRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get activity")
	}
	if activity == nil {
		return nil, errors.ErrActivityNotFound()
	}

	if req.Title != "" {
		activity.Title = req.Title
	}
	if req.Description != nil {
		activity.Description = req.Description
	}
	if req.Slug != "" {
		activity.Slug = pointer.ToPtr(req.Slug)
	}
	if req.ThumbnailUrl != nil {
		activity.ThumbnailURL = req.ThumbnailUrl
	}
	if req.ShortDescription != nil {
		activity.ShortDescription = req.ShortDescription
	}
	if req.Location != nil {
		activity.Location = req.Location
	}
	if req.TargetAudience != nil {
		activity.TargetAudience = req.TargetAudience
	}
	if req.Rules != nil {
		activity.Rules = req.Rules
	}
	if req.Rewards != nil {
		activity.Rewards = req.Rewards
	}
	if req.ContactInfo != nil {
		activity.ContactInfo = req.ContactInfo
	}
	if req.UnitId != nil {
		activity.UnitID = req.UnitId
	}
	if req.StartDate != nil {
		startDate, err := time.Parse("2006-01-02", *req.StartDate)
		if err == nil {
			activity.StartDate = &startDate
		}
	}
	if req.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *req.EndDate)
		if err == nil {
			activity.EndDate = &endDate
		}
	}
	if req.IsActive != nil {
		activity.IsActive = *req.IsActive
	}
	if req.RegistrationUrl != nil {
		activity.RegistrationURL = req.RegistrationUrl
	}
	if req.ReviewLevel != nil {
		activity.ReviewLevel = req.ReviewLevel
	}
	if req.Organizer != nil {
		activity.Organizer = req.Organizer
	}

	updated, err := s.activityRepo.Update(ctx, id, activity)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to update activity")
	}

	if req.Criteria != nil {
		if err := s.activityRepo.SetCriteria(ctx, id, req.Criteria); err != nil {
			return nil, errors.ErrInternalError(err, "failed to update activity criteria")
		}
	}

	criteria, err := s.activityRepo.GetCriteriaDocsByActivityID(ctx, id)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get activity criteria")
	}

	return mapper.ActivityToDetailDTO(updated, criteria), nil
}

func (s *AdminService) DeleteActivity(ctx context.Context, id string) error {
	activity, err := s.activityRepo.GetByID(ctx, id)
	if err != nil {
		return errors.ErrInternalError(err, "failed to get activity")
	}
	if activity == nil {
		return errors.ErrActivityNotFound()
	}

	if err := s.activityRepo.Delete(ctx, id); err != nil {
		return errors.ErrInternalError(err, "failed to delete activity")
	}

	return nil
}
