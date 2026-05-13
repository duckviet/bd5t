package errors

func ErrUnauthorized() *AppError {
	return &AppError{
		Code:       CodeUnauthorized,
		Message:    "Unauthorized",
		HTTPStatus: 401,
	}
}

func ErrForbidden() *AppError {
	return &AppError{
		Code:       CodeForbidden,
		Message:    "Forbidden",
		HTTPStatus: 403,
	}
}

func ErrForbiddenWithMessage(msg string) *AppError {
	return &AppError{
		Code:       CodeForbidden,
		Message:    msg,
		HTTPStatus: 403,
	}
}

func ErrInvalidCredentials() *AppError {
	return &AppError{
		Code:       CodeInvalidCredentials,
		Message:    "Invalid email or password",
		HTTPStatus: 401,
	}
}

func ErrTokenExpired() *AppError {
	return &AppError{
		Code:       CodeTokenExpired,
		Message:    "Token has expired",
		HTTPStatus: 401,
	}
}

func ErrTokenInvalid() *AppError {
	return &AppError{
		Code:       CodeTokenInvalid,
		Message:    "Invalid token",
		HTTPStatus: 401,
	}
}

func ErrUserExists() *AppError {
	return &AppError{
		Code:       CodeUserExists,
		Message:    "User already exists",
		HTTPStatus: 409,
	}
}
