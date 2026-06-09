.PHONY: help up down dev-up dev-down docker-prod-up docker-prod-down build-prod sync

# Default help display
help:
	@echo "======================================================================"
	@echo "               🎭  improv-assist Project Makefile 🎭"
	@echo "======================================================================"
	@echo "Local Development (Dev Mode):"
	@echo "  make dev-up          - Start the local dev container with HMR (port 3000)"
	@echo "  make dev-down        - Stop the local dev container"
	@echo "  make sync            - Pull constraints and docs from Notion database/page"
	@echo ""
	@echo "Production Deployment (VPS Mode / behind Traefik):"
	@echo "  make up              - Start the production container behind Traefik"
	@echo "  make down            - Stop the production container"
	@echo "  make build-prod      - Rebuild the production container from source"
	@echo "======================================================================"

# Dev commands
dev-up:
	docker compose -f docker-compose.yml up -d

dev-down:
	docker compose -f docker-compose.yml down

# Sync commands
sync:
	node notion_fetch.js

# Production / Root Orchestrator compat commands
up: docker-prod-up
down: docker-prod-down

docker-prod-up:
	docker compose -f docker-compose.prod.yml up -d

docker-prod-down:
	docker compose -f docker-compose.prod.yml down

build-prod:
	docker compose -f docker-compose.prod.yml build --no-cache
