package mapper

import (
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
)

func UnitToDTO(unit *domain.Unit) *dto.UnitItem {
	if unit == nil {
		return nil
	}

	dtoItem := &dto.UnitItem{
		Id:   unit.ID,
		Name: unit.Name,
		Code: unit.Code,
	}
	if unit.Description != nil {
		dtoItem.Description = *unit.Description
	}
	return dtoItem
}

func UnitsToDTO(units []*domain.Unit) []*dto.UnitItem {
	result := make([]*dto.UnitItem, len(units))
	for i, u := range units {
		result[i] = UnitToDTO(u)
	}
	return result
}

func formatDatePtr(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format("2006-01-02")
}

func ActivityToItemDTO(activity *domain.Activity) *dto.ActivityItem {
	if activity == nil {
		return nil
	}

	dtoItem := &dto.ActivityItem{
		Id:       activity.ID,
		Title:    activity.Title,
		UnitId:   activity.UnitID,
		IsActive: activity.IsActive,
	}

	if activity.Slug != nil {
		dtoItem.Slug = *activity.Slug
	}
	if activity.ShortDescription != nil {
		dtoItem.ShortDescription = *activity.ShortDescription
	}
	if activity.Location != nil {
		dtoItem.Location = activity.Location
	}
	if activity.TargetAudience != nil {
		dtoItem.TargetAudience = activity.TargetAudience
	}
	if activity.Rules != nil {
		dtoItem.Rules = activity.Rules
	}
	if activity.Rewards != nil {
		dtoItem.Rewards = activity.Rewards
	}
	if activity.ContactInfo != nil {
		dtoItem.ContactInfo = activity.ContactInfo
	}
	if activity.ThumbnailURL != nil {
		dtoItem.ThumbnailUrl = *activity.ThumbnailURL
	}
	if activity.StartDate != nil {
		dtoItem.StartDate = formatDatePtr(activity.StartDate)
	}
	if activity.EndDate != nil {
		dtoItem.EndDate = formatDatePtr(activity.EndDate)
	}

	return dtoItem
}

func ActivitiesToItemDTO(activities []*domain.Activity) []*dto.ActivityItem {
	result := make([]*dto.ActivityItem, len(activities))
	for i, a := range activities {
		result[i] = ActivityToItemDTO(a)
	}
	return result
}

func CriteriaDocToDTO(c *domain.CriteriaDoc) *dto.CriteriaDoc {
	if c == nil {
		return nil
	}

	dtoItem := &dto.CriteriaDoc{
		Id:       c.ID,
		MaxScore: int32(c.MaxScore),
	}
	if c.Title != "" {
		dtoItem.Title = c.Title
	}
	if c.Description != nil && *c.Description != "" {
		dtoItem.Description = *c.Description
	}
	return dtoItem
}

func CriteriaDocsToDTO(criteria []*domain.CriteriaDoc) []dto.CriteriaDoc {
	result := make([]dto.CriteriaDoc, 0, len(criteria))
	for _, c := range criteria {
		dto := CriteriaDocToDTO(c)
		if dto != nil {
			result = append(result, *dto)
		}
	}
	return result
}

func ActivityToDetailDTO(activity *domain.Activity, criteria []*domain.CriteriaDoc) *dto.ActivityDetail {
	if activity == nil {
		return nil
	}

	detail := &dto.ActivityDetail{
		Id:           activity.ID,
		UnitId:       activity.UnitID,
		IsActive:     activity.IsActive,
		CriteriaDocs: CriteriaDocsToDTO(criteria),
	}

	if activity.Slug != nil {
		detail.Slug = *activity.Slug
	}
	if activity.Title != "" {
		detail.Title = activity.Title
	}
	if activity.Description != nil {
		detail.Description = *activity.Description
	}
	if activity.ShortDescription != nil {
		detail.ShortDescription = *activity.ShortDescription
	}
	if activity.Location != nil {
		detail.Location = activity.Location
	}
	if activity.TargetAudience != nil {
		detail.TargetAudience = activity.TargetAudience
	}
	if activity.Rules != nil {
		detail.Rules = activity.Rules
	}
	if activity.Rewards != nil {
		detail.Rewards = activity.Rewards
	}
	if activity.ContactInfo != nil {
		detail.ContactInfo = activity.ContactInfo
	}
	if activity.ThumbnailURL != nil {
		detail.ThumbnailUrl = *activity.ThumbnailURL
	}
	if activity.StartDate != nil {
		detail.StartDate = formatDatePtr(activity.StartDate)
	}
	if activity.EndDate != nil {
		detail.EndDate = formatDatePtr(activity.EndDate)
	}
	if activity.RegistrationURL != nil {
		detail.RegistrationUrl = activity.RegistrationURL
	}
	if activity.ReviewLevel != nil {
		detail.ReviewLevel = *activity.ReviewLevel
	}
	if activity.Organizer != nil {
		detail.Organizer = activity.Organizer
	}

	return detail
}
