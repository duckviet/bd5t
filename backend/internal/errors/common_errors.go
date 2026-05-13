package errors

func ErrValidation(details map[string]interface{}) *AppError {
	return &AppError{
		Code:       CodeValidationError,
		Message:    "Validation failed",
		HTTPStatus: 400,
		Details:    details,
	}
}

func ErrInternalError(err error, msg string) *AppError {
	return Wrap(err, CodeInternalError, msg, 500)
}

func ErrNotFound(resource string) *AppError {
	return &AppError{
		Code:       CodeNotFound,
		Message:    resource + " not found",
		HTTPStatus: 404,
	}
}

func ErrBadRequest(msg string) *AppError {
	return &AppError{
		Code:       CodeBadRequest,
		Message:    msg,
		HTTPStatus: 400,
	}
}
