.PHONY: help dev-up dev-down up down deploy-improv

# Connection variables
VPS_SSH  := user@vps.eole.me
VPS_PATH := /home/julien/projects/eole.me/improv-assist

help:
	@echo "======================================================================"
	@echo "          🎭  improv-assist Project Makefile 🎭"
	@echo "======================================================================"
	@echo "Local Development (Dev Mode):"
	@echo "  make dev-up          - Start the local dev container with HMR (port 3000)"
	@echo "  make dev-down        - Stop the local dev container"
	@echo ""
	@echo "Production Deployment (VPS Mode / behind Traefik):"
	@echo "  make up              - Start the production container locally"
	@echo "  make down            - Stop the production container locally"
	@echo "  make deploy-improv   - Deploy configuration and pull/run image on VPS"
	@echo "======================================================================"

# Dev commands (Local Dev)
dev-up:
	docker compose -f docker/docker-compose.yml --env-file .env up -d

dev-down:
	docker compose -f docker/docker-compose.yml --env-file .env down

# Production commands (Local Prod mode)
up:
	docker compose -f docker/docker-compose.prod.yml --env-file .env up -d

down:
	docker compose -f docker/docker-compose.prod.yml --env-file .env down

# Automation VPS Deployment
deploy-improv:
	@echo "🚀 Deploying improv-assist to VPS..."
	# 1. Ensure the remote directory exists
	ssh $(VPS_SSH) "mkdir -p $(VPS_PATH)"
	# 2. SCP docker-compose.prod.yml and rename env file on the remote server
	scp docker/docker-compose.prod.yml $(VPS_SSH):$(VPS_PATH)/docker-compose.prod.yml
	scp docker/.env.prod $(VPS_SSH):$(VPS_PATH)/.env
	# 3. Pull new image from GHCR and recreate container
	ssh $(VPS_SSH) "cd $(VPS_PATH) && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --build"
	@echo "✅ Deployment completed on VPS!"