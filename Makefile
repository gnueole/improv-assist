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
VPS_SSH              := eole.me
VPS_PROJECT_NAME     := $(shell git config --get remote.origin.url | sed 's/.*\///; s/\.git$$//')
VPS_PROJECT_TAG      := $(shell git rev-parse --short HEAD 2>/dev/null || echo "dev")
VPS_PATH             := /home/eole/projects/$(VPS_PROJECT_NAME)

PROJECT_NAME         := $(shell echo $(VPS_PROJECT_NAME) | cut -d'-' -f1 | sed 's/./\u&/')
VERSION              := $(shell node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")

# 🔑 SECRETS MANAGEMENT (DOPPLER)
DOPPLER_PROJECT     := eole-me
DOPPLER_CONFIG_DEV  := dev_$(DOPPLER_PROJECT)-$(shell echo $(PROJECT_NAME) | tr '[:upper:]' '[:lower:]')
DOPPLER_CONFIG_PROD := prd_$(DOPPLER_PROJECT)-$(shell echo $(PROJECT_NAME) | tr '[:upper:]' '[:lower:]')

# Find doppler binary (robust check for WSL non-interactive paths)
DOPPLER := $(shell which doppler 2>/dev/null || ( [ -f $(HOME)/bin/doppler ] && echo $(HOME)/bin/doppler ) || echo doppler)

# 🛠️ LOCAL DOCKER CONFIGURATION
DOCKER_DIR   := docker
COMPOSE_DEV  := $(DOCKER_DIR)/docker-compose.yml
COMPOSE_PROD := $(DOCKER_DIR)/docker-compose.prod.yml

.PHONY: help dev-up dev-down up down restart deploy deploy-delay checklogs sync-n8n-token

# ==============================================================================
# ℹ️ HELP MENU
# ==============================================================================
help:
	@echo "======================================================================"
	@echo "                   🛠️  $(PROJECT_NAME) Project Makefile 🛠️"
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
	@echo "🚀 $(PROJECT_NAME) ($(VERSION) / $(VPS_PROJECT_TAG)) is ready locally! (http://localhost:3000)"

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
	@echo "🚀 Deploying $(PROJECT_NAME) stack [$(VPS_PROJECT_TAG)] [$(VERSION)] to VPS '[$(VPS_SSH)]' on '[$(VPS_PATH)]'..."
# 1. Ensure the remote deployment directory exists
	ssh $(VPS_SSH) "mkdir -p $(VPS_PATH)"
# 2. SCP the production compose file
	scp $(COMPOSE_PROD) $(VPS_SSH):$(VPS_PATH)/docker-compose.prod.yml
# 3. Stream production secrets from Doppler to remote VPS .env
	@if $(DOPPLER) --version >/dev/null 2>&1; then \
		echo "🔑 Envoi des secrets de production Doppler vers le VPS..."; \
		if $(DOPPLER) secrets download --project $(DOPPLER_PROJECT) --config $(DOPPLER_CONFIG_PROD) --no-file --format env > docker/.env.prod.temp; then \
			scp docker/.env.prod.temp $(VPS_SSH):$(VPS_PATH)/.env; \
			rm -f docker/.env.prod.temp; \
		else \
			echo "❌ Error: Doppler secrets download failed for project $(DOPPLER_PROJECT) (config: $(DOPPLER_CONFIG_PROD))!"; \
			rm -f docker/.env.prod.temp; \
			exit 1; \
		fi; \
	else \
		echo "❌ Error: Doppler CLI is not installed or not found in PATH!"; \
		exit 1; \
	fi
# 4. Pull the immutable image from GHCR and recreate containers (NO local build)
	@echo "📥 Pulling latest immutable image from GHCR..."
	ssh $(VPS_SSH) "cd $(VPS_PATH) && \
		docker compose -f docker-compose.prod.yml pull && \
		docker compose -f docker-compose.prod.yml up -d --remove-orphans"
	@echo "✅ Deployment of $(PROJECT_NAME) [$(VERSION) / $(VPS_PROJECT_TAG)] successfully completed on production server !"

checklogs:
	@echo "📟 Fetching real-time production logs from VPS [$(VPS_SSH)]..."
	ssh $(VPS_SSH) "cd $(VPS_PATH) && docker compose -f docker-compose.prod.yml logs -f"

deploy-delay:
	@echo "⏳ Waiting 150 seconds for GitHub Actions build to complete..."
	git push && sleep 150 && $(MAKE) deploy

sync-n8n-token:
	@echo "🔑 Syncing Webhook token credential to n8n server..."
	uv run --directory C:/Users/gnueo/.gemini/config/plugins/n8n-sync-plugin/skills/n8n-sync scripts/sync_n8n.py --sync-token --dir $(CURDIR)/n8n --credential-name improv-assist-token $(ARGS)