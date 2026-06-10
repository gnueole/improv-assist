# 🎭 Houba Houba ! — Architecture Technique

Ce document décrit l'architecture globale, la structure des données et les flux de communication de l'application **Houba Houba !**.

---

## 🏗️ Vue d'ensemble de l'Architecture

L'application repose sur un modèle hybride découplant l'interface utilisateur, une couche d'automatisation faisant office de *Backend-as-a-Service* (BaaS), et des intégrations tierces (Notion et Google Gemini).

```mermaid
graph TD
    subgraph Client [Client PWA - Navigateur]
        UI[Dashboard / Générateurs] <--> Hook[useImprovBuffer]
        Hook <--> LS[(LocalStorage Cache)]
        Audio[Web Audio API / Speech]
    end

    subgraph API [Next.js API Routes]
        R_Feedback[/api/feedback]
        R_Regen[/api/improv-regen]
        R_Constraints[/api/constraints]
    end

    subgraph BaaS [Automatisation - n8n]
        N_Feedback[Improv-Feedback]
        N_BaaS[Improv-Assist BaaS]
    end

    subgraph Tierce [Services Externes]
        Notion[(Notion Database)]
        Gemini[Google Gemini API]
    end

    %% Client links
    UI --> Audio
    Hook --> R_Constraints
    Hook --> R_Feedback
    Hook --> R_Regen

    %% API links
    R_Constraints -.-> Cache[(notionConstraints.json)]
    R_Feedback --> N_Feedback
    R_Regen --> N_BaaS

    %% BaaS links
    N_Feedback --> Notion
    N_BaaS --> Gemini
```

---

## 💻 1. Couche Frontend (Client PWA)

Le frontend est construit avec **Next.js 15 (App Router)** et **React 19**. Il est conçu pour être entièrement **mobile-first**, réactif, et installable en tant que **PWA** (Progressive Web App) pour un fonctionnement hors-ligne optimal.

### Composants Clés
* **[page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx)** : Orchestrateur central. Il gère l'état d'affichage du tableau de bord (grid de tuiles), l'ajustement dynamique de la taille du texte, l'historique virtuel de navigation, et l'affichage des modaux d'aide/RGPD.
* **[useImprovBuffer.ts](file:///c:/Projects/eole.me/improv-assist/src/hooks/useImprovBuffer.ts)** : Hook personnalisé gérant le réservoir de prompts. Il stocke les listes dans le `localStorage` pour éviter la répétition des suggestions. En cas d'épuisement d'une catégorie, il lance une requête dynamique vers l'API.
* **[ImprovTimer.tsx](file:///c:/Projects/eole.me/improv-assist/src/components/ImprovTimer.tsx)** : Chronomètre autonome utilisant la **Web Audio API** pour synthétiser des sons de cloche (sans charger de fichiers audio externes volumineux) et l'API de synthèse vocale du navigateur pour annoncer le temps.
* **[WhoStarts.tsx](file:///c:/Projects/eole.me/improv-assist/src/components/WhoStarts.tsx)** : Outil de tirage au sort interactif exploitant les événements de contact multi-touch du navigateur (`PointerEvents`) avec retour visuel immédiat.

---

## 🚦 2. Couche Proxy API (Next.js API Routes)

Pour sécuriser les clés d'intégration et contourner les restrictions de CORS, l'application Next.js fait office de proxy d'API intermédiaire :

1. **`/api/constraints`** : Lit et sert le fichier de cache statique `notionConstraints.json` compilé localement.
2. **`/api/feedback`** : Transmet les formulaires de retour utilisateur au webhook de n8n.
3. **`/api/improv-regen`** : Transmet les demandes de génération de prompts en lot à l'automatisation n8n.

---

## ⚙️ 3. Couche Backend & Automatisation (n8n BaaS)

L'intelligence métier et les enregistrements sont gérés par deux flux d'automatisation hébergés sur un serveur **n8n** :

### A. Flux de Feedback (`Improv-Feedback`)
* **Déclencheur** : Webhook POST sur `/webhook/improv-feedback`.
* **Action** : Insère le nom, le type, la note (score 1-5 étoiles) et le commentaire dans une base de données Notion dédiée.
* **Gestion d'Erreur** : Si Notion renvoie une erreur (ex: limite d'API ou erreur de schéma), le flux intercepte l'erreur grâce à `"onError": "continue"` et renvoie un statut HTTP `500` avec la description de l'erreur au client.

### B. Flux d'IA & Génération (`Improv-Assist BaaS`)
* **Déclencheur** : Webhook POST sur `/webhook/improv-regen`.
* **Action** : Interroge le modèle **Gemini 2.5 Flash** (via LangChain) avec un prompt système structuré pour générer un lot complet d'idées d'improvisation au format JSON.
* **Gestion d'Erreur** : En cas de panne ou de quota d'API dépassé, le flux bascule automatiquement vers un noeud de code JavaScript contenant un jeu complet de données de secours (*mock data*), garantissant que l'application reçoive toujours une réponse exploitable.

---

## 📂 4. Gestion et Synchronisation des Données

L'application utilise deux types de fichiers de données persistés localement :

1. **`notionConstraints.json`** : Contient le guide des contraintes d'impro théâtrale. Ce cache local est rafraîchi lors des phases de build ou par tâche périodique en exécutant le script d'intégration :
   ```bash
   node notion_fetch.js
   ```
2. **`reservoir-config.json`** : Réservoir de prompts utilisé par les générateurs hors-ligne. Il peut être régénéré en interrogeant l'IA via le script Python en environnement de développement :
   ```bash
   wsl python3 scripts/populate_reservoir.py
   ```

---

## 🚀 5. Déploiement et Infrastructure

L'infrastructure est entièrement conteneurisée à l'aide de Docker.

* **WSL / Localhost** : Environnement de développement lancé via Docker Compose et géré localement à l'aide de raccourcis Makefile :
  * `make up` : Lance le serveur Next.js en mode développement avec Hot Module Replacement (HMR) sur le port 3000.
  * `make down` : Éteint le conteneur proprement.
  * `make restart` : Redémarre l'environnement.
* **VPS (Production - impro.eole.me)** :
  * **CI/CD** : Chaque push sur la branche `main` déclenche un workflow GitHub Actions qui compile une image de production Docker immuable et la publie sur le registre GitHub Packages (GHCR).
  * **Déploiement** : La commande `make deploy-delay` permet de pousser automatiquement les fichiers de configuration de production via SSH/SCP sur le VPS, d'attendre la fin de la compilation CI/CD, puis de recréer les conteneurs de production derrière le proxy inverse **Traefik**.
