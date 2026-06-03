package impl

import (
	"context"
	"fmt"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/logger"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type NotificationService struct {
	notificationRepo interfaces.NotificationRepository
}

func NewNotificationService(notificationRepo interfaces.NotificationRepository) *NotificationService {
	return &NotificationService{notificationRepo: notificationRepo}
}

type ActivityNotificationResult struct {
	Created      int `json:"created"`
	Skipped      int `json:"skipped"`
	MatchedUsers int `json:"matchedUsers"`
}

type ListNotificationsResult struct {
	Items    []*dto.NotificationItem
	Total    int
	Page     int
	PageSize int
}

func (s *NotificationService) ListNotifications(ctx context.Context, userID string, page, pageSize int) (*ListNotificationsResult, error) {
	notifications, total, err := s.notificationRepo.ListByUser(ctx, userID, page, pageSize)
	if err != nil {
		logger.Error().Err(err).Str("user_id", userID).Msg("failed to list notifications")
		return nil, errors.ErrInternalError(err, "failed to list notifications")
	}

	items := make([]*dto.NotificationItem, len(notifications))
	for i, notification := range notifications {
		items[i] = mapper.DomainToNotificationItem(notification)
	}

	logger.Debug().Str("user_id", userID).Int("count", len(items)).Msg("successfully listed notifications")
	return &ListNotificationsResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *NotificationService) MarkNotificationRead(ctx context.Context, userID string, notificationID string) (*dto.NotificationItem, error) {
	notification, err := s.notificationRepo.MarkRead(ctx, userID, notificationID)
	if err != nil {
		logger.Error().Err(err).Str("user_id", userID).Str("notification_id", notificationID).Msg("failed to mark notification as read")
		return nil, errors.ErrInternalError(err, "failed to mark notification as read")
	}
	if notification == nil {
		logger.Warn().Str("user_id", userID).Str("notification_id", notificationID).Msg("notification not found to mark as read")
		return nil, errors.ErrNotificationNotFound()
	}

	logger.Log().Str("user_id", userID).Str("notification_id", notificationID).Msg("marked notification as read")
	return mapper.DomainToNotificationItem(notification), nil
}

func (s *NotificationService) MarkAllNotificationsRead(ctx context.Context, userID string) (map[string]int64, error) {
	updated, err := s.notificationRepo.MarkAllRead(ctx, userID)
	if err != nil {
		logger.Error().Err(err).Str("user_id", userID).Msg("failed to mark all notifications as read")
		return nil, errors.ErrInternalError(err, "failed to mark notifications as read")
	}

	logger.Log().Str("user_id", userID).Int64("updated_count", updated).Msg("marked all notifications as read")
	return map[string]int64{"updated": updated}, nil
}

func (s *NotificationService) NotifyActivityNew(ctx context.Context, activityID string) (*ActivityNotificationResult, error) {
	logger.Log().Str("activity_id", activityID).Msg("starting single activity new notification")
	batchKey := fmt.Sprintf("activity-new:%s", activityID)
	result, err := s.notifyActivity(ctx, activityID, domain.NotificationTypeActivityNew, batchKey, 0)
	if err != nil {
		logger.Error().Err(err).Str("activity_id", activityID).Msg("failed single activity new notification")
		return nil, err
	}
	logger.Log().
		Str("activity_id", activityID).
		Int("created", result.Created).
		Int("skipped", result.Skipped).
		Int("matched_users", result.MatchedUsers).
		Msg("finished single activity new notification")
	return result, nil
}

func (s *NotificationService) NotifyActivitiesBulk(ctx context.Context, activityIDs []string, notificationType string) (*ActivityNotificationResult, error) {
	if len(activityIDs) == 0 {
		return nil, errors.ErrBadRequest("No activities selected")
	}
	if notificationType == "" {
		notificationType = domain.NotificationTypeActivityNew
	}
	if notificationType != domain.NotificationTypeActivityNew && notificationType != domain.NotificationTypeSuggestion {
		return nil, errors.ErrBadRequest("Invalid activity notification type")
	}

	logger.Log().
		Strs("activity_ids", activityIDs).
		Str("notification_type", notificationType).
		Msg("starting bulk activity notification")

	total := &ActivityNotificationResult{}
	batchDate := time.Now().Format("2006-01-02")
	for _, activityID := range activityIDs {
		batchKey := fmt.Sprintf("activity-new:%s", activityID)
		if notificationType == domain.NotificationTypeSuggestion {
			batchKey = fmt.Sprintf("suggestion:%s:%s", activityID, batchDate)
		}

		result, err := s.notifyActivity(ctx, activityID, notificationType, batchKey, 0)
		if err != nil {
			logger.Error().
				Err(err).
				Str("activity_id", activityID).
				Str("notification_type", notificationType).
				Msg("failed in middle of bulk activity notification")
			return nil, err
		}
		total.Created += result.Created
		total.Skipped += result.Skipped
		total.MatchedUsers += result.MatchedUsers
	}

	logger.Log().
		Int("total_activities", len(activityIDs)).
		Str("notification_type", notificationType).
		Int("total_created", total.Created).
		Int("total_skipped", total.Skipped).
		Int("total_matched_users", total.MatchedUsers).
		Msg("finished bulk activity notification")

	return total, nil
}

func (s *NotificationService) NotifyDeadlineSoon(ctx context.Context, days int) (*ActivityNotificationResult, error) {
	if days != 3 && days != 7 {
		return nil, errors.ErrBadRequest("days must be 3 or 7")
	}

	logger.Log().Int("days", days).Msg("starting deadline soon notifications run")

	activityIDs, err := s.notificationRepo.ListDeadlineSoonActivityIDs(ctx, days)
	if err != nil {
		logger.Error().Err(err).Int("days", days).Msg("failed to list deadline soon activities")
		return nil, errors.ErrInternalError(err, "failed to list deadline activities")
	}

	logger.Log().Int("days", days).Int("activities_count", len(activityIDs)).Msg("found deadline soon activities")

	total := &ActivityNotificationResult{}
	batchDate := time.Now().Format("2006-01-02")
	for _, activityID := range activityIDs {
		batchKey := fmt.Sprintf("deadline:%s:%d:%s", activityID, days, batchDate)
		result, err := s.notifyActivity(ctx, activityID, domain.NotificationTypeActivityDeadlineSoon, batchKey, days)
		if err != nil {
			logger.Error().
				Err(err).
				Str("activity_id", activityID).
				Int("days", days).
				Msg("failed in middle of deadline soon notification loop")
			return nil, err
		}
		total.Created += result.Created
		total.Skipped += result.Skipped
		total.MatchedUsers += result.MatchedUsers
	}

	logger.Log().
		Int("days", days).
		Int("total_created", total.Created).
		Int("total_skipped", total.Skipped).
		Int("total_matched_users", total.MatchedUsers).
		Msg("finished deadline soon notifications run")

	return total, nil
}

func (s *NotificationService) GenerateSuggestions(ctx context.Context, batchDate time.Time) (*ActivityNotificationResult, error) {
	logger.Log().Time("batch_date", batchDate).Msg("starting generating activity suggestions")
	activityIDs, err := s.notificationRepo.ListActiveActivityIDs(ctx)
	if err != nil {
		logger.Error().Err(err).Msg("failed to list active activities for suggestion generation")
		return nil, errors.ErrInternalError(err, "failed to list active activities")
	}

	logger.Log().Int("activities_count", len(activityIDs)).Msg("found active activities for suggestion generation")

	total := &ActivityNotificationResult{}
	dateKey := batchDate.Format("2006-01-02")
	for _, activityID := range activityIDs {
		batchKey := fmt.Sprintf("suggestion:%s:%s", activityID, dateKey)
		result, err := s.notifyActivity(ctx, activityID, domain.NotificationTypeSuggestion, batchKey, 0)
		if err != nil {
			logger.Error().Err(err).Str("activity_id", activityID).Msg("failed in middle of generate suggestions loop")
			return nil, err
		}
		total.Created += result.Created
		total.Skipped += result.Skipped
		total.MatchedUsers += result.MatchedUsers
	}

	logger.Log().
		Int("total_created", total.Created).
		Int("total_skipped", total.Skipped).
		Int("total_matched_users", total.MatchedUsers).
		Msg("finished generating activity suggestions")

	return total, nil
}

func (s *NotificationService) notifyActivity(ctx context.Context, activityID, notificationType, batchKey string, daysRemaining int) (*ActivityNotificationResult, error) {
	recipients, err := s.notificationRepo.ListActivityNotificationRecipients(ctx, activityID, notificationType)
	if err != nil {
		logger.Error().
			Err(err).
			Str("activity_id", activityID).
			Str("notification_type", notificationType).
			Msg("failed to list activity notification recipients")
		return nil, errors.ErrInternalError(err, "failed to list activity notification recipients")
	}

	result := &ActivityNotificationResult{MatchedUsers: len(recipients)}
	for _, recipient := range recipients {
		notification := buildActivityNotification(recipient, notificationType, batchKey, daysRemaining)
		created, err := s.notificationRepo.CreateIdempotent(ctx, notification)
		if err != nil {
			logger.Error().
				Err(err).
				Str("activity_id", activityID).
				Str("recipient_user_id", recipient.UserID).
				Msg("failed to create idempotent notification for recipient")
			return nil, errors.ErrInternalError(err, "failed to create activity notification")
		}
		if created {
			result.Created++
		} else {
			result.Skipped++
		}
	}

	logger.Debug().
		Str("activity_id", activityID).
		Str("notification_type", notificationType).
		Str("batch_key", batchKey).
		Int("matched_users", result.MatchedUsers).
		Int("created", result.Created).
		Int("skipped", result.Skipped).
		Msg("processed notification recipients for activity")

	return result, nil
}

func buildActivityNotification(recipient *interfaces.ActivityNotificationRecipient, notificationType, batchKey string, daysRemaining int) *domain.Notification {
	primaryCriteria := ""
	if len(recipient.Criteria) > 0 {
		primaryCriteria = recipient.Criteria[0]
	}

	title := "Hoạt động mới phù hợp"
	message := fmt.Sprintf("Hoạt động \"%s\" phù hợp với tiêu chí bạn còn thiếu.", recipient.ActivityTitle)

	switch notificationType {
	case domain.NotificationTypeActivityDeadlineSoon:
		title = "Hoạt động sắp hết hạn"
		message = fmt.Sprintf("Hoạt động \"%s\" còn %d ngày để hoàn thành.", recipient.ActivityTitle, daysRemaining)
	case domain.NotificationTypeSuggestion:
		title = "Gợi ý hoạt động"
		message = fmt.Sprintf("Bạn có thể tham gia \"%s\" để hoàn thiện tiêu chí còn thiếu.", recipient.ActivityTitle)
	}

	data := map[string]interface{}{
		"activityId":    recipient.ActivityID,
		"activitySlug":  recipient.ActivitySlug,
		"criteria":      primaryCriteria,
		"criteriaCodes": recipient.Criteria,
		"reviewLevel":   recipient.ReviewLevel,
		"batchKey":      batchKey,
	}
	if notificationType == domain.NotificationTypeActivityDeadlineSoon {
		data["daysRemaining"] = daysRemaining
		if recipient.EndDate != nil {
			data["endAt"] = recipient.EndDate.Format("2006-01-02")
		}
	}

	return &domain.Notification{
		UserID:  recipient.UserID,
		Title:   title,
		Message: message,
		Type:    notificationType,
		IsRead:  false,
		Data:    data,
	}
}
