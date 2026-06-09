# ==============================================================================
# 🐸 HOUBA HOUBA ! — MOTEUR D'IMPROVISATION THÉÂTRALE
# ==============================================================================
# Description : Pilotage de l'environnement de développement local sous WSL.
# Version     : 1.1.0
# Équipe      : Éole Wind (EFIT)
# ==============================================================================

# ⚙️ CONFIGURATION INTERNE
COMPOSE_DEV  := docker-compose.yml
COMPOSE_PROD := docker-compose.prod.yml

# 🎯 CIBLES PRINCIPALES
.PHONY: dev dev-build down clean logs help

# 🟢 DÉMARRAGE
dev:
	@echo "✨ Lancement de l'environnement de dev local..."
	docker compose -f $(COMPOSE_DEV) up -d
	@echo "🚀 Houba Houba ! est disponible en local."

# 🛠️ RECOMPILATION LOCAL
dev-build:
	@echo "⚡ Reconstruction des couches Docker locales..."
	docker compose -f $(COMPOSE_DEV) up -d --build

# 🔴 ARRÊT
down:
	@echo "🛑 Arrêt des conteneurs locaux..."
	docker compose -f $(COMPOSE_DEV) down

# 🧹 NETTOYAGE PROFOND
clean:
	@echo "🧼 Purge complète : conteneurs, volumes et orphelins..."
	docker compose -f $(COMPOSE_DEV) down -v --remove-orphans

# 📋 LOGS STREAMING
logs:
	@echo "📟 Flux de logs du frontend (Ctrl+C pour quitter)..."
	docker compose -f $(COMPOSE_DEV) logs -f

# ℹ️ AIDE
help:
	@echo "=================================================================="
	@echo "💻 COMMANDES DISPONIBLES POUR LE DEV LOCAL :"
	@echo "=================================================================="
	@echo "  make dev        : Démarre l'application en arrière-plan"
	@echo "  make dev-build  : Force la reconstruction du conteneur (ex: npm install)"
	@echo "  make down       : Arrête les conteneurs"
	@echo "  make clean      : Arrête et supprime TOUS les volumes locaux"
	@echo "  make logs       : Affiche les logs du serveur Next.js en temps réel"
	@echo "=================================================================="