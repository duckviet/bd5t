package errors

func ErrNotificationNotFound() *AppError {
	return &AppError{
		Code:       CodeNotificationNotFound,
		Message:    "Notification not found",
		HTTPStatus: 404,
	}
}
