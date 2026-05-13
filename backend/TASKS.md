# TASKS.md

## Project: Ban Do 5 Tot — Backend Implementation
### Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Project Bootstrap

> Goal: repo compiles, server starts, CI can run.

### 0.1 Repo & Module Setup
- [x] `go mod init github.com/duckviet/bd5t/backend`
- [x] Create top-level folder skeleton (`cmd/`, `internal/`, `pkg/`, `openapi/`)
- [x] Add `.gitignore` (Go, air, .env, bin/, coverage.out)
- [x] Add `.env.example` with all required env keys

### 0.2 Config
- [x] Define `Config` struct in `internal/config/config.go`
  - [x] Server (host, port, env)
  - [x] Database (DSN, max conns, idle timeout)
  - [x] JWT (secret, access TTL, refresh TTL)
  - [x] Cookie (domain, secure, same-site)
  - [x] CORS (allowed origins)
  - [x] R2 (bucket, endpoint, access key, secret, CDN base URL)
  - [x] Rate limit (login, upload, evidence)
  - [x] Media (max image size, max file size)
- [x] Load config from env in `internal/config/loader.go`
- [x] Validate required env vars on startup (fail fast)

### 0.3 Entry Point
- [x] Write `cmd/api/main.go`
  - [x] Load config
  - [x] Init DB connection
  - [x] Wire repositories → services → handlers
  - [x] Register middleware stack
  - [x] Register routes
  - [x] Start server
- [x] Add graceful shutdown (SIGINT / SIGTERM)

### 0.4 Tooling
- [x] Add `Makefile` with all commands from `MAKEFILE.md`
- [x] Add `air.toml` for live reload
- [x] Add `golangci-lint` config (`.golangci.yml`)
- [ ] Verify `make run` starts the server cleanly (needs database)

---

## Phase 1 — Infrastructure Layer

> Goal: DB, logger, error handling, response helpers all working.

### 1.1 Database
- [x] Set up `pgxpool` connection in `internal/database/postgres/db.go`
- [x] Add health check ping on startup
- [x] Write `transaction.go` helper (begin, commit, rollback with context)
- [x] Set up `golang-migrate` integration
- [x] Write initial migration `000001_init.up.sql`:
  - [x] `users` table
  - [x] `units` table
  - [x] `activities` table
  - [x] `criteria_docs` table
  - [x] `evidences` table
  - [x] `progress` table
  - [x] `notifications` table
  - [x] `leaderboard_snapshots` table (optional at MVP)
- [ ] Verify `make migrate-up` runs cleanly (needs database)
- [x] Write migration `000002_add_activities_fields.up.sql` to align with Frontend:
  - [x] Add `slug`, `thumbnail_url`, `short_description`, `registration_url`, `review_level`, `organizer` to `activities`
  - [x] Add `unit_id`, `class_name` to `users`
  - [x] Add `criterion_type` to `evidences`
- [x] Migration file created at `internal/database/migrations/000002_add_activities_fields.up.sql`

### 1.2 Logger
- [x] Set up structured logger in `internal/logger/logger.go`
  - [x] Fields: requestId, userId, path, statusCode, latency, errorCode
  - [x] Different log levels for dev vs prod

### 1.3 Error Handling
- [x] Write `AppError` struct in `internal/errors/app_error.go`
- [x] Write all error code constants in `internal/errors/codes.go`
- [x] Write domain error constructors:
  - [x] `internal/errors/common_errors.go`
  - [x] `internal/errors/auth_errors.go`
  - [x] `internal/errors/user_errors.go`
  - [x] `internal/errors/activity_errors.go`
  - [x] `internal/errors/evidence_errors.go`
  - [x] `internal/errors/media_errors.go`

### 1.4 Response Helpers
- [x] Write `pkg/response/response.go`
  - [x] `OK(c, data)`
  - [x] `Created(c, data)`
  - [x] `NoContent(c)`
  - [x] `Paginated(c, data, meta)`
  - [x] `Error(c, err)` — accepts `*AppError`, fallback to 500

### 1.5 Utility Packages
- [x] `pkg/pointer/pointer.go` — generic pointer helpers (`ToPtr[T]`, `FromPtr[T]`)
- [x] `pkg/timeutil/timeutil.go` — time formatting helpers

---

## Phase 2 — Middleware Stack

> Goal: all middleware wired and tested in order.

- [x] `internal/handlers/middleware/recovery.go` — panic recovery → 500 response
- [x] `internal/handlers/middleware/request_id.go` — inject UUID into context + response header
- [x] `internal/handlers/middleware/logger.go` — structured request log per request
- [x] `internal/handlers/middleware/cors.go` — configurable allowed origins, credentials
- [x] `internal/handlers/middleware/security_headers.go`
  - [x] `X-Content-Type-Options: nosniff`
  - [x] `X-Frame-Options: DENY`
  - [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `internal/handlers/middleware/rate_limit.go`
  - [x] Per-IP limiter
  - [x] Per-user-ID limiter (post-auth)
  - [x] Configurable limits per route group
- [x] Wire middleware in `main.go` in correct order (see `BACKEND_ARCHITECTURE.md` §5)

---

## Phase 3 — Auth Layer

> Goal: register, login, logout, me, refresh all working end-to-end.

### 3.1 Auth Core
- [x] `internal/auth/password.go` — bcrypt hash + verify
- [x] `internal/auth/claims.go` — JWT claims struct (sub, email, role, studentId, exp)
- [x] `internal/auth/token.go`
  - [x] `SignAccessToken(user) (string, error)`
  - [x] `SignRefreshToken(user) (string, error)`
  - [x] `VerifyToken(tokenStr) (*Claims, error)`
- [x] `internal/auth/context.go`
  - [x] `SetCurrentUser(c, user)`
  - [x] `GetCurrentUser(c) (*CurrentUser, bool)`
  - [x] `MustGetCurrentUser(c) *CurrentUser`

### 3.2 Auth Middleware
- [x] `internal/handlers/middleware/auth.go` — required auth (401 if missing/invalid)
- [x] `internal/handlers/middleware/optional_auth.go` — inject user if token present, continue if not

### 3.3 OpenAPI Spec — Auth
- [x] `openapi/paths/auth/register.yaml`
- [x] `openapi/paths/auth/login.yaml`
- [x] `openapi/paths/auth/logout.yaml`
- [x] `openapi/paths/auth/me.yaml`
- [x] `openapi/paths/auth/refresh.yaml`
- [x] Add `AuthRequest`, `AuthResponse`, `UserProfile` to `openapi/components/schemas/`
- [x] Run `make openapi-generator-cli`

### 3.4 Domain
- [x] `internal/domain/user.go` — `User` struct
  - [ ] Update with `UnitID`, `ClassName`, rename `DisplayName` to `FullName`

### 3.5 Repository — User
- [x] Define `UserRepository` interface in `internal/repository/interfaces/`
- [x] Implement in `internal/repository/impl/user_repository.go`
  - [x] `GetByID`
  - [x] `GetByEmail`
  - [x] `GetByStudentID`
  - [x] `Create`
  - [x] `UpdateProfile`

### 3.6 Service — Auth
- [x] Implement `AuthService` in `internal/service/impl/auth_service.go`
  - [x] `Register(ctx, req) (*domain.User, error)`
  - [x] `Login(ctx, req) (*LoginResult, error)` — returns tokens + user
  - [x] `Logout(ctx, userId) error`
  - [x] `RefreshToken(ctx, refreshToken) (*TokenPair, error)`
  - [x] `Me(ctx, userId) (*domain.User, error)`

### 3.7 Handler — Auth
- [x] Implement `AuthHandler` in `internal/handlers/auth_handler.go`
  - [x] `POST /auth/register`
  - [x] `POST /auth/login` — set access + refresh cookies
  - [x] `POST /auth/logout` — clear cookies
  - [x] `POST /auth/refresh` — rotate access token
  - [x] `GET /auth/me`

### 3.8 Mapper
- [x] `internal/mapper/user_mapper.go`
  - [x] `UserToProfileDTO(user *domain.User) *dto.UserProfile`
  - [x] `RegisterRequestToDomain(req *dto.RegisterRequest) *domain.User`

### 3.9 Tests
- [ ] Unit test: `AuthService` register/login/logout logic
- [ ] Unit test: token sign and verify
- [ ] Unit test: password hash and verify
- [ ] Integration test: `UserRepository` CRUD

---

## Phase 4 — Units & Activities

> Goal: students can browse units and activities.

### 4.1 OpenAPI Spec — Units
- [x] `openapi/paths/units/list.yaml`
- [x] Add `UnitItem` schema

### 4.2 OpenAPI Spec — Activities
- [x] `openapi/paths/activities/list.yaml`
- [x] `openapi/paths/activities/detail.yaml` (GET by slug)
- [x] Add `ActivityItem`, `ActivityDetail`, `CriteriaDoc` schemas
- [x] Run `make openapi-generator-cli`

### 4.3 Domain
- [x] `internal/domain/unit.go`
- [x] `internal/domain/activity.go` (include `slug`, `thumbnail_url`, `registration_url`, `review_level`, `organizer`)
- [x] `internal/domain/criteria_doc.go`

### 4.4 Repository
- [x] `UnitRepository` — `List(ctx) ([]*domain.Unit, error)`
- [x] `ActivityRepository`
  - [x] `List(ctx, filters) ([]*domain.Activity, total int, error)`
  - [x] `GetBySlug(ctx, slug) (*domain.Activity, error)`

### 4.5 Service
- [x] `UnitService` — `ListUnits(ctx) ([]*domain.Unit, error)`
- [x] `ActivityService`
  - [x] `ListActivities(ctx, req) (paginated result, error)`
  - [x] `GetActivityDetail(ctx, slug) (*domain.Activity, error)`

### 4.6 Handler
- [x] `GET /units` — public
- [x] `GET /activities` — public, with pagination
- [x] `GET /activities/:slug` — public, get by slug

### 4.7 Mapper
- [x] `internal/mapper/activity_mapper.go`

### 4.8 Tests
- [ ] Unit test: `ActivityService` list + detail
- [ ] Integration test: `ActivityRepository` list with filters

---

## Phase 5 — Profile

> Goal: authenticated user can view and update their own profile.

- [ ] `GET /profile` — returns current user's full profile
- [ ] `PATCH /profile` — update full name, avatar URL, class name
- [ ] Add `ProfileUpdateRequest` schema to OpenAPI
- [ ] `UpdateProfile(ctx, userId, req)` in `UserService`
- [ ] Apply rate limit on `PATCH /profile`

---

## Phase 6 — Media Upload

> Goal: images and evidence files uploadable to Cloudflare R2.

### 6.1 R2 Client
- [ ] `internal/media/r2_client.go` — init S3-compatible client from config

### 6.2 Validation
- [ ] `internal/media/validation.go`
  - [ ] Validate MIME type against whitelist
  - [ ] Validate file size against config limit
  - [ ] Reject files that cannot be decoded

### 6.3 MediaService (images)
- [ ] `UploadImage(ctx, file) (*MediaUploadResult, error)`
- [ ] `DeleteObject(ctx, key) error`

### 6.4 FileStorageService (evidence files)
- [ ] `UploadFile(ctx, filename, contentType, r, size) (*StoredFile, error)`
- [ ] `DeleteFile(ctx, key) error`

### 6.5 OpenAPI Spec
- [ ] `openapi/paths/media/upload.yaml` — `POST /media/upload`
- [ ] Add `MediaUploadResponse` schema

### 6.6 Handler
- [ ] `POST /media/upload` — authenticated, rate limited, returns CDN URL + key

### 6.7 Tests
- [ ] Unit test: file type and size validation
- [ ] Unit test: MediaService with mocked R2 client

---

## Phase 7 — Evidences

> Goal: students can submit, list, and delete their evidence.

### 7.1 OpenAPI Spec
- [ ] `openapi/paths/evidences/list.yaml`
- [ ] `openapi/paths/evidences/create.yaml`
- [ ] `openapi/paths/evidences/delete.yaml`
- [ ] Add `EvidenceItem`, `CreateEvidenceRequest` schemas
- [ ] Run `make openapi-generator-cli`

### 7.2 Domain
- [ ] `internal/domain/evidence.go`
  - Status enum: `PENDING`, `APPROVED`, `REJECTED`
  - Add `CriterionType` (DAO_DUC, HOC_TAP, etc.)

### 7.3 Repository
- [ ] `EvidenceRepository`
  - [ ] `List(ctx, userId, filters) ([]*domain.Evidence, total, error)`
  - [ ] `GetByID(ctx, id) (*domain.Evidence, error)`
  - [ ] `Create(ctx, input) (*domain.Evidence, error)`
  - [ ] `Delete(ctx, id) error`
  - [ ] `UpdateStatus(ctx, id, status, reviewNote) error`

### 7.4 Service
- [ ] `EvidenceService`
  - [ ] `ListEvidences(ctx, userId, req) (paginated, error)`
  - [ ] `CreateEvidence(ctx, userId, req) (*domain.Evidence, error)`
  - [ ] `DeleteEvidence(ctx, userId, evidenceId) error`
    - Rule: only owner can delete; cannot delete if status = `APPROVED`

### 7.5 Handler
- [ ] `GET /evidences` — authenticated, paginated, filter by activity/status
- [ ] `POST /evidences` — authenticated, rate limited
- [ ] `DELETE /evidences/:id` — authenticated, owner only

### 7.6 Mapper
- [ ] `internal/mapper/evidence_mapper.go`

### 7.7 Tests
- [ ] Unit test: delete guard (approved evidence cannot be deleted)
- [ ] Unit test: ownership check
- [ ] Integration test: `EvidenceRepository`

---

## Phase 8 — Progress

> Goal: per-user progress matrix is computed and retrievable.

### 8.1 OpenAPI Spec
- [ ] `openapi/paths/progress/get.yaml` — `GET /progress`
- [ ] Add `ProgressMatrix`, `ProgressMatrixCell` schemas
- [ ] Run `make openapi-generator-cli`

### 8.2 Domain
- [ ] `internal/domain/progress.go`

### 8.3 Repository
- [ ] `ProgressRepository`
  - [ ] `GetByUserID(ctx, userId) (*domain.Progress, error)`
  - [ ] `Upsert(ctx, progress) error`

### 8.4 Service
- [ ] `ProgressService`
  - [ ] `GetProgress(ctx, userId) (*domain.Progress, error)`
  - [ ] `RecalculateProgress(ctx, userId) error`
    - Rule: count only `APPROVED` evidences per activity per criteria

### 8.5 Handler
- [ ] `GET /progress` — authenticated, returns own progress matrix

### 8.6 Tests
- [ ] Unit test: progress calculation rules
- [ ] Unit test: only approved evidences count

---

## Phase 9 — Leaderboard

> Goal: ranked list of users by approved evidence count.

### 9.1 OpenAPI Spec
- [ ] `openapi/paths/leaderboard/list.yaml`
- [ ] Add `LeaderboardItem`, `LeaderboardResponse` schemas
- [ ] Run `make openapi-generator-cli`

### 9.2 Repository
- [ ] `LeaderboardRepository`
  - [ ] `List(ctx, filters, pagination) ([]*domain.LeaderboardItem, total, error)`

### 9.3 Service
- [ ] `LeaderboardService`
  - [ ] `ListLeaderboard(ctx, req) (paginated, error)`

### 9.4 Handler
- [ ] `GET /leaderboard` — public, paginated, filterable by unit

---

## Phase 10 — Admin

> Goal: admins can review evidence and manage activities.

### 10.1 OpenAPI Spec
- [ ] `openapi/paths/admin/review-evidence.yaml` — `PATCH /admin/evidences/:id/review`
- [ ] `openapi/paths/admin/activities.yaml` — CRUD
- [ ] Add `ReviewEvidenceRequest` schema
- [ ] Run `make openapi-generator-cli`

### 10.2 Service
- [ ] `AdminService`
  - [ ] `ReviewEvidence(ctx, adminId, evidenceId, req) error`
    - Rule: cannot re-review already `APPROVED` or `REJECTED` evidence without override
    - Side effect: trigger progress recalculation + create notification
  - [ ] `CreateActivity(ctx, req) (*domain.Activity, error)`
  - [ ] `UpdateActivity(ctx, id, req) (*domain.Activity, error)`
  - [ ] `DeleteActivity(ctx, id) error`

### 10.3 Handler
- [ ] `PATCH /admin/evidences/:id/review` — admin only
- [ ] `POST /admin/activities` — admin only
- [ ] `PATCH /admin/activities/:id` — admin only
- [ ] `DELETE /admin/activities/:id` — admin only

### 10.4 Tests
- [ ] Unit test: review guard (cannot re-approve without override)
- [ ] Unit test: admin-only middleware enforcement

---

## Phase 11 — Notifications

> Goal: users receive notifications when evidence is reviewed.

### 11.1 OpenAPI Spec
- [ ] `openapi/paths/notifications/list.yaml`
- [ ] `openapi/paths/notifications/mark-read.yaml`
- [ ] Add `NotificationItem` schema
- [ ] Run `make openapi-generator-cli`

### 11.2 Domain
- [ ] `internal/domain/notification.go`

### 11.3 Event System (MVP)
- [ ] `internal/event/events.go` — event type definitions
  - [ ] `EvidenceApproved`
  - [ ] `EvidenceRejected`
- [ ] `internal/event/publisher.go` — `EventPublisher` interface
- [ ] `internal/event/dispatcher.go` — synchronous dispatch (MVP, no queue)

### 11.4 Repository
- [ ] `NotificationRepository`
  - [ ] `List(ctx, userId, pagination) ([]*domain.Notification, total, error)`
  - [ ] `Create(ctx, input) error`
  - [ ] `MarkRead(ctx, userId, notificationId) error`
  - [ ] `MarkAllRead(ctx, userId) error`

### 11.5 Service
- [ ] `NotificationService`
  - [ ] `ListNotifications(ctx, userId, req) (paginated, error)`
  - [ ] `MarkRead(ctx, userId, id) error`
  - [ ] `CreateFromEvent(ctx, event) error` — called by event dispatcher

### 11.6 Handler
- [ ] `GET /notifications` — authenticated, paginated
- [ ] `PATCH /notifications/:id/read` — authenticated
- [ ] `PATCH /notifications/read-all` — authenticated

---

## Phase 12 — Operational Endpoints

- [ ] `GET /healthz` — liveness, returns 200 + `{"status":"ok"}`
- [ ] `GET /readyz` — readiness, checks DB ping, returns 200 or 503

---

## Phase 13 — Hardening & Pre-launch

### Security
- [ ] Verify all admin routes are protected by role check middleware
- [ ] Verify all auth-required routes return 401 without token
- [ ] Verify CORS config blocks unexpected origins in production
- [ ] Verify cookies are `HttpOnly`, `Secure=true` in production
- [ ] Verify no secrets are logged

### Validation
- [ ] All request bodies have input validation (required fields, length, format)
- [ ] `studentId` format validated on register
- [ ] File uploads rejected outside whitelist MIME types

### Rate Limiting
- [ ] Login endpoint rate limited
- [ ] Register endpoint rate limited
- [ ] Evidence create rate limited
- [ ] Media upload rate limited
- [ ] Refresh token rate limited

### Observability
- [ ] All audit actions are logged (login, logout, evidence upload, approve/reject)
- [ ] Request ID propagated through logs and response headers
- [ ] Errors logged with wrapped `Err` field (not just message)

### Tests
- [ ] Service layer unit tests ≥ 80% coverage
- [ ] Repository integration tests for all key queries
- [ ] Auth middleware integration test (valid token, expired token, missing token)
- [ ] `make test` passes cleanly in CI

---

## Dependency Map

```
Phase 0 (Bootstrap)
  └── Phase 1 (Infrastructure)
        └── Phase 2 (Middleware)
              └── Phase 3 (Auth)          ← all subsequent phases need auth
                    ├── Phase 4 (Units & Activities)
                    ├── Phase 5 (Profile)
                    ├── Phase 6 (Media)
                    │     └── Phase 7 (Evidences)   ← needs media upload
                    │           ├── Phase 8 (Progress)
                    │           ├── Phase 9 (Leaderboard)
                    │           └── Phase 10 (Admin)
                    │                 └── Phase 11 (Notifications)
                    └── Phase 12 (Operational endpoints)
                          └── Phase 13 (Hardening)
```