# Error Handling Strategy

## Project: Ban Do 5 Tot

---

## 1. Goals

All errors must be:
- **Consistent** — same shape across all endpoints
- **Coded** — constant error codes per domain
- **Trackable** — easy to correlate in logs and frontend
- **i18n-ready** — message field can be mapped to translations later

---

## 2. AppError Struct

```go
package errors

type AppError struct {
    Code       string
    Message    string
    HTTPStatus int
    Details    map[string]interface{}
    Err        error // original wrapped error
}

func (e *AppError) Error() string {
    return e.Message
}
```

---

## 3. Error Response Shape

```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

Optional additional fields:
```json
{
  "success": false,
  "error": {
    "code": "COMMON_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "invalid format",
      "studentId": "required"
    },
    "traceId": "abc-123"
  }
}
```

---

## 4. Error Codes by Domain

### Format convention: `DOMAIN_DESCRIPTION`

```go
package errors

const (
    // Common
    CodeValidationError    = "COMMON_VALIDATION_ERROR"
    CodeInternalError      = "COMMON_INTERNAL_ERROR"

    // Auth
    CodeUnauthorized       = "AUTH_UNAUTHORIZED"
    CodeForbidden          = "AUTH_FORBIDDEN"
    CodeInvalidCredentials = "AUTH_INVALID_CREDENTIALS"
    CodeTokenExpired       = "AUTH_TOKEN_EXPIRED"

    // User
    CodeUserNotFound       = "USER_NOT_FOUND"

    // Activity
    CodeActivityNotFound   = "ACTIVITY_NOT_FOUND"

    // Evidence
    CodeEvidenceNotFound   = "EVIDENCE_NOT_FOUND"
    CodeEvidenceApproved   = "EVIDENCE_ALREADY_APPROVED"

    // Media
    CodeMediaInvalidFile   = "MEDIA_INVALID_FILE"
    CodeMediaUploadFailed  = "MEDIA_UPLOAD_FAILED"
)
```

---

## 5. Directory Structure

```text
internal/errors/
  app_error.go        ← AppError struct and constructor helpers
  codes.go            ← all error code constants
  auth_errors.go      ← auth-specific error constructors
  activity_errors.go
  evidence_errors.go
  user_errors.go
  media_errors.go
  common_errors.go
```

---

## 6. Constructor Helpers

Define domain-specific constructors in each file:

```go
// auth_errors.go
func ErrUnauthorized() *AppError {
    return &AppError{
        Code:       CodeUnauthorized,
        Message:    "Unauthorized",
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

// evidence_errors.go
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
```

---

## 7. Handler Error Mapping

The handler layer maps `AppError` to the HTTP response:

```go
func handleError(c *gin.Context, err error) {
    var appErr *errors.AppError
    if errors.As(err, &appErr) {
        c.JSON(appErr.HTTPStatus, gin.H{
            "success": false,
            "error": gin.H{
                "code":    appErr.Code,
                "message": appErr.Message,
                "details": appErr.Details,
            },
        })
        return
    }
    // Fallback for unexpected errors
    c.JSON(500, gin.H{
        "success": false,
        "error": gin.H{
            "code":    errors.CodeInternalError,
            "message": "An unexpected error occurred",
        },
    })
}
```

---

## 8. HTTP Status Code Guidelines

| Scenario | HTTP Status |
|---|---|
| Validation error | 400 |
| Unauthorized (no token / bad token) | 401 |
| Forbidden (valid token, insufficient role) | 403 |
| Resource not found | 404 |
| Conflict (already exists / approved) | 409 |
| Internal server error | 500 |

---

## 9. Logging Errors

Always log at the service or handler layer:
- Error code
- Wrapped original error (`Err` field)
- Request ID (from context)
- User ID (if authenticated)

Do not expose raw internal errors in API responses.