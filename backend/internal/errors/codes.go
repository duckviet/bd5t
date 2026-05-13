package errors

const (
	CodeValidationError = "COMMON_VALIDATION_ERROR"
	CodeInternalError   = "COMMON_INTERNAL_ERROR"
	CodeBadRequest      = "COMMON_BAD_REQUEST"
	CodeNotFound        = "COMMON_NOT_FOUND"

	CodeUnauthorized       = "AUTH_UNAUTHORIZED"
	CodeForbidden          = "AUTH_FORBIDDEN"
	CodeInvalidCredentials = "AUTH_INVALID_CREDENTIALS"
	CodeTokenExpired       = "AUTH_TOKEN_EXPIRED"
	CodeTokenInvalid       = "AUTH_TOKEN_INVALID"
	CodeUserExists         = "AUTH_USER_EXISTS"

	CodeUserNotFound  = "USER_NOT_FOUND"
	CodeUserForbidden = "USER_FORBIDDEN"

	CodeActivityNotFound   = "ACTIVITY_NOT_FOUND"
	CodeActivitySlugExists = "ACTIVITY_SLUG_EXISTS"

	CodeEvidenceNotFound        = "EVIDENCE_NOT_FOUND"
	CodeEvidenceApproved        = "EVIDENCE_ALREADY_APPROVED"
	CodeEvidenceForbidden       = "EVIDENCE_FORBIDDEN"
	CodeEvidenceAlreadyReviewed = "EVIDENCE_ALREADY_REVIEWED"

	CodeMediaInvalidFile  = "MEDIA_INVALID_FILE"
	CodeMediaUploadFailed = "MEDIA_UPLOAD_FAILED"

	CodeNotificationNotFound = "NOTIFICATION_NOT_FOUND"
)
