package interfaces

import "context"

type ProfileAPIService interface {
	GetProfile(ctx context.Context, req interface{}) (interface{}, error)
	UpdateProfile(ctx context.Context, req interface{}) (interface{}, error)
}
