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

The source spec is authored as OpenAPI 3.1.0 in modular YAML files under `openapi/paths/` and `openapi/components/`. Shared definitions are referenced through the component index files, and path files reference the leaf YAML fragments directly so the source tree stays valid before bundling.

---

## 2. Spec Directory Structure

```text
backend/
  openapi/
    openapi.yaml              ← entry point
    dist.yaml                 ← bundled output (generated)
    paths/
      _index.yaml             ← route map for bundling
      auth/
        login.yaml
        register.yaml
        me.yaml
        refresh.yaml
        logout.yaml
      activities/
        list.yaml
        detail.yaml
      profile/
        get.yaml
        patch.yaml
      evidences/
        list.yaml
        create.yaml
        delete.yaml
      admin/
        review-evidence.yaml
        create-activity.yaml
        update-activity.yaml
        delete-activity.yaml
      health/
        health.yaml
    components/
      schemas/
        _index.yaml
        _common.yaml
        user.yaml
        activity_detail.yaml
        activity_item.yaml
        evidence.yaml
        progress.yaml
        leaderboard.yaml
      responses/
        _index.yaml
        error_responses.yaml
      parameters/
        _index.yaml
```

---

## 3. Modular Spec Rules

- `openapi/openapi.yaml` is the **entry point**
- Each API path lives in its own file under `openapi/paths/`
- Shared schemas go in `openapi/components/schemas/`
- Shared error/response shapes go in `openapi/components/responses/`
- Shared parameters go in `openapi/components/parameters/`
- Use the component index files as the stable alias layer for shared definitions
- Path files should reference the leaf YAML fragments directly so the source spec validates before bundling

---

## 4. Generation Workflow

```
openapi/openapi.yaml
  │
  ▼ (swagger-cli validate)
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

Validation now checks both the source spec and the bundled output:

```bash
make openapi-validate
```

---

## 5. Recommended Schemas to Define Early

Define these in `openapi/components/schemas/`:

| Schema | Description |
|---|---|
| `ErrorResponse` | Standard error shape |
| `PaginationMeta` | Page/total metadata |
| `UserProfile` | Minimal authenticated user info |
| `ActivityItem` | Activity list entry |
| `ActivityDetail` | Full activity detail |
| `EvidenceItem` | Evidence list entry |
| `ProgressMatrixCell` | Progress grid cell |
| `LeaderboardItem` | Leaderboard row |

Prefer keeping response wrappers and request models explicit, even when the service layer maps them into domain structs.

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

The canonical pagination metadata fields are `page`, `pageSize`, `total`, and `totalPages`.

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