package impl

import (
	"context"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
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

	if err := s.evidenceRepo.UpdateStatus(ctx, evidenceID, req.Status, req.ReviewNote, adminID); err != nil {
		return nil, errors.ErrInternalError(err, "failed to update evidence status")
	}

	evidence.Status = req.Status
	evidence.ReviewNote = req.ReviewNote
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
		Description:      req.Description,
		Slug:             &req.Slug,
		ThumbnailURL:     req.ThumbnailUrl,
		ShortDescription: req.ShortDescription,
		Location:         req.Location,
		TargetAudience:    req.TargetAudience,
		Rules:            req.Rules,
		Rewards:          req.Rewards,
		ContactInfo:      req.ContactInfo,
		UnitID:           req.UnitId,
		RegistrationURL:  req.RegistrationUrl,
		ReviewLevel:      req.ReviewLevel,
		Organizer:        req.Organizer,
		IsActive:         true,
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
	if req.Description != nil {
		activity.Description = req.Description
	}
	if req.Slug != "" {
		activity.Slug = &req.Slug
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
	if req.IsActive {
		activity.IsActive = req.IsActive
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
