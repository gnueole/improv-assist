.PHONY: help up down dev-up dev-down sync deploy-improv

# Variables de connexion VPS
VPS_SSH  := root@n8n.eole.me
VPS_PATH := /docker/improv-assist

# Default help display
help:
	@echo "======================================================================"
	@echo "          🎭  improv-assist Project Makefile 🎭"
	@echo "======================================================================"
	@echo "Local Development (Dev Mode):"
	@echo "  make dev-up          - Start the local dev container with HMR (port 3000)"
	@echo "  make dev-down        - Stop the local dev container"
	@echo "  make sync            - Pull constraints and docs from Notion database/page"
	@echo ""
	@echo "Production Deployment (VPS Mode / behind Traefik):"
	@echo "  make up              - Start the production container locally"
	@echo "  make down            - Stop the production container locally"
	@echo "  make deploy-improv   - Deploy configuration and pull/run image on VPS"
	@echo "======================================================================"

# Dev commands (Local Dev)
dev-up:
	docker compose -f docker-compose.yml up -d

dev-down:
	docker compose -f docker-compose.yml down

# Sync commands
sync:
	node notion_fetch.js

# Production commands (Local Prod mode)
up:
	docker compose -f docker-compose.prod.yml up -d

down:
	docker compose -f docker-compose.prod.yml down

# Automation VPS Deployment
deploy-improv:
	@echo "🚀 Deploying improv-assist to VPS..."
	# 1. Ensure the remote directory exists
	ssh $(VPS_SSH) "mkdir -p $(VPS_PATH)"
	# 2. SCP docker-compose.prod.yml and .env.prod (as .env) to VPS
	scp docker-compose.prod.yml $(VPS_SSH):$(VPS_PATH)/docker-compose.prod.yml
	scp .env.prod $(VPS_SSH):$(VPS_PATH)/.env
	# 3. Pull new image from GHCR and recreate container
	ssh $(VPS_SSH) "cd $(VPS_PATH) && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d"
	@echo "✅ Deployment completed on https://improv.eole.me !"