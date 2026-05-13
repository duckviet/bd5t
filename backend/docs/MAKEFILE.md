# Makefile Reference

## Project: Ban Do 5 Tot

---

## Overview

The Makefile drives the full OpenAPI code generation pipeline and common developer tasks. All generated files are post-processed into the correct internal layers automatically.

---

## Variables

```makefile
OAPI_SPEC_SRC              := openapi/openapi.yaml
OAPI_SPEC_DST              := openapi/dist.yaml
GENERATED_SRC_DIR          := internal/generated-gin-server
HANDLERS_DST_DIR           := internal/handlers
HANDLERS_INTERFACE_DST_DIR := internal/handlers/interfaces
SERVICE_INTERFACE_DST_DIR  := internal/service/interfaces
DTO_DST_DIR                := internal/dto

MODULE_NAME := github.com/your-org/ban-do-5-tot/backend
```

---

## Commands

### `make openapi-generator-cli`

Runs the full code generation pipeline:

1. Bundle modular spec into `openapi/dist.yaml`
2. Generate Gin server scaffold into temp dir
3. Extract handler interfaces → `internal/handlers/interfaces/`
4. Extract service interfaces → `internal/service/interfaces/`
5. Move `model_*.go` → `internal/dto/`
6. Move `routers.go` → `internal/handlers/routers.gen.go`
7. Fix package declarations and imports
8. Delete temp directory

```makefile
.PHONY: openapi-generator-cli

openapi-generator-cli:
	@echo "0. --- Generating bundle file to dist ---"
	swagger-cli bundle ${OAPI_SPEC_SRC} -o ${OAPI_SPEC_DST} --type yaml

	@echo "1. --- Generating a new Gin server project ---"
	npx @openapitools/openapi-generator-cli generate \
		-i $(OAPI_SPEC_DST) \
		-g go-gin-server \
		-o $(GENERATED_SRC_DIR) \
		--additional-properties=packageName=oapi,generateMain=false,generateDockerfile=false,generateGoMod=false

	@echo "2. --- Preparing destination directories ---"
	mkdir -p $(HANDLERS_INTERFACE_DST_DIR)
	mkdir -p $(SERVICE_INTERFACE_DST_DIR)
	mkdir -p $(DTO_DST_DIR)

	@echo "3. --- Extracting Interfaces ---"
	@for f in $(GENERATED_SRC_DIR)/go/api_*.go; do \
		api_name=$$(grep "type .* struct" $$f | awk '{print $$2}'); \
		if [ -z "$$api_name" ]; then continue; fi; \
		base_name=$$(basename "$$f" .go); \
		base_name=$${base_name#api_}; \
		\
		h_dest="$(HANDLERS_INTERFACE_DST_DIR)/api_$${base_name}.gen.go"; \
		echo "package interfaces\n\nimport \"github.com/gin-gonic/gin\"\n\ntype $${api_name}Handler interface {" > $$h_dest; \
		grep "func (api \*$$api_name)" $$f | sed 's/func (api \*'$$api_name') \(.*\) {/\t\1/' >> $$h_dest; \
		echo "}" >> $$h_dest; \
		\
		s_dest="$(SERVICE_INTERFACE_DST_DIR)/service_$${base_name}.gen.go"; \
		echo "package interfaces\n\nimport \"context\"\n\ntype $${api_name}Service interface {" > $$s_dest; \
		grep "func (api \*$$api_name)" $$f | \
			sed 's/func (api \*'$$api_name') //' | \
			sed 's/(c \*gin.Context)/ (ctx context.Context, req interface{}) (interface{}, error)/' | \
			sed 's/ {//' | sed 's/^/\t/' >> $$s_dest; \
		echo "}" >> $$s_dest; \
		echo "Generated: Handler & Service for $$api_name"; \
	done

	@echo "4. --- Moving Models and Routers ---"
	mv -f $(GENERATED_SRC_DIR)/go/model_*.go $(DTO_DST_DIR)/ || true
	mv -f $(GENERATED_SRC_DIR)/go/routers.go $(HANDLERS_DST_DIR)/routers.gen.go

	@echo "5. --- Fixing Package Declarations & Imports ---"
	sed -i 's/package oapi/package dto/g' $(DTO_DST_DIR)/*.go 2>/dev/null || true
	sed -i 's/package oapi/package handlers/g' $(HANDLERS_DST_DIR)/routers.gen.go
	sed -i 's|"$(MODULE_NAME)/go"|"$(MODULE_NAME)/internal/dto"|g' $(HANDLERS_DST_DIR)/routers.gen.go

	@echo "6. --- Cleaning up ---"
	rm -rf $(GENERATED_SRC_DIR)
	@echo "--- Code generation and integration complete! ---"
```

---

### `make openapi-validate`

Validates the OpenAPI source spec before bundling.

```makefile
.PHONY: openapi-validate

openapi-validate:
	swagger-cli validate $(OAPI_SPEC_SRC)
```

---

### `make fmt`

Formats all Go source files.

```makefile
.PHONY: fmt

fmt:
	go fmt ./...
```

---

### `make lint`

Runs the linter against all packages.

```makefile
.PHONY: lint

lint:
	golangci-lint run
```

---

### `make test`

Runs all unit and integration tests.

```makefile
.PHONY: test

test:
	go test ./...
```

Run with coverage:

```makefile
test-coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html
```

---

### `make mock-gen`

Generates mock implementations from interfaces (using `mockery` or `moq`).

```makefile
.PHONY: mock-gen

mock-gen:
	go generate ./internal/...
```

Place `//go:generate` directives in interface files, e.g.:

```go
//go:generate mockery --name=UserRepository --output=./mocks
```

---

### `make run`

Runs the API server.

```makefile
.PHONY: run

run:
	go run ./cmd/api
```

---

### `make dev`

Runs the server with live-reload using `air`.

```makefile
.PHONY: dev

dev:
	air
```

> Requires `air` to be installed: `go install github.com/air-verse/air@latest`

---

### `make migrate-up` / `make migrate-down`

Runs database migrations.

```makefile
.PHONY: migrate-up migrate-down

migrate-up:
	migrate -path internal/database/migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path internal/database/migrations -database "$(DATABASE_URL)" down 1
```

> Requires `golang-migrate` CLI.

---

### `make build`

Compiles the binary.

```makefile
.PHONY: build

build:
	go build -o bin/api ./cmd/api
```

---

## Prerequisites

| Tool | Purpose | Install |
|---|---|---|
| `swagger-cli` | Bundle and validate OpenAPI spec | `npm install -g @apidevtools/swagger-cli` |
| `openapi-generator-cli` | Generate Gin server scaffold | `npm install -g @openapitools/openapi-generator-cli` |
| `golangci-lint` | Go linter | `brew install golangci-lint` |
| `air` | Live reload for development | `go install github.com/air-verse/air@latest` |
| `golang-migrate` | Database migration runner | `brew install golang-migrate` |
| `mockery` | Mock generation | `go install github.com/vektra/mockery/v2@latest` |