package errors

func ErrActivityNotFound() *AppError {
	return &AppError{
		Code:       CodeActivityNotFound,
		Message:    "Activity not found",
		HTTPStatus: 404,
	}
}
