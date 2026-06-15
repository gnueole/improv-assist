# ==============================================================================
# 🎭 HOUBA HOUBA! — IMPROVISATION THEATER ENGINE
# ==============================================================================
# Description : Local development management and automated VPS deployment.
# Version     : 1.3.1
# Author      : Éole <hi@eole>
# License     : MIT
# Troubleshooting 504: ssh eole.me "docker network connect jobby-md2html_default <real_traefik_container_name>"
# ==============================================================================

# ⚙️ INFRASTRUCTURE VARIABLES (SECURED)
VPS_SSH  := eole.me
VPS_PATH := /home/eole/projects/jobby-md2html/improv-assist

# 🔑 SECRETS MANAGEMENT (DOPPLER)
# check doppler.com for information on how to use it
DOPPLER_PROJECT     := eole-me
DOPPLER_CONFIG_DEV  := dev_eole-me-impro
DOPPLER_CONFIG_PROD := prd_eole-me-impro

# Find doppler binary (robust check for WSL non-interactive paths)
DOPPLER := $(shell which doppler 2>/dev/null || ( [ -f $(HOME)/bin/doppler ] && echo $(HOME)/bin/doppler ) || echo doppler)

# 🛠️ LOCAL DOCKER CONFIGURATION
DOCKER_DIR   := docker
COMPOSE_DEV  := $(DOCKER_DIR)/docker-compose.yml
COMPOSE_PROD := $(DOCKER_DIR)/docker-compose.prod.yml

.PHONY: help dev-up dev-down up down restart deploy deploy-delay checklogs

# ==============================================================================
# ℹ️ HELP MENU
# ==============================================================================
help:
	@echo "======================================================================"
	@echo "          ??  HOUBA HOUBA! — MAKEFILE CONFIGURATION  ??"
	@echo "======================================================================"
	@echo "💻 LOCAL DEVELOPMENT (WSL LOCALHOST):"
	@echo "  make up            - Start local dev environment with HMR (Port 3000)"
	@echo "  make down          - Stop local dev environment"
	@echo "  make restart       - Restart local dev environment (down && up)"
	@echo ""
	@echo "🚀 PRODUCTION DEPLOYMENT (VPS - impro.eole.me):"
	@echo "  make deploy        - Push config and pull immutable image from GHCR"
	@echo "  make deploy-delay  - Wait 150s for GitHub Actions and then deploy"
	@echo "======================================================================"

# ==============================================================================
# 💻 DEVELOPMENT COMMANDS (LOCAL)
# ==============================================================================
dev-up:
	@echo "✨ Starting local development environment..."
	-docker rm -f improv-assist-frontend-dev
	@if $(DOPPLER) --version >/dev/null 2>&1; then \
		echo "🔑 Downloading development secrets from Doppler ($(DOPPLER_PROJECT))..."; \
		$(DOPPLER) secrets download --project $(DOPPLER_PROJECT) --config $(DOPPLER_CONFIG_DEV) --no-file --format env > .env; \
	elif [ ! -f .env ]; then \
		echo "⚠️ Doppler CLI not found. Copying $(DOCKER_DIR)/.env.example as .env fallback..."; \
		cp $(DOCKER_DIR)/.env.example .env; \
	fi
	docker compose -f $(COMPOSE_DEV) --env-file .env up -d
	@echo "🚀 Houba Houba! is ready locally at http://localhost:3000"

dev-down:
	@echo "🛑 Stopping local development container..."
	if [ -f .env ]; then docker compose -f $(COMPOSE_DEV) --env-file .env down; else docker compose -f $(COMPOSE_DEV) down; fi

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
	@echo "🚀 Deploying Houba Houba! to VPS Target [$(VPS_SSH)]..."
# 1. Ensure the remote deployment directory exists
	ssh $(VPS_SSH) "mkdir -p $(VPS_PATH)"
# 2. SCP the production compose file
	scp $(COMPOSE_PROD) $(VPS_SSH):$(VPS_PATH)/docker-compose.prod.yml
# 3. Stream production secrets from Doppler to remote VPS .env or fallback
	@if $(DOPPLER) --version >/dev/null 2>&1; then \
		echo "🔑 Fetching production secrets from Doppler (project: $(DOPPLER_PROJECT) / config: $(DOPPLER_CONFIG_PROD))..."; \
		$(DOPPLER) secrets download --project $(DOPPLER_PROJECT) --config $(DOPPLER_CONFIG_PROD) --no-file --format env | ssh $(VPS_SSH) "cat > $(VPS_PATH)/.env"; \
	else \
		echo "⚠️ Doppler CLI not found. Copying local $(DOCKER_DIR)/.env.prod as fallback..."; \
		scp $(DOCKER_DIR)/.env.prod $(VPS_SSH):$(VPS_PATH)/.env; \
	fi
# 4. Pull the immutable image from GHCR and recreate containers (NO local build)
	@echo "📥 Pulling latest immutable image from GHCR..."
	ssh $(VPS_SSH) "cd $(VPS_PATH) && \
		docker compose -f docker-compose.prod.yml pull && \
		docker compose -f docker-compose.prod.yml up -d --remove-orphans"
	@echo "✅ Deployment successfully completed on production server!"

checklogs:
	@echo "📟 Fetching real-time production logs from VPS [$(VPS_SSH)]..."
	ssh $(VPS_SSH) "cd $(VPS_PATH) && docker compose -f docker-compose.prod.yml logs -f"

deploy-delay:
	@echo "⏳ Waiting 150 seconds for GitHub Actions build to complete..."
	git push && sleep 150 && $(MAKE) deploy