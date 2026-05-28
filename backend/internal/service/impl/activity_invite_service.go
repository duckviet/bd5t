package impl

import (
	"context"
	"fmt"
	"strings"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

const maxActivityInviteRecipients = 50

type ActivityInviteService struct {
	activityRepo     interfaces.ActivityRepository
	notificationRepo interfaces.NotificationRepository
	userRepo         interfaces.UserRepository
}

func NewActivityInviteService(
	activityRepo interfaces.ActivityRepository,
	notificationRepo interfaces.NotificationRepository,
	userRepo interfaces.UserRepository,
) *ActivityInviteService {
	return &ActivityInviteService{
		activityRepo:     activityRepo,
		notificationRepo: notificationRepo,
		userRepo:         userRepo,
	}
}

func (s *ActivityInviteService) InviteActivity(ctx context.Context, slug string, inviterID string, req *dto.InviteActivityRequest) (*dto.InviteActivityResult, error) {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return nil, errors.ErrBadRequest("Slug is required")
	}
	if req == nil || len(req.UserIds) == 0 {
		return nil, errors.ErrBadRequest("At least one user must be selected")
	}

	userIDs := uniqueNonEmptyStrings(req.UserIds)
	if len(userIDs) == 0 {
		return nil, errors.ErrBadRequest("At least one user must be selected")
	}
	if len(userIDs) > maxActivityInviteRecipients {
		return nil, errors.ErrBadRequest("Cannot invite more than 50 users at once")
	}

	activity, err := s.activityRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get activity")
	}
	if activity == nil {
		return nil, errors.ErrActivityNotFound()
	}

	inviter, err := s.userRepo.GetByID(ctx, inviterID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get inviter")
	}
	if inviter == nil {
		return nil, errors.ErrUserNotFound()
	}

	invitees, err := s.userRepo.ListStudentsByIDs(ctx, userIDs, inviterID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list invite recipients")
	}

	batchKey := fmt.Sprintf("activity-invite:%s:%s", activity.ID, inviter.ID)
	result := &dto.InviteActivityResult{MatchedUsers: int32(len(invitees))}
	for _, invitee := range invitees {
		created, err := s.notificationRepo.CreateIdempotent(ctx, buildActivityInviteNotification(activity, inviter, invitee.ID, batchKey))
		if err != nil {
			return nil, errors.ErrInternalError(err, "failed to create invite notification")
		}
		if created {
			result.Created++
		} else {
			result.Skipped++
		}
	}

	return result, nil
}

func buildActivityInviteNotification(activity *domain.Activity, inviter *domain.User, inviteeID string, batchKey string) *domain.Notification {
	inviterName := displayNameForInvite(inviter)
	activityTitle := activity.Title
	activitySlug := ""
	if activity.Slug != nil {
		activitySlug = *activity.Slug
	}

	return &domain.Notification{
		UserID:  inviteeID,
		Title:   "Lời mời tham gia hoạt động",
		Message: fmt.Sprintf("%s đã mời bạn tham gia \"%s\".", inviterName, activityTitle),
		Type:    domain.NotificationTypeActivityInvite,
		IsRead:  false,
		Data: map[string]interface{}{
			"activityId":    activity.ID,
			"activitySlug":  activitySlug,
			"activityTitle": activityTitle,
			"inviterId":     inviter.ID,
			"inviterName":   inviterName,
			"batchKey":      batchKey,
		},
	}
}

func displayNameForInvite(user *domain.User) string {
	if user == nil {
		return "Một sinh viên"
	}
	if user.DisplayName != nil && strings.TrimSpace(*user.DisplayName) != "" {
		return strings.TrimSpace(*user.DisplayName)
	}
	if user.StudentID != nil && strings.TrimSpace(*user.StudentID) != "" {
		return strings.TrimSpace(*user.StudentID)
	}
	if strings.TrimSpace(user.Email) != "" {
		return strings.TrimSpace(user.Email)
	}
	return "Một sinh viên"
}

func uniqueNonEmptyStrings(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	result := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}
