package errors

func ErrMediaInvalidFile(msg string) *AppError {
	return &AppError{
		Code:       CodeMediaInvalidFile,
		Message:    msg,
		HTTPStatus: 400,
	}
}

func ErrMediaUploadFailed(err error) *AppError {
	return Wrap(err, CodeMediaUploadFailed, "Failed to upload file", 500)
}
