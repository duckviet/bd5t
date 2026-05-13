.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make run              - Run the API server"
	@echo "  make dev              - Run with live reload (air)"
	@echo "  make build            - Build the binary"
	@echo "  make test             - Run tests"
	@echo "  make test-coverage    - Run tests with coverage"
	@echo "  make lint             - Run linter"
	@echo "  make fmt              - Format code"
	@echo "  make openapi-validate - Validate OpenAPI spec"
	@echo "  make openapi-generator-cli - Generate code from OpenAPI"
	@echo "  make migrate-up       - Run database migrations"
	@echo "  make migrate-down     - Rollback last migration"

MODULE_NAME := github.com/duckviet/bd5t/backend
OAPI_SPEC_SRC := openapi/openapi.yaml
OAPI_SPEC_DST := openapi/dist.yaml
GENERATED_SRC_DIR := internal/generated-gin-server
HANDLERS_DST_DIR := internal/handlers
HANDLERS_INTERFACE_DST_DIR := internal/handlers/interfaces
SERVICE_INTERFACE_DST_DIR := internal/service/interfaces
DTO_DST_DIR := internal/dto
DATABASE_URL :=postgres://postgres:postgres@localhost:5436/bd5t?sslmode=disable
run:
	go run ./cmd/api

dev:
	air

build:
	go build -o bin/api ./cmd/api

test:
	go test ./...

test-coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html

lint:
	golangci-lint run

fmt:
	go fmt ./...

openapi-validate:
	swagger-cli validate $(OAPI_SPEC_SRC)

openapi-generator-cli:
	@echo "0. --- Generating bundle file to dist ---"
	swagger-cli bundle $(OAPI_SPEC_SRC) -o $(OAPI_SPEC_DST) --type yaml

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

migrate-up:
	docker run --rm -v $(shell pwd)/internal/database/migrations:/migrations --network host migrate/migrate -path=/migrations/ -database "$(DATABASE_URL)" up

migrate-down:
	docker run --rm -v $(shell pwd)/internal/database/migrations:/migrations --network host migrate/migrate -path=/migrations/ -database "$(DATABASE_URL)" down 1

mock-gen:
	go generate ./internal/...