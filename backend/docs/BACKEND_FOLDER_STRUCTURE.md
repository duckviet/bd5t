# Backend Folder Structure

## Project: Ban Do 5 Tot

---

## Top-Level Structure

```text
backend/
  cmd/
  openapi/
  internal/
  pkg/
  Makefile
  go.mod
  go.sum
```

---

## Full Structure

```text
backend/
  cmd/
    api/
      main.go                   ← application entry point

  openapi/
    openapi.yaml                ← spec entry point
    dist.yaml                   ← bundled spec (generated, do not edit manually)
    paths/
      _index.yaml               ← route map for bundling
      auth/
        login.yaml
        register.yaml
        me.yaml
        refresh.yaml
        logout.yaml
      activities/
        list.yaml
        detail.yaml
      evidences/
        list.yaml
        create.yaml
        delete.yaml
      admin/
        review-evidence.yaml
        create-activity.yaml
        update-activity.yaml
        delete-activity.yaml
      profile/
        get.yaml
        patch.yaml
      progress/
        get.yaml
      leaderboard/
        list.yaml
      media/
        upload.yaml
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

  internal/
    config/
      config.go                 ← app config struct
      loader.go                 ← load from env/file

    dto/
      model_*.go                ← generated from OpenAPI (do not edit manually)

    domain/
      user.go
      activity.go
      evidence.go
      progress.go
      notification.go
      leaderboard.go

    handlers/
      routers.gen.go            ← generated router (do not edit manually)
      interfaces/
        api_auth.gen.go         ← generated handler interfaces
        api_activity.gen.go
        api_evidence.gen.go
        api_admin.gen.go
      impl/
        auth_handler.go         ← handler implementations
        activity_handler.go
        evidence_handler.go
        admin_handler.go
        profile_handler.go
        leaderboard_handler.go
        progress_handler.go
      middleware/
        auth.go
        optional_auth.go
        cors.go
        rate_limit.go
        security_headers.go
        logger.go
        recovery.go
        request_id.go

    service/
      interfaces/
        service_auth.gen.go     ← generated service interfaces
        service_activity.gen.go
        service_evidence.gen.go
        service_admin.gen.go
      impl/
        auth_service.go         ← service implementations
        activity_service.go
        evidence_service.go
        admin_service.go
        profile_service.go
        leaderboard_service.go
        progress_service.go
        notification_service.go

    repository/
      interfaces/
        user_repository.go
        activity_repository.go
        evidence_repository.go
        progress_repository.go
        notification_repository.go
      impl/
        user_repository.go      ← repository implementations
        activity_repository.go
        evidence_repository.go
        progress_repository.go
        notification_repository.go

    database/
      postgres/
        db.go                   ← connection setup
        transaction.go          ← transaction helper
      migrations/
        0001_init.sql
        0002_add_evidences.sql

    auth/
      token.go
      claims.go
      context.go
      password.go

    media/
      media_service.go
      file_storage_service.go
      r2_client.go
      validation.go

    mapper/
      user_mapper.go
      activity_mapper.go
      evidence_mapper.go
      progress_mapper.go

    errors/
      app_error.go
      codes.go
      auth_errors.go
      activity_errors.go
      evidence_errors.go
      user_errors.go
      media_errors.go
      common_errors.go

    event/
      publisher.go              ← EventPublisher interface
      events.go                 ← event type definitions
      dispatcher.go             ← synchronous dispatcher (MVP)

    limit/
      rate_limiter.go           ← rate limit logic

    logger/
      logger.go                 ← structured logger setup

  pkg/
    response/
      response.go               ← success/error response helpers
    pointer/
      pointer.go                ← generic pointer utilities
    timeutil/
      timeutil.go               ← time formatting helpers

  Makefile
  go.mod
  go.sum
```

---

## Notes

### Generated files (do not edit manually)
These are overwritten on every `make openapi-generator-cli` run:
- `openapi/dist.yaml`
- `internal/dto/model_*.go`
- `internal/handlers/routers.gen.go`
- `internal/handlers/interfaces/api_*.gen.go`
- `internal/service/interfaces/service_*.gen.go`

The generator currently also refreshes the bundled route/model scaffolding under `internal/dto/` by moving the generated `model_*.go` files into the checked-in DTO package.

### Implementation files (safe to edit)
Everything under:
- `internal/handlers/impl/`
- `internal/service/impl/`
- `internal/repository/impl/`
- `internal/domain/`
- `internal/mapper/`
- `internal/auth/`
- `internal/media/`
- `internal/errors/`

---

## Package Naming Convention

| Directory | Package Name |
|---|---|
| `internal/dto` | `dto` |
| `internal/domain` | `domain` |
| `internal/handlers/impl` | `handlers` |
| `internal/handlers/interfaces` | `interfaces` |
| `internal/service/impl` | `service` |
| `internal/service/interfaces` | `interfaces` |
| `internal/repository/impl` | `repository` |
| `internal/repository/interfaces` | `interfaces` |
| `internal/errors` | `errors` |
| `pkg/response` | `response` |