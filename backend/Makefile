.PHONY: help install build run dev swagger docker-up docker-down clean test

help:
	@echo "SpotSync API - Available Commands"
	@echo "=================================="
	@echo "make install     - Install dependencies"
	@echo "make build       - Build the application"
	@echo "make run         - Run the application"
	@echo "make dev         - Run with hot reload (requires Air)"
	@echo "make swagger     - Generate Swagger documentation"
	@echo "make docker-up   - Start Docker containers (PostgreSQL + API)"
	@echo "make docker-down - Stop Docker containers"
	@echo "make test        - Run tests"
	@echo "make clean       - Clean build artifacts"

install:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy
	@echo "Dependencies installed ✓"

build:
	@echo "Building application..."
	go build -o spotsync-api ./cmd/main.go
	@echo "Build complete ✓"

run: build
	@echo "Starting SpotSync API..."
	./spotsync-api

dev:
	@echo "Starting with hot reload..."
	air

swagger:
	@echo "Generating Swagger documentation..."
	swag init -g cmd/main.go
	@echo "Swagger docs generated ✓"
	@echo "View at: http://localhost:8080/swagger/"

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "PostgreSQL: localhost:5432"
	@echo "API: http://localhost:8080"
	@echo "Swagger: http://localhost:8080/swagger/"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

test:
	@echo "Running tests..."
	go test -v ./...

clean:
	@echo "Cleaning build artifacts..."
	rm -f spotsync-api
	@echo "Clean complete ✓"

migrate-up:
	@echo "Running migrations..."
	go run ./cmd/main.go
	@echo "Migrations complete ✓"

all: install swagger build
	@echo "All tasks complete ✓"
