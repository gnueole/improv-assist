# ==============================================================================
# 🎭 HOUBA HOUBA ! — IMPROVISATION THEATER ENGINE
# ==============================================================================
# Description : Local development management and automated VPS deployment.
# Version     : 1.3.0
# Author      : Éole <hi@eole>
# Date        : $Creation Date$
# License     : MIT
# Troubleshooting 504: ssh eole.me "docker network connect jobby-md2html_default <real_traefik_container_name>"
# ==============================================================================

# ⚙️ INFRASTRUCTURE VARIABLES (SECURED)
# Uses the local ~/.ssh/config host alias to avoid hardcoding credentials.
VPS_SSH  := eole.me
VPS_PATH := /home/eole/projects/jobby-md2html/improv-assist

# 🛠️ LOCAL DOCKER CONFIGURATION
DOCKER_DIR   := docker
COMPOSE_DEV  := $(DOCKER_DIR)/docker-compose.yml
COMPOSE_PROD := $(DOCKER_DIR)/docker-compose.prod.yml

.PHONY: help dev-up dev-down up down restart deploy

# ==============================================================================
# ℹ️ HELP MENU
# ==============================================================================
help:
	@echo "======================================================================"
	@echo "          🐸  HOUBA HOUBA ! — MAKEFILE CONFIGURATION  🐸"
	@echo "======================================================================"
	@echo "💻 LOCAL DEVELOPMENT (WSL LOCALHOST):"
	@echo "  make up            - Start local dev environment with HMR (Port 3000)"
	@echo "  make down          - Stop local dev environment"
	@echo "  make restart       - Restart local dev environment (down && up)"
	@echo ""
	@echo "🚀 PRODUCTION DEPLOYMENT (VPS - impro.eole.me):"
	@echo "  make deploy        - Push config and pull immutable image from GHCR"
	@echo "======================================================================"

# ==============================================================================
# 💻 DEVELOPMENT COMMANDS (LOCAL)
# ==============================================================================
dev-up:
	@echo "✨ Starting local development environment..."
	-docker rm -f improv-assist-frontend-dev
	docker compose -f $(COMPOSE_DEV) --env-file .env up -d
	@echo "🚀 Houba Houba ! is ready locally on port 3000."

dev-down:
	@echo "🛑 Stopping local development container..."
	docker compose -f $(COMPOSE_DEV) --env-file .env down

# ==============================================================================
# 📦 PRODUCTION COMMANDS (LOCAL TEST)
# ==============================================================================
up: dev-up

down: dev-down

restart: down up

# ==============================================================================
# 🚀 AUTOMATED DEPLOYMENT PIPELINE (VPS)
# ==============================================================================
deploy:
	@echo "🚀 Deploying Houba Houba ! to VPS Target [$(VPS_SSH)]..."
# 1. Ensure the remote deployment directory exists
	ssh $(VPS_SSH) "mkdir -p $(VPS_PATH)"
# 2. SCP the production compose file and environment file
	scp $(COMPOSE_PROD) $(VPS_SSH):$(VPS_PATH)/docker-compose.prod.yml
	scp $(DOCKER_DIR)/.env.prod $(VPS_SSH):$(VPS_PATH)/.env
# 3. Pull the immutable image from GHCR and recreate containers (NO local build)
	@echo "📥 Pulling latest immutable image from GHCR..."
	ssh $(VPS_SSH) "cd $(VPS_PATH) && \
		docker compose -f docker-compose.prod.yml pull && \
		docker compose -f docker-compose.prod.yml up -d --remove-orphans"
	@echo "✅ Deployment successfully completed on production server !"

checklogs:
	@echo "📟 Fetching real-time production logs from VPS [$(VPS_SSH)]..."
	ssh $(VPS_SSH) "cd $(VPS_PATH) && docker compose -f $$(basename $(COMPOSE_PROD)) logs -f"