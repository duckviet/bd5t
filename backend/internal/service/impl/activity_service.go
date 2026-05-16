package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type ActivityService struct {
	activityRepo interfaces.ActivityRepository
}

func NewActivityService(activityRepo interfaces.ActivityRepository) *ActivityService {
	return &ActivityService{activityRepo: activityRepo}
}

type ListActivitiesParams struct {
	Page          int
	PageSize      int
	UnitID        *string
	Search        *string
	Status        *string
	Criteria      *string
	ReviewLevel   *string
	StartDateFrom *string
	StartDateTo   *string
	Sort          *string
}

func (s *ActivityService) ListActivities(ctx context.Context, params *ListActivitiesParams) (*dto.ListActivities200Response, error) {
	page := params.Page
	pageSize := params.PageSize

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	filter := &interfaces.ListActivitiesFilter{
		UnitID:   params.UnitID,
		IsActive: func() *bool { v := true; return &v }(),
	}

	result, err := s.activityRepo.List(ctx, filter, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list activities")
	}

	totalPages := int(result.Total) / pageSize
	if int(result.Total)%pageSize > 0 {
		totalPages++
	}

	activities := mapper.ActivitiesToItemDTO(result.Activities)
	data := make([]dto.ActivityItem, len(activities))
	for i, a := range activities {
		if a != nil {
			data[i] = *a
		}
	}

	return &dto.ListActivities200Response{
		Success: true,
		Data:    data,
		Meta: dto.PaginationMeta{
			Page:       int32(page),
			PageSize:   int32(pageSize),
			Total:      int32(result.Total),
			TotalPages: int32(totalPages),
		},
	}, nil
}

func (s *ActivityService) ListAdminActivities(ctx context.Context, params *ListActivitiesParams) (*dto.ListActivities200Response, error) {
	page := params.Page
	pageSize := params.PageSize

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	filter := &interfaces.ListActivitiesFilter{
		UnitID:        params.UnitID,
		Search:        params.Search,
		Criteria:      params.Criteria,
		ReviewLevel:   params.ReviewLevel,
		StartDateFrom: params.StartDateFrom,
		StartDateTo:   params.StartDateTo,
		Sort:          params.Sort,
	}
	if params.Status != nil {
		switch *params.Status {
		case "active":
			v := true
			filter.IsActive = &v
		case "inactive":
			v := false
			filter.IsActive = &v
		}
	}

	result, err := s.activityRepo.List(ctx, filter, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list admin activities")
	}

	totalPages := int(result.Total) / pageSize
	if int(result.Total)%pageSize > 0 {
		totalPages++
	}

	activities := mapper.ActivitiesToItemDTO(result.Activities)
	data := make([]dto.ActivityItem, len(activities))
	for i, a := range activities {
		if a != nil {
			data[i] = *a
		}
	}

	return &dto.ListActivities200Response{
		Success: true,
		Data:    data,
		Meta: dto.PaginationMeta{
			Page:       int32(page),
			PageSize:   int32(pageSize),
			Total:      int32(result.Total),
			TotalPages: int32(totalPages),
		},
	}, nil
}

func (s *ActivityService) GetActivityDetail(ctx context.Context, slug string) (*dto.ActivityDetail, error) {
	activity, err := s.activityRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get activity")
	}
	if activity == nil {
		return nil, errors.ErrActivityNotFound()
	}

	criteria, err := s.activityRepo.GetCriteriaDocsByActivityID(ctx, activity.ID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get criteria docs")
	}

	return mapper.ActivityToDetailDTO(activity, criteria), nil
}
