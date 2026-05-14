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
	if req.ReviewNote != "" {
		reviewNote = pointer.ToPtr(req.ReviewNote)
	}

	if err := s.evidenceRepo.UpdateStatus(ctx, evidenceID, req.Status, reviewNote, adminID); err != nil {
		return nil, errors.ErrInternalError(err, "failed to update evidence status")
	}

	evidence.Status = req.Status
	evidence.ReviewNote = reviewNote
	reviewedAt := time.Now()
	evidence.ReviewedAt = &reviewedAt
	evidence.ReviewedBy = &adminID

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
		Title:            req.Title,
		IsActive:         true,
	}

	if req.Description != "" {
		activity.Description = pointer.ToPtr(req.Description)
	}
	activity.Slug = pointer.ToPtr(req.Slug)
	if req.ThumbnailUrl != "" {
		activity.ThumbnailURL = pointer.ToPtr(req.ThumbnailUrl)
	}
	if req.ShortDescription != "" {
		activity.ShortDescription = pointer.ToPtr(req.ShortDescription)
	}
	if req.Location != "" {
		activity.Location = pointer.ToPtr(req.Location)
	}
	if req.TargetAudience != "" {
		activity.TargetAudience = pointer.ToPtr(req.TargetAudience)
	}
	if req.Rules != "" {
		activity.Rules = pointer.ToPtr(req.Rules)
	}
	if req.Rewards != "" {
		activity.Rewards = pointer.ToPtr(req.Rewards)
	}
	if req.ContactInfo != "" {
		activity.ContactInfo = pointer.ToPtr(req.ContactInfo)
	}
	if req.UnitId != "" {
		activity.UnitID = pointer.ToPtr(req.UnitId)
	}
	if req.RegistrationUrl != "" {
		activity.RegistrationURL = pointer.ToPtr(req.RegistrationUrl)
	}
	if req.ReviewLevel != "" {
		activity.ReviewLevel = pointer.ToPtr(req.ReviewLevel)
	}
	if req.Organizer != "" {
		activity.Organizer = pointer.ToPtr(req.Organizer)
	}

	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			activity.StartDate = &startDate
		}
	}
	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			activity.EndDate = &endDate
		}
	}

	created, err := s.activityRepo.Create(ctx, activity)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to create activity")
	}

	return mapper.ActivityToDetailDTO(created, nil), nil
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
	if req.Description != "" {
		activity.Description = pointer.ToPtr(req.Description)
	}
	if req.Slug != "" {
		activity.Slug = pointer.ToPtr(req.Slug)
	}
	if req.ThumbnailUrl != "" {
		activity.ThumbnailURL = pointer.ToPtr(req.ThumbnailUrl)
	}
	if req.ShortDescription != "" {
		activity.ShortDescription = pointer.ToPtr(req.ShortDescription)
	}
	if req.Location != "" {
		activity.Location = pointer.ToPtr(req.Location)
	}
	if req.TargetAudience != "" {
		activity.TargetAudience = pointer.ToPtr(req.TargetAudience)
	}
	if req.Rules != "" {
		activity.Rules = pointer.ToPtr(req.Rules)
	}
	if req.Rewards != "" {
		activity.Rewards = pointer.ToPtr(req.Rewards)
	}
	if req.ContactInfo != "" {
		activity.ContactInfo = pointer.ToPtr(req.ContactInfo)
	}
	if req.UnitId != "" {
		activity.UnitID = pointer.ToPtr(req.UnitId)
	}
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			activity.StartDate = &startDate
		}
	}
	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			activity.EndDate = &endDate
		}
	}
	if req.IsActive {
		activity.IsActive = req.IsActive
	}
	if req.RegistrationUrl != "" {
		activity.RegistrationURL = pointer.ToPtr(req.RegistrationUrl)
	}
	if req.ReviewLevel != "" {
		activity.ReviewLevel = pointer.ToPtr(req.ReviewLevel)
	}
	if req.Organizer != "" {
		activity.Organizer = pointer.ToPtr(req.Organizer)
	}

	updated, err := s.activityRepo.Update(ctx, id, activity)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to update activity")
	}

	return mapper.ActivityToDetailDTO(updated, nil), nil
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
