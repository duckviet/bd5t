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
	evidenceRepo     interfaces.EvidenceRepository
	activityRepo     interfaces.ActivityRepository
	notificationRepo interfaces.NotificationRepository
	progressSvc      *ProgressService
	activitySvc      *ActivityService
}

func NewAdminService(
	evidenceRepo interfaces.EvidenceRepository,
	activityRepo interfaces.ActivityRepository,
	notificationRepo interfaces.NotificationRepository,
	progressSvc *ProgressService,
) *AdminService {
	return &AdminService{
		evidenceRepo:     evidenceRepo,
		activityRepo:     activityRepo,
		notificationRepo: notificationRepo,
		progressSvc:      progressSvc,
		activitySvc:      NewActivityService(activityRepo),
	}
}

type AdminListEvidencesResult struct {
	Evidences []*dto.EvidenceItem
	Total     int
	Page      int
	PageSize  int
}

func (s *AdminService) ListAdminActivities(ctx context.Context, params *ListActivitiesParams) (*dto.ListActivities200Response, error) {
	return s.activitySvc.ListAdminActivities(ctx, params)
}

func (s *AdminService) ListEvidences(ctx context.Context, filter interfaces.EvidenceFilter, page, pageSize int) (*AdminListEvidencesResult, error) {
	result, err := s.evidenceRepo.ListAll(ctx, filter, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list evidences")
	}

	evidences := make([]*dto.EvidenceItem, len(result.Evidences))
	for i, evidence := range result.Evidences {
		evidences[i] = mapper.DomainToEvidenceItem(evidence)
	}

	return &AdminListEvidencesResult{
		Evidences: evidences,
		Total:     result.Total,
		Page:      page,
		PageSize:  pageSize,
	}, nil
}

func (s *AdminService) GetEvidenceStats(ctx context.Context) (*dto.AdminEvidenceStats, error) {
	stats, err := s.evidenceRepo.GetStats(ctx)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get evidence stats")
	}

	return &dto.AdminEvidenceStats{
		Pending:       int32(stats.Pending),
		ApprovedToday: int32(stats.ApprovedToday),
		RejectedToday: int32(stats.RejectedToday),
		Total:         int32(stats.Total),
	}, nil
}

func (s *AdminService) BulkReviewEvidence(ctx context.Context, adminID string, req *dto.BulkReviewEvidenceRequest) ([]*dto.EvidenceItem, error) {
	if len(req.Ids) == 0 {
		return nil, errors.ErrBadRequest("No evidences selected")
	}
	if req.Status != domain.StatusApproved && req.Status != domain.StatusRejected {
		return nil, errors.ErrBadRequest("Invalid evidence review status")
	}

	reviewed := make([]*dto.EvidenceItem, 0, len(req.Ids))
	for _, id := range req.Ids {
		item, err := s.ReviewEvidence(ctx, adminID, id, &dto.ReviewEvidenceRequest{
			Status:        req.Status,
			ReviewNote:    req.ReviewNote,
			ForceOverride: false,
		})
		if err != nil {
			return nil, err
		}
		reviewed = append(reviewed, item)
	}

	return reviewed, nil
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

	updatedEvidence, err := s.evidenceRepo.GetByID(ctx, evidenceID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get reviewed evidence")
	}
	if updatedEvidence == nil {
		return nil, errors.ErrEvidenceNotFound()
	}

	if err := s.createEvidenceReviewNotification(ctx, updatedEvidence); err != nil {
		return nil, errors.ErrInternalError(err, "failed to create review notification")
	}

	return mapper.DomainToEvidenceItem(updatedEvidence), nil
}

func (s *AdminService) createEvidenceReviewNotification(ctx context.Context, evidence *domain.Evidence) error {
	title := "Minh chứng đã được duyệt"
	message := "Minh chứng của bạn đã được duyệt."
	notificationType := "EVIDENCE_APPROVED"

	if evidence.Status == domain.StatusRejected {
		title = "Minh chứng bị từ chối"
		message = "Minh chứng của bạn đã bị từ chối."
		notificationType = "EVIDENCE_REJECTED"
	}

	if evidence.ActivityTitle != "" {
		if evidence.Status == domain.StatusRejected {
			message = "Minh chứng cho hoạt động \"" + evidence.ActivityTitle + "\" đã bị từ chối."
		} else {
			message = "Minh chứng cho hoạt động \"" + evidence.ActivityTitle + "\" đã được duyệt."
		}
	}

	if evidence.ReviewNote != nil && *evidence.ReviewNote != "" {
		message += " Ghi chú: " + *evidence.ReviewNote
	}

	return s.notificationRepo.Create(ctx, &domain.Notification{
		UserID:  evidence.UserID,
		Title:   title,
		Message: message,
		Type:    notificationType,
		IsRead:  false,
		Data: map[string]interface{}{
			"evidenceId": evidence.ID,
			"activityId": evidence.ActivityID,
			"status":     evidence.Status,
		},
	})
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
