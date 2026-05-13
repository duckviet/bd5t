# Authentication Strategy

## Project: Ban Do 5 Tot

---

## 1. Overview

Authentication is token-based using **JWT**, with tokens stored in **HTTP-only cookies**.

Two tokens are used:
- `access_token` — short-lived, used for request auth
- `refresh_token` — long-lived, used to obtain new access tokens

---

## 2. Cookie Behavior

| Environment | SameSite | Secure |
|---|---|---|
| Production | `None` | `true` |
| Development | `Lax` | `false` |

**Domain resolution:**
- Resolved from the request host
- Do not set `Domain` for `localhost` or IP addresses

**Backend must:**
- Set cookies on login and token refresh
- Clear cookies on logout
- Read tokens from Authorization header or cookie (header takes priority)
- Inject the current user into Gin context for downstream handlers

---

## 3. Token Extraction Priority

```
Authorization: Bearer <token>   ← checked first
Cookie: access_token=<token>    ← fallback
```

---

## 4. Middleware Auth Flow

```
Incoming Request
      │
      ▼
Extract token (header → cookie fallback)
      │
      ▼
Verify JWT / access token
      │
      ▼
Parse claims
      │
      ▼
(Optional) Load minimal user info
      │
      ▼
Set CurrentUser into Gin context
      │
      ▼
Handler reads user from context
```

---

## 5. Directory Structure

```text
internal/
  auth/
    token.go         ← sign/verify JWT
    claims.go        ← JWT claims struct
    context.go       ← Gin context helpers
    password.go      ← bcrypt hashing
  handlers/
    middleware/
      auth.go          ← required auth middleware
      optional_auth.go ← optional auth middleware (public routes)
```

---

## 6. Context Helpers

```go
// Set current user into context
func SetCurrentUser(c *gin.Context, user *CurrentUser)

// Get current user — returns false if not present
func GetCurrentUser(c *gin.Context) (*CurrentUser, bool)

// Get current user — panics if not present (use in protected handlers)
func MustGetCurrentUser(c *gin.Context) *CurrentUser
```

---

## 7. CurrentUser Model

```go
type CurrentUser struct {
    ID        string
    Email     string
    Role      string
    StudentID string
}
```

---

## 8. Refresh Token Flow

Endpoint: `POST /auth/refresh`

Flow:
1. Client sends request with `refresh_token` cookie
2. Server validates the refresh token
3. Server issues a new `access_token`
4. Server sets new `access_token` cookie in response
5. Optionally rotate the `refresh_token` as well

---

## 9. Permission Matrix

| Action | Student | Admin |
|---|---|---|
| View activities | ✅ | ✅ |
| Submit evidence | ✅ | ✅ |
| Delete own evidence (if not approved) | ✅ | ✅ |
| Review / approve evidence | ❌ | ✅ |
| Manage activities (CRUD) | ❌ | ✅ |
| View leaderboard | ✅ | ✅ |
| Access admin panel | ❌ | ✅ |

> Extend this matrix if a `reviewer` role is introduced later.

---

## 10. Security Considerations

- Tokens must be HTTP-only cookies (not accessible via JS)
- Access token lifetime should be short (e.g. 15 minutes)
- Refresh token lifetime can be longer (e.g. 7–30 days)
- Log all login/logout events with IP and user agent
- Rate-limit login and refresh endpoints (see `MAKEFILE.md` rate limit config)