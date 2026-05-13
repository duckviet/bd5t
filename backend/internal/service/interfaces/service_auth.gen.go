package interfaces

import "context"

type AuthAPIService interface {
	Login (ctx context.Context, req interface{}) (interface{}, error)
	Logout (ctx context.Context, req interface{}) (interface{}, error)
	Me (ctx context.Context, req interface{}) (interface{}, error)
	Refresh (ctx context.Context, req interface{}) (interface{}, error)
	Register (ctx context.Context, req interface{}) (interface{}, error)
}
