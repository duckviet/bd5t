package interfaces

import "context"

type StudentsAPIService interface {
	SearchStudents (ctx context.Context, req interface{}) (interface{}, error)
}
