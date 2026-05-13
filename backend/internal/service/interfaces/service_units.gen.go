package interfaces

import "context"

type UnitsAPIService interface {
	ListUnits (ctx context.Context, req interface{}) (interface{}, error)
}
