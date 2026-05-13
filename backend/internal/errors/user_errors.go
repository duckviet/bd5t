package errors

func ErrUserNotFound() *AppError {
	return &AppError{
		Code:       CodeUserNotFound,
		Message:    "User not found",
		HTTPStatus: 404,
	}
}

func ErrUserForbidden() *AppError {
	return &AppError{
		Code:       CodeUserForbidden,
		Message:    "You do not have permission to access this resource",
		HTTPStatus: 403,
	}
}
