# Backend Architecture

## Project: Ban Do 5 Tot
### Stack: Golang + Gin + OpenAPI + Layered Architecture

---

## 1. Overview

The backend is built with:

- **Golang** — primary language
- **Gin** — HTTP web framework
- **OpenAPI-first** — API contract defined before implementation
- **Layered Architecture** — clear separation of concerns across layers

### Goals

- Define API contract first using OpenAPI spec
- Generate server scaffold from the spec
- Clearly separate interfaces from implementations
- Easy to maintain, scale, and test
- Shared DTO/API contract with the frontend

---

## 2. Architectural Style

The system follows a standard layered architecture:

### Handler Layer
- Receives HTTP requests from Gin
- Parses input (body, query, path params)
- Calls service layer
- Returns responses according to OpenAPI contract

### Service Layer
- Handles all business logic
- Validates business rules
- Coordinates multiple repositories and/or external services
- Returns domain/application data

### Repository / Database Layer
- Interacts with the database
- Handles CRUD and query operations
- Contains no business logic

### DTO Layer
- Request/response models generated from OpenAPI spec
- Can be used directly at the API layer
- May be mapped to internal domain models when needed

### Middleware Layer
- Authentication
- Logging
- Recovery (panic handler)
- Rate limiting
- CORS
- Request context injection

---

## 3. Layer Responsibilities

### 3.1 Handler Layer

**Should:**
- Accept HTTP request
- Bind request body / query / path params
- Extract current user from context if needed
- Call service
- Map errors to HTTP status codes and error response format
- Return response following OpenAPI DTO contract

**Should NOT:**
- Query database directly
- Contain large business logic
- Handle complex transactions

---

### 3.2 Service Layer

**Should:**
- Process business logic
- Validate business rules
- Coordinate repositories + external services
- Handle authorization at business logic level
- Emit internal events if needed

**Examples of business rules:**
- A user can only delete their own evidence if the status is not `APPROVED`
- Leaderboard only counts approved evidences
- Progress only advances when sufficient valid evidence exists

---

### 3.3 Repository Layer

**Should:**
- CRUD data
- Query, filter, and paginate
- Support transactions
- Stay free of HTTP concerns
- Not contain response DTO logic

**Example contract:**
```go
type UserRepository interface {
    GetByID(ctx context.Context, id string) (*domain.User, error)
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
    GetByStudentID(ctx context.Context, studentID string) (*domain.User, error)
    Create(ctx context.Context, input *domain.User) error
}
```

---

## 4. DTO vs Domain

| Concern | Package |
|---|---|
| Request / Response / OpenAPI-generated models | `internal/dto` |
| Business entities / Repository data | `internal/domain` |

Use mapper functions to translate between the two layers.

---

## 5. Middleware Stack (Recommended Order)

1. Recovery (panic handler)
2. Request ID injection
3. Logger
4. CORS
5. Security headers
6. Rate limit
7. Optional auth / Required auth
8. Route handler

---

## 6. Domain Modules

The backend covers the following main domains:

| Module | Responsibility |
|---|---|
| `auth` | Login, register, token management |
| `users` | User profiles and identity |
| `units` | Organizational units (e.g. classes) |
| `activities` | 5-good activities |
| `criteria_docs` | Criteria documentation |
| `evidences` | Evidence submissions |
| `notifications` | User notifications |
| `progress` | Per-user progress tracking |
| `leaderboard` | Rankings |
| `media` | File/image upload |
| `admin` | Administrative review and management |

---

## 7. Database

**Recommended:** PostgreSQL

**Access layer options:**
- `pgx` + repository pattern (more control)
- `gorm` + repository pattern (faster to write)

For this project, either option works with the layered architecture. `pgx` is preferred for better query control and performance.

---

## 8. MVP API Priority

### P0 (Core)
- Auth: register, login, logout, me
- Units: list
- Activities: list, detail
- Profile: get, update
- Evidences: list, create, delete
- Progress: get
- Leaderboard: list

### P1 (Important)
- Notifications: list, mark read
- Admin: activities CRUD, evidence review
- Criteria docs: CRUD

### P2 (Future)
- Refresh token endpoint
- Advanced recommendations
- Event-driven notifications
- Analytics endpoints

---

## 9. Observability

### Logging
Structured log fields recommended:
- `requestId`
- `userId`
- `path`
- `statusCode`
- `latency`
- `errorCode`

### Audit Actions
Always log:
- Login / logout
- Evidence upload
- Evidence approve / reject
- Activity create / update / delete

### Health Endpoints
```
GET /healthz   — liveness check
GET /readyz    — readiness check
```

---

## 10. Background Jobs (Future)

Potential use cases:
- Cleanup orphan uploaded files
- Notification scheduling
- Leaderboard snapshot generation