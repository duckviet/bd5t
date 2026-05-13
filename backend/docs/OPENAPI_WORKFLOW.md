# OpenAPI Workflow

## Project: Ban Do 5 Tot

---

## 1. Principles

This project follows an **OpenAPI-first** workflow:

1. Write the OpenAPI spec first
2. Bundle the modular spec into a single dist file
3. Generate the server scaffold using `openapi-generator-cli`
4. Post-process generated code into the correct layers:
   - Handler interfaces → `internal/handlers/interfaces/`
   - Service interfaces → `internal/service/interfaces/`
   - DTOs → `internal/dto/`
   - Router → `internal/handlers/routers.gen.go`

---

## 2. Spec Directory Structure

```text
backend/
  openapi/
    openapi.yaml              ← entry point
    dist.yaml                 ← bundled output (generated)
    paths/
      auth/
        login.yaml
        register.yaml
        me.yaml
      activities/
        list.yaml
        detail.yaml
      evidences/
        list.yaml
        create.yaml
      admin/
        review-evidence.yaml
    components/
      schemas/
      responses/
      parameters/
```

---

## 3. Modular Spec Rules

- `openapi/openapi.yaml` is the **entry point**
- Each API path lives in its own file under `openapi/paths/`
- Shared schemas go in `openapi/components/schemas/`
- Shared error/response shapes go in `openapi/components/responses/`
- Use `$ref` to link everything together

---

## 4. Generation Workflow

```
openapi/openapi.yaml
        │
        ▼ (swagger-cli bundle)
openapi/dist.yaml
        │
        ▼ (openapi-generator-cli)
internal/generated-gin-server/   ← temp dir
        │
        ├── Extract handler interfaces → internal/handlers/interfaces/
        ├── Extract service interfaces → internal/service/interfaces/
        ├── Move model_*.go → internal/dto/
        ├── Move routers.go → internal/handlers/routers.gen.go
        ├── Fix package declarations & imports
        └── Delete temp dir
```

---

## 5. Recommended Schemas to Define Early

Define these in `openapi/components/schemas/`:

| Schema | Description |
|---|---|
| `ErrorResponse` | Standard error shape |
| `PaginationMeta` | Page/total metadata |
| `UserSummary` | Minimal user info |
| `ActivityItem` | Activity list entry |
| `ActivityDetail` | Full activity detail |
| `EvidenceItem` | Evidence list entry |
| `ProgressMatrixCell` | Progress grid cell |
| `NotificationItem` | Notification entry |
| `LeaderboardItem` | Leaderboard row |

---

## 6. Standard Response Wrapper

All endpoints should return a consistent envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

Optional fields on error:
- `details` — field-level validation errors
- `traceId` — for log correlation

---

## 7. Security Scheme in OpenAPI

Define both auth methods:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    cookieAuth:
      type: apiKey
      in: cookie
      name: access_token
```

**Runtime priority:** Authorization header > Cookie fallback

---

## 8. Pagination Standard

All list endpoints must include:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Query params: `?page=1&pageSize=20`

---

## 9. Validation

Run spec validation before bundling:

```bash
make openapi-validate
```

This runs:
```bash
swagger-cli validate openapi/openapi.yaml
```

Keep the spec valid at all times — it is the single source of truth for both frontend and backend contracts.