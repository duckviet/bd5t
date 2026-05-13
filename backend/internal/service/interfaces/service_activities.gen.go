package interfaces

import "context"

type ActivitiesAPIService interface {
	GetActivityDetail (ctx context.Context, req interface{}) (interface{}, error)
	ListActivities (ctx context.Context, req interface{}) (interface{}, error)
}
