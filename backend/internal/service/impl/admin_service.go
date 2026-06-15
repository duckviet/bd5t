package impl

import (
	"context"
	"fmt"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/duckviet/bd5t/backend/pkg/pointer"
)

type AwardEvidenceFilter struct {
	ActivityID *string
	AwardLevel *string
	UnitID     *string
	Search     *string
}

type AwardEvidenceResult struct {
	Evidences []*dto.EvidenceItem
	Total     int
	Page      int
	PageSize  int
}

type AdminService struct {
	evidenceRepo     interfaces.EvidenceRepository
	activityRepo     interfaces.ActivityRepository
	notificationRepo interfaces.NotificationRepository
	notificationSvc  *NotificationService
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
		notificationSvc:  NewNotificationService(notificationRepo),
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

	var awardLevelPtr *string
	if req.AwardLevel != nil && *req.AwardLevel != string(domain.AwardLevelNone) {
		awardLevelPtr = req.AwardLevel
	}

	var scorePtr *int
	if req.Status == domain.StatusApproved {
		score := awardScoreForLevel(awardLevelPtr)
		scorePtr = &score
	}

	if err := s.evidenceRepo.UpdateStatus(ctx, evidenceID, req.Status, reviewNote, adminID, scorePtr, awardLevelPtr); err != nil {
		return nil, errors.ErrInternalError(err, "failed to update evidence status")
	}

	evidence.Status = req.Status
	evidence.ReviewNote = reviewNote
	evidence.AwardLevel = awardLevelPtr
	evidence.Score = scorePtr
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

	if updatedEvidence.Status == domain.StatusApproved && updatedEvidence.AwardLevel != nil && *updatedEvidence.AwardLevel != string(domain.AwardLevelNone) && *updatedEvidence.AwardLevel != "" {
		if err := s.createAwardNotification(ctx, updatedEvidence); err != nil {
			return nil, errors.ErrInternalError(err, "failed to create award notification")
		}
	}

	return mapper.DomainToEvidenceItem(updatedEvidence), nil
}

func (s *AdminService) createAwardNotification(ctx context.Context, evidence *domain.Evidence) error {
	if evidence.AwardLevel == nil || *evidence.AwardLevel == "" || *evidence.AwardLevel == string(domain.AwardLevelNone) {
		return nil
	}

	activity, err := s.activityRepo.GetByID(ctx, evidence.ActivityID)
	if err != nil {
		return err
	}

	var activitySlug string
	var activityTitle string
	if activity != nil {
		activityTitle = activity.Title
		if activity.Slug != nil {
			activitySlug = *activity.Slug
		}
	} else {
		activityTitle = evidence.ActivityTitle
	}

	awardLabel := getAwardLevelLabel(*evidence.AwardLevel)
	title := "Bạn đã nhận được giải thưởng!"
	var message string
	if activityTitle != "" {
		message = fmt.Sprintf("Chúc mừng! Bạn đã nhận được giải %s cho hoạt động \"%s\".", awardLabel, activityTitle)
	} else {
		message = fmt.Sprintf("Chúc mừng! Bạn đã nhận được giải %s cho hoạt động.", awardLabel)
	}

	data := map[string]interface{}{
		"evidenceId":   evidence.ID,
		"activityId":   evidence.ActivityID,
		"awardLevel":   *evidence.AwardLevel,
		"activitySlug": activitySlug,
	}

	return s.notificationRepo.Create(ctx, &domain.Notification{
		UserID:  evidence.UserID,
		Title:   title,
		Message: message,
		Type:    domain.NotificationTypeAwardReceived,
		IsRead:  false,
		Data:    data,
	})
}

func getAwardLevelLabel(level string) string {
	switch level {
	case "NHAT":
		return "Nhất"
	case "NHI":
		return "Nhì"
	case "BA":
		return "Ba"
	case "KHUYEN_KHICH":
		return "Khuyến khích"
	default:
		return level
	}
}

func (s *AdminService) createEvidenceReviewNotification(ctx context.Context, evidence *domain.Evidence) error {
	content := buildEvidenceReviewNotificationContent(evidence)

	return s.notificationRepo.Create(ctx, &domain.Notification{
		UserID:  evidence.UserID,
		Title:   content.title,
		Message: content.message,
		Type:    content.notificationType,
		IsRead:  false,
		Data:    buildEvidenceReviewNotificationData(evidence),
	})
}

type evidenceReviewNotificationContent struct {
	title            string
	message          string
	notificationType string
}

func buildEvidenceReviewNotificationContent(evidence *domain.Evidence) evidenceReviewNotificationContent {
	title := "Minh chứng đã được duyệt"
	message := "Minh chứng của bạn đã được duyệt."
	notificationType := domain.NotificationTypeEvidenceApproved

	if evidence.Status == domain.StatusRejected {
		title = "Minh chứng bị từ chối"
		message = "Minh chứng của bạn đã bị từ chối."
		notificationType = domain.NotificationTypeEvidenceRejected
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

	return evidenceReviewNotificationContent{
		title:            title,
		message:          message,
		notificationType: notificationType,
	}
}

func buildEvidenceReviewNotificationData(evidence *domain.Evidence) map[string]interface{} {
	return map[string]interface{}{
		"evidenceId": evidence.ID,
		"activityId": evidence.ActivityID,
		"status":     evidence.Status,
	}
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

	if req.NotifyMatchedUsers {
		if _, err := s.notificationSvc.NotifyActivityNew(ctx, created.ID); err != nil {
			return nil, err
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

func (s *AdminService) NotifyActivityNew(ctx context.Context, activityID string) (*ActivityNotificationResult, error) {
	return s.notificationSvc.NotifyActivityNew(ctx, activityID)
}

func (s *AdminService) NotifyActivitiesBulk(ctx context.Context, activityIDs []string, notificationType string) (*ActivityNotificationResult, error) {
	return s.notificationSvc.NotifyActivitiesBulk(ctx, activityIDs, notificationType)
}

type AwardActivityOverviewDTO struct {
	ActivityID    string            `json:"activityId"`
	ActivityTitle string            `json:"activityTitle"`
	ReviewLevel   *string           `json:"reviewLevel,omitempty"`
	Criteria      []string          `json:"criteria,omitempty"`
	AwardStats    AwardStatsDTO     `json:"awardStats"`
	TotalStudents int               `json:"totalStudents"`
	Students      []AwardStudentDTO `json:"students,omitempty"`
}

type AwardStatsDTO struct {
	Nhat        int `json:"NHAT"`
	Nhi         int `json:"NHI"`
	Ba          int `json:"BA"`
	KhuyenKhich int `json:"KHUYEN_KHICH"`
	None        int `json:"NONE"`
}

type AwardStudentDTO struct {
	UserID        string             `json:"userId"`
	UserFullName  *string            `json:"userFullName,omitempty"`
	UserStudentID *string            `json:"userStudentId,omitempty"`
	ClassName     *string            `json:"className,omitempty"`
	Evidences     []AwardEvidenceDTO `json:"evidences,omitempty"`
}

type AwardEvidenceDTO struct {
	EvidenceID  string     `json:"evidenceId"`
	Criteria    string     `json:"criteria"`
	AwardLevel  *string    `json:"awardLevel,omitempty"`
	Score       *int       `json:"score,omitempty"`
	FileURL     *string    `json:"fileUrl,omitempty"`
	Description *string    `json:"description,omitempty"`
	CreatedAt   *time.Time `json:"createdAt,omitempty"`
}

type ListAwardActivitiesResult struct {
	Activities []*AwardActivityOverviewDTO
	Total      int
	Page       int
	PageSize   int
}

func (s *AdminService) ListAwardActivities(ctx context.Context, search *string, page, pageSize int) (*ListAwardActivitiesResult, error) {
	activities, total, err := s.evidenceRepo.ListAwardActivities(ctx, search, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list award activities")
	}

	dtos := make([]*AwardActivityOverviewDTO, len(activities))
	for i, a := range activities {
		students := make([]AwardStudentDTO, len(a.Students))
		for j, st := range a.Students {
			evidences := make([]AwardEvidenceDTO, len(st.Evidences))
			for k, ev := range st.Evidences {
				evidences[k] = AwardEvidenceDTO{
					EvidenceID:  ev.EvidenceID,
					Criteria:    ev.Criteria,
					AwardLevel:  ev.AwardLevel,
					Score:       ev.Score,
					FileURL:     ev.FileURL,
					Description: ev.Description,
					CreatedAt:   ev.CreatedAt,
				}
			}
			students[j] = AwardStudentDTO{
				UserID:        st.UserID,
				UserFullName:  st.UserFullName,
				UserStudentID: st.UserStudentID,
				ClassName:     st.ClassName,
				Evidences:     evidences,
			}
		}

		dtos[i] = &AwardActivityOverviewDTO{
			ActivityID:    a.ActivityID,
			ActivityTitle: a.ActivityTitle,
			ReviewLevel:   a.ReviewLevel,
			Criteria:      a.Criteria,
			TotalStudents: a.TotalStudents,
			AwardStats: AwardStatsDTO{
				Nhat:        a.AwardStats.Nhat,
				Nhi:         a.AwardStats.Nhi,
				Ba:          a.AwardStats.Ba,
				KhuyenKhich: a.AwardStats.KhuyenKhich,
				None:        a.AwardStats.None,
			},
			Students: students,
		}
	}

	return &ListAwardActivitiesResult{
		Activities: dtos,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *AdminService) NotifyDeadlineSoon(ctx context.Context, days int) (*ActivityNotificationResult, error) {
	return s.notificationSvc.NotifyDeadlineSoon(ctx, days)
}

func (s *AdminService) ListAwardEvidences(ctx context.Context, filter AwardEvidenceFilter, page, pageSize int) (*AwardEvidenceResult, error) {
	repoFilter := interfaces.AwardEvidenceFilter{
		ActivityID: filter.ActivityID,
		AwardLevel: filter.AwardLevel,
		UnitID:     filter.UnitID,
		Search:     filter.Search,
	}

	result, err := s.evidenceRepo.ListAwardEvidences(ctx, repoFilter, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list award evidences")
	}

	items := make([]*dto.EvidenceItem, len(result.Evidences))
	for i, evidence := range result.Evidences {
		items[i] = mapper.DomainToEvidenceItem(evidence)
	}

	return &AwardEvidenceResult{
		Evidences: items,
		Total:     result.Total,
		Page:      page,
		PageSize:  pageSize,
	}, nil
}

func (s *AdminService) BulkUpdateAwardLevel(ctx context.Context, ids []string, awardLevel string) ([]*dto.EvidenceItem, error) {
	if len(ids) == 0 {
		return nil, errors.ErrBadRequest("No evidences selected")
	}

	var awardLevelPtr *string
	if awardLevel != string(domain.AwardLevelNone) {
		awardLevelPtr = &awardLevel
	}

	if err := s.evidenceRepo.BulkUpdateAwardLevel(ctx, ids, awardLevelPtr); err != nil {
		return nil, errors.ErrInternalError(err, "failed to bulk update award levels")
	}

	result := make([]*dto.EvidenceItem, 0, len(ids))
	for _, id := range ids {
		evidence, err := s.evidenceRepo.GetByID(ctx, id)
		if err != nil || evidence == nil {
			continue
		}
		if evidence.IsApproved() {
			if err := s.progressSvc.RecalculateForUserActivity(ctx, evidence.UserID, evidence.ActivityID); err != nil {
				continue
			}
			if evidence.AwardLevel != nil && *evidence.AwardLevel != "" && *evidence.AwardLevel != string(domain.AwardLevelNone) {
				_ = s.createAwardNotification(ctx, evidence)
			}
		}
		result = append(result, mapper.DomainToEvidenceItem(evidence))
	}

	return result, nil
}
