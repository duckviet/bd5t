package errors

func ErrEvidenceNotFound() *AppError {
	return &AppError{
		Code:       CodeEvidenceNotFound,
		Message:    "Evidence not found",
		HTTPStatus: 404,
	}
}

func ErrEvidenceAlreadyApproved() *AppError {
	return &AppError{
		Code:       CodeEvidenceApproved,
		Message:    "Evidence has already been approved and cannot be modified",
		HTTPStatus: 409,
	}
}

func ErrEvidenceForbidden() *AppError {
	return &AppError{
		Code:       CodeEvidenceForbidden,
		Message:    "You do not have permission to modify this evidence",
		HTTPStatus: 403,
	}
}
