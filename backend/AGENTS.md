# AGENTS.md

## Project: Ban Do 5 Tot — Backend
### For: Claude Code, Cursor, Copilot, and any AI coding agent

---

## 1. Project Snapshot

This is a **Golang + Gin** REST API backend following an **OpenAPI-first, layered architecture**.

| Concern | Decision |
|---|---|
| Language | Go |
| Framework | Gin |
| API contract | OpenAPI 3.0 (spec-first) |
| Architecture | Handler → Service → Repository |
| Database | PostgreSQL |
| File storage | Cloudflare R2 |
| Auth | JWT via HTTP-only cookies + Authorization header |
| Module path | `github.com/your-org/ban-do-5-tot/backend` |

---

## 2. What Is and Is Not Generated

**Never manually edit these files** — they are overwritten by `make openapi-generator-cli`:

```
openapi/dist.yaml
internal/dto/model_*.go
internal/handlers/routers.gen.go
internal/handlers/interfaces/api_*.gen.go
internal/service/interfaces/service_*.gen.go
```

**Safe to create and edit:**

```
internal/handlers/impl/
internal/service/impl/
internal/repository/impl/
internal/repository/interfaces/
internal/domain/
internal/mapper/
internal/auth/
internal/media/
internal/errors/
internal/event/
internal/config/
pkg/
cmd/
```

When adding a new endpoint, the correct order is:
1. Write or update the OpenAPI spec under `openapi/paths/`
2. Run `make openapi-generator-cli`
3. Implement the generated interfaces in `impl/`

---

## 3. Layer Rules

### Handler (`internal/handlers/impl/`)
- Bind request params and body
- Extract `CurrentUser` from context if needed
- Call one service method
- Map `AppError` → HTTP response via the `handleError` helper
- **No DB calls. No business logic.**

### Service (`internal/service/impl/`)
- Own all business rules and validation
- Coordinate repositories and external services
- Return domain types or `AppError`
- **No Gin types. No `*gin.Context`.**

### Repository (`internal/repository/impl/`)
- CRUD and queries only
- Accept and return `domain.*` types
- Support context cancellation
- **No HTTP types. No business rules.**

### DTO (`internal/dto/`)
- Request/response models only — generated from OpenAPI
- Do not add business logic here
- Use `internal/mapper/` to convert between DTO ↔ domain

---

## 4. Adding a New Feature — Checklist

```
[ ] 1. Define or update OpenAPI spec in openapi/paths/<module>/
[ ] 2. Add shared schemas to openapi/components/schemas/ if needed
[ ] 3. Run: make openapi-validate
[ ] 4. Run: make openapi-generator-cli
[ ] 5. Implement the new handler interface in internal/handlers/impl/
[ ] 6. Implement the new service interface in internal/service/impl/
[ ] 7. Implement or extend repository interface + impl if needed
[ ] 8. Add domain model to internal/domain/ if needed
[ ] 9. Add mapper functions in internal/mapper/
[ ] 10. Add error constructors in internal/errors/ if needed
[ ] 11. Wire dependencies in cmd/api/main.go
[ ] 12. Run: make fmt && make lint && make test
```

---

## 5. Error Handling

Always use `AppError` from `internal/errors/`. Never return raw `error` strings to the HTTP layer.

```go
// Correct — return a typed AppError from service
return nil, errors.ErrEvidenceNotFound()

// Correct — wrap an unexpected error
return nil, &errors.AppError{
    Code:       errors.CodeInternalError,
    Message:    "failed to fetch evidence",
    HTTPStatus: 500,
    Err:        err,
}

// Wrong — never do this
return nil, fmt.Errorf("evidence not found")
```

Error response shape is always:
```json
{
  "success": false,
  "error": {
    "code": "EVIDENCE_NOT_FOUND",
    "message": "Evidence not found"
  }
}
```

See `ERROR_HANDLING.md` for the full error code list.

---

## 6. Auth in Handlers

Use context helpers from `internal/auth/context.go`:

```go
// Protected route — panics if user not in context (middleware must run first)
user := auth.MustGetCurrentUser(c)

// Optional auth route — check presence manually
user, ok := auth.GetCurrentUser(c)
if !ok {
    // handle unauthenticated case
}
```

Never read tokens directly in handlers. The auth middleware handles extraction and injection.

---

## 7. Response Conventions

Use helpers from `pkg/response/`:

```go
// Success
response.OK(c, data)
response.Created(c, data)
response.NoContent(c)

// Error
response.Error(c, err)  // accepts *errors.AppError
```

All list endpoints must include pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 8. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | `snake_case` | `evidence_service.go` |
| Packages | `lowercase`, single word | `service`, `repository` |
| Interfaces | PascalCase + noun | `EvidenceRepository` |
| Implementations | PascalCase + `Impl` suffix | `EvidenceRepositoryImpl` |
| Error codes | `SCREAMING_SNAKE_CASE` | `EVIDENCE_NOT_FOUND` |
| Error constructors | `Err` + PascalCase | `ErrEvidenceNotFound()` |
| Generated files | suffix `.gen.go` | `api_evidence.gen.go` |
| Config keys | `camelCase` in struct | `MaxFileSizeBytes` |

---

## 9. Dependency Injection

All dependencies are wired manually in `cmd/api/main.go`. There is no DI framework.

Constructor pattern for every layer:

```go
// Repository
func NewUserRepository(db *pgxpool.Pool) *UserRepositoryImpl

// Service
func NewAuthService(userRepo interfaces.UserRepository, ...) *AuthServiceImpl

// Handler
func NewAuthHandler(authSvc interfaces.AuthService) *AuthHandlerImpl
```

When adding a new dependency, update the wiring in `main.go` directly.

---

## 10. Database & Transactions

- Use `context.Context` in every repository method — always the first argument
- For flows that touch multiple tables (e.g. approve evidence + update progress + create notification), use the transaction helper from `internal/database/postgres/transaction.go`
- Never open transactions inside a service; pass a transaction-aware context or use a Unit of Work pattern

---

## 11. Media & File Uploads

- Images (avatar, thumbnail) → `internal/media/MediaService`
- Evidence files (PDF, JPG, PNG) → `internal/media/FileStorageService`
- Do not pipe PDF evidence through the image resize pipeline
- Validate file type and size before uploading to R2
- Store only the R2 object key in the database; derive the full URL from `config.CDNBaseURL + key`

---

## 12. Rate Limiting

Apply rate limit middleware on:
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /evidences`
- `POST /media/upload`

Rate limit middleware is in `internal/handlers/middleware/rate_limit.go`.

---

## 13. Config

All config comes from environment variables, loaded through `internal/config/`.

Never hardcode:
- DB connection strings
- JWT secrets
- R2 credentials
- Cookie domain or CORS origins
- File size limits

When adding a new config value, add it to the `Config` struct and document the env variable name in a comment.

---

## 14. Testing Guidance

- **Unit tests** — service layer logic, auth token handling, error mapping, media validation
- **Integration tests** — repository queries against a real test DB, auth middleware, upload flow
- **Contract tests** — verify handler responses match the OpenAPI spec shape

Mock interfaces with `mockery`. Generated mocks go in `internal/mocks/`.

Run before every commit:
```bash
make fmt && make lint && make test
```

---

## 15. What NOT to Do

- Do not edit any `*.gen.go` file — it will be overwritten
- Do not import `gin` in service or repository layers
- Do not put business logic in handlers
- Do not return raw `error` to HTTP responses
- Do not hardcode secrets or config values
- Do not use `*` for CORS origins when cookies are enabled
- Do not bypass the mapper layer — keep DTO and domain types separate
- Do not add a new endpoint without first updating the OpenAPI spec