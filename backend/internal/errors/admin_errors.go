package errors

func ErrActivitySlugExists() *AppError {
	return &AppError{
		Code:       CodeActivitySlugExists,
		Message:    "Activity with this slug already exists",
		HTTPStatus: 409,
	}
}

func ErrEvidenceAlreadyReviewed() *AppError {
	return &AppError{
		Code:       CodeEvidenceAlreadyReviewed,
		Message:    "Evidence has already been reviewed and forceOverride is not set",
		HTTPStatus: 409,
	}
}
