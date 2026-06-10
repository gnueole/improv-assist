# 🎭 Houba Houba ! — Architecture Technique

Ce document décrit l'architecture globale, la structure des données et les flux de communication de l'application **Houba Houba !**.

---

## 🏗️ Vue d'ensemble de l'Architecture

L'application repose sur un modèle hybride découplant l'interface utilisateur, une couche d'automatisation faisant office de *Backend-as-a-Service* (BaaS), et des intégrations tierces (Notion et Google Gemini).

```mermaid
graph TD
    subgraph Client [Client PWA - Navigateur]
        UI[Dashboard / Générateurs] <--> Hook[useImprovBuffer]
        Hook <--> Provider[ImprovBufferProvider]
        Provider <--> LS[(LocalStorage Cache)]
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
    Provider --> R_Constraints
    Provider --> R_Feedback
    Provider --> R_Regen

    %% API links
    R_Constraints -.-> Cache[(notionConstraints.json)]
    R_Feedback --> N_Feedback
    R_Regen --> N_BaaS

    %% BaaS links
    N_Feedback --> Notion
    N_BaaS --> Gemini
```

---

## 📂 Structure des Répertoires

Le projet est organisé selon une structure modulaire séparant les configurations d'infrastructure, les scénarios d'automatisation, et le code source de l'application Next.js :

* **`/docker`** : Contient les `Dockerfile` (dev et prod) et les configurations Docker Compose définissant les conteneurs et les variables d'environnement.
* **`/images`** : Héberge les captures d'écran et ressources visuelles intégrées dans la documentation du projet.
* **`/n8n`** : Versionne localement les workflows n8n (`improv-assist-baas.json` et `improv-feedback.json`) ainsi que les prompts système (`prompts/master.prompt`) pour assurer la cohérence entre les versions de code et les automatisations.
* **`/public`** : Fichiers statiques servis directement par Next.js, y compris le cache local `/data/reservoir-config.json` généré par l'IA.
* **`/scripts`** : Regroupe les outils utilitaires, notamment le script Python de peuplement du réservoir (`populate_reservoir.py`) et les scripts de validation.
* **`/src`** : Code source principal de l'application :
  * `app/` : Routes Next.js (pages de l'App Router et endpoints d'API proxifiés).
  * `components/` : Composants UI réutilisables (générateurs, modaux, vues de paramétrage).
  * `context/` : Contextes React partagés ([ImprovBufferContext.tsx](file:///c:/Projects/eole.me/improv-assist/src/context/ImprovBufferContext.tsx)) pour centraliser l'état global et les connexions n8n.
  * `hooks/` : Hooks personnalisés gérant la logique d'état ([useImprovBuffer.ts](file:///c:/Projects/eole.me/improv-assist/src/hooks/useImprovBuffer.ts), `useDevMode`, `useToast`).
  * `types/` : Déclarations de types et interfaces TypeScript.
  * `utils/` : Fonctions utilitaires partagées (`bufferUtils`).

---

## ⚖️ Choix Techniques et Justifications

* **Next.js 15 & React 19** : Ce choix offre une infrastructure performante avec le rendu hybride (Static Site Generation côté serveur pour un affichage instantané et API Routes pour servir de passerelle proxy sécurisée). Les optimisations de React 19 améliorent la gestion du cycle de vie des états locaux.
* **Centralisation de l'état avec React Context** : Afin d'éviter la fragmentation de l'état du buffer d'improvisation entre les différents composants générateurs indépendants (ce qui causait des tirages dupliqués ou désynchronisés), nous avons introduit un contexte global ([ImprovBufferContext.tsx](file:///c:/Projects/eole.me/improv-assist/src/context/ImprovBufferContext.tsx)). Toutes les opérations sur le réservoir (tirage, rechargement, synchronisation `localStorage`, bascules de secours vers n8n) passent par ce provider unique.
* **n8n comme BaaS (Backend-as-a-Service)** : L'utilisation de n8n évite d'avoir à coder, sécuriser et maintenir un serveur API traditionnel complexe (Express, Django). Les intégrations tierces (Google Gemini, Notion) sont implémentées visuellement sous forme de workflows versionnés et exportables en JSON.
* **Double système de cache (Local & Distant)** : L'expérience sur scène requiert une réactivité instantanée et une tolérance totale aux pannes réseau. Les données sont donc pré-chargées localement (`reservoir-config.json` pour les générateurs, `notionConstraints.json` pour les contraintes) et synchronisées dans le `localStorage` du client.
* **Web Audio API** : Le Timer de Scène génère des cloches et alertes sonores de manière synthétique à l'aide d'oscillateurs natifs du navigateur. Cela évite d'avoir à charger ou héberger des fichiers audio MP3 volumineux, réduisant le poids global de la PWA et garantissant son fonctionnement hors-ligne.

---

## 🧠 Défis Techniques Résolus

* **Gestion de la Réponse Vide sur Surcharge IA** : Lorsque le modèle Gemini dépasse ses quotas gratuits (erreur 429), le nœud LangChain n8n renvoyait un tableau vide `[]`, ce qui court-circuitait le reste du workflow et renvoyait un code HTTP `200` vide, cassant le parsing JSON du client. Résolu en paramétrant le nœud Gemini sur `continueErrorOutput` et en connectant son port d'erreur au nœud de secours JavaScript pour renvoyer le réservoir d'improvisation de secours.
* **Contournement des limitations de Quotas (Rate Limiting)** : La génération de 150 suggestions par l'IA consomme beaucoup de requêtes. La logique client (`useImprovBuffer.ts`) a été conçue pour consommer en priorité le réservoir local persistant, et ne solliciter le webhook n8n en temps réel que pour un seul élément à la fois en cas de réservoir complètement vide, minimisant drastiquement l'usage de jetons.
* **Hydratation React en PWA et LocalStorage** : Le chargement d'états depuis le `localStorage` du navigateur pendant la phase d'initialisation provoquait des avertissements de divergence d'hydratation (le rendu serveur de Next.js différant du stockage local du client). Ce défi a été résolu en externalisant et en isolant les lectures de stockage dans des hooks secondaires (`useDevMode`, `useToast`) et en différant l'hydratation du buffer principal dans un `useEffect` exécuté uniquement côté client.

---

## 💻 1. Couche Frontend (Client PWA)

Le frontend est construit avec **Next.js 15 (App Router)** et **React 19**. Il est conçu pour être entièrement **mobile-first**, réactif, et installable en tant que **PWA** (Progressive Web App) pour un fonctionnement hors-ligne optimal.

### Composants Clés
* **[page.tsx](file:///c:/Projects/eole.me/improv-assist/src/app/page.tsx)** : Orchestrateur central. Il gère l'état d'affichage du tableau de bord (grid de tuiles), l'ajustement dynamique de la taille du texte, l'historique virtuel de navigation, et l'affichage des modaux d'aide/RGPD.
* **[ImprovBufferContext.tsx](file:///c:/Projects/eole.me/improv-assist/src/context/ImprovBufferContext.tsx)** : Provider global qui encapsule la logique d'initialisation du buffer, le stockage local (`localStorage`), la mise à jour transactionnelle du pool de prompts et les appels vers l'API.
* **[useImprovBuffer.ts](file:///c:/Projects/eole.me/improv-assist/src/hooks/useImprovBuffer.ts)** : Hook client personnalisé consommant le contexte partagé pour exposer l'état unifié du buffer et ses contrôles (tirage, rechargement, diagnostic d'erreurs n8n) à chaque tuile de génération.
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
