# 🎭 Houba Houba !

<p align="center">
  <img src="images/improv-assist-beta2.jpg" alt="Houba Houba ! — Moteur d'improvisation" />
</p>

`Houba Houba !` is a modern, mobile-first Progressive Web Application (PWA) designed to aid improv theater actors and referees during training, workshops, and matches. It provides utilities to randomize scene parameters, time improvisations, and consult game rules/constraints.

The application is styled with a sleek dark aesthetic utilizing vibrant iridescent highlights and glassmorphism, tailored for mobile screens and immediate interaction.

---

[![Build and Push Docker Image to GHCR](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml/badge.svg)](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml)

## 🌟 Key Features

| Fonctionnalité | Description |
| :--- | :--- |
| **🎭 Générateur d'Émotions** | Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de **1 à 10**. |
| **👆 Qui Commence ? (Multi-touch)** | Tirage au sort interactif pour désigner qui débute la scène. Posez jusqu'à 5 doigts sur l'écran. Après un décompte de 3 secondes, le vainqueur est choisi aléatoirement. |
| **📍 Suggestion de Lieu & Époque** | Suggestions instantanées de cadres physiques et de temporalités pour situer vos histoires. |
| **⏳ Timer de Scène** | Un chronomètre préréglé sur 2 minutes 30 secondes (durée standard d'improvisation) affichant un message de fin dynamique. |
| **⚡ Règles du Hi Ha** | Guide de référence rapide listant les 10 gestes et réflexes officiels du jeu d'échauffement collectif. |
| **📚 Contraintes & Docs** | Affiche les contraintes et guides d'improvisation récupérés directement depuis un espace de travail Notion partagé. |
| **📦 Réservoir de Prompts (Data Pool)** | Pour éviter de tirer plusieurs fois les mêmes suggestions, les prompts sont piochés dans un réservoir local et consommés dynamiquement. Si le réservoir se vide, des données de repli sont utilisées. |
| **🔄 Régénération par l'IA (Gemini via n8n)** | Permet de recharger le réservoir local avec de nouvelles idées générées par l'IA en cliquant sur les flèches de rotation en haut à droite. |
| **🚦 Indicateur de connexion Gemini (n8n)** | Un voyant lumineux indique l'état de l'API. Si vous effectuez trop de recharges, vous consommerez tous les jetons (tokens) gratuits de l'API Gemini, ce qui provoquera une erreur (voyant **rouge**). |


---

## ⚙️ Notion Synchronization

Le cache local est généré en synchronisant certaines données depuis Notion vers `src/data/notionConstraints.json` pour un fonctionnement hors-ligne optimal :
```bash
node notion_fetch.js
```

---

## 🚀 Getting Started

### Prerequisites
- Docker (testé avec WSL2)
- Node.js (version 20+)
- npm
- Une Database (Notion ou autre) pour interfacer avec les prompts de l'application (optionnel).
- Un compte n8n pour interfacer avec les prompts de l'application et l'IA et les envois d'emails (optionnel).
- Une clé Gemini pour regénérer des prompts de remplacement (optionnel).

### Local Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build and Start Production Bundle**:
   ```bash
   npm run build
   npm start
   ```

---

## 🏗️ Architecture Technique

Pour en savoir plus sur l'organisation des composants client, l'orchestration des API proxies, la logique d'automatisation n8n et l'infrastructure de déploiement, veuillez consulter le document **[Architecture.md](Architecture.md)**.

---

## 🐳 Docker & Makefile

L'application est entièrement conteneurisée et gérée de manière simplifiée à l'aide d'un `Makefile` en local ou dans WSL.

| Commande | Action |
| :--- | :--- |
| `make up` | Démarre le conteneur de développement local avec HMR (Port 3000 - [http://localhost:3000](http://localhost:3000)) |
| `make down` | Arrête le conteneur de développement local |
| `make restart` | Redémarre l'environnement de développement local (down puis up) |
| `make deploy` | Déploie automatiquement l'application sur le VPS de production |
| `make deploy-delay` | Envoie les commits, attend 150 secondes pour laisser le temps à GitHub Actions de compiler, puis déploie |
| `make checklogs` | Affiche les journaux de production du VPS en temps réel |

### Résolution d'erreur 504 (Passerelle Traefik)
Si le VPS renvoie une erreur *504 Gateway Timeout*, reconnectez le réseau de Traefik au conteneur de l'application :
```bash
ssh eole.me "docker network connect jobby-md2html_default <nom_du_conteneur_traefik>"
```

---

## 🛠️ Stack & Technologies

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS 3 (Grid responsive 2 colonnes avec tuiles carrées en Glassmorphism), PostCSS
- **Icones** : Lucide React (normalisées en taille et épaisseur pour une parfaite cohérence visuelle)
- **Déploiement** : Docker Standalone multi-stage via GHCR

---

## 📋 Wishlist / Todo

Voici les fonctionnalités futures envisagées (ou pas, ou pas) pour enrichir l'application :
- [ ] **Idées de tuiles à rajouter** : 
  - Personnas avec tips et variantes
  - Animaux 
  - Objets
  - Un grand mixer pour créer ses propres combinaisons les plus folles !

- [ ] **Ajout de nouvelles tuiles freemium/premium** : Pour financer l'application (voire la rendre pérenne), il faudrait ajouter de nouvelles tuiles personalisées payantes ou via un abonnement mensuel/annuel.
- [ ] **Application Mo MOBILE** : Développer une application mobile pour Android et iOS. Cela permettrait d'avoir des notifications push, des widgets, etc.
- [ ] **Mode Hors-ligne 100% autonome (Service Worker)** : Améliorer le cache de l'application pour un fonctionnement optimal sans connexion réseau via un Service Worker robuste.
- [ ] **Historique de jeu & Historique des tirages** : Garder une trace locale (dans le `localStorage`) des 10 dernières improvisations jouées pour éviter les doublons absolus d'une séance sur l'autre.
- [ ] **Timer avancé avec buzzer** : Ajouter des sons de buzzer de fin configurables, ainsi que la possibilité de régler le temps libre.
- [ ] **Multilingue (FR / EN)** : Traduction complète de l'application pour l'usage dans des festivals ou ateliers internationaux.

---

## 📝 Changelog

### Version 0.4 BETA (0.4-beta / 1.0.0-beta.4)
- **Notion Feedback Restoration**: Switched block appending in n8n from the buggy native Notion node to a standard `httpRequest` node. Reconfigured the payload structure to append real, native Notion headers (`## Details`, `## Message`) and list items (`bulleted_list_item`) for feedback submissions.
- **Generator Keyboard Shortcuts**: Added global Space and Enter keydown listeners on PC for all prompt generators (Emotions, Locations, Eras, and Generic) to trigger generation instantly, with automatic input fields bypass.
- **Optimized Buffer Reloads**: Refactored the dynamic pool empty reload to fetch 50 new items from n8n and merge them back into the global prompts queue in `localStorage`, drastically reducing server hits and enabling instant offline navigation.
- **Theatrical Timer Polish**:
  - Replaced the timer's final buzzer downtone with a synthesized 4-stage ascending arpeggio chime ("uptone") using the Web Audio API.
  - Made the timer text display glow like a bright neon light using high-contrast white-red dropshadow filters, ensuring perfect legibility on any gradient background.
  - Added a fast-paced, massive bouncing scale animation (`scale-panic` up to 1.6x) for the critical final 5 seconds of the countdown.
- **UI & UX Refinement**:
  - Relocated the remaining prompt counters inside individual generator cards for cleaner aesthetics.
  - Simplified the developer mode badge indicator text from "devMode" to "DEV".
  - Bumped all modals, help views, and technical documentation references to Version 0.4 BETA.

### Version 0.3 BETA (0.3-beta)
- **Refactoring & Centralisation (React Context)** : Migration du buffer d'improvisation vers un Context Provider global (`ImprovBufferContext`) pour synchroniser les tirages entre tous les générateurs, éliminer les tirages doublons et éviter les requêtes n8n concurrentes. Découpage modulaire du hook en sous-hooks (`useToast`, `useDevMode`) et utilitaires (`bufferUtils`).
- **Optimisation n8n & Réservoir de secours** : Extension du réservoir hors-ligne à **50 entrées par catégorie** (350 prompts au total) et sécurisation du workflow n8n via un double-port (succès/erreur) pour garantir le retour systématique du réservoir de secours lors des surcharges du modèle Gemini.
- **Ajout d'échauffements & Descriptions** : Intégration de descriptions explicatives en français pour les exercices d'échauffement et les contraintes (catégories) de jeu, guidant l'utilisateur directement depuis l'interface.
- **Ponçage des thèmes & Générateurs** : Enrichissement et affinage des listes de thèmes, époques, émotions et lieux pour maximiser la variété dramatique.
- **Envoi de feedback & RGPD** : Sélecteur de note par balayage/glissement tactile ou souris (1 à 5 étoiles) avec émoticônes dynamiques connecté à Notion ou la base de votre choix (via n8n), validation obligatoire du consentement RGPD et intégration d'un modal de politique de confidentialité.
- **Intégration de Feedback Email** : Mise en place d'un formulaire de feedback permettant aux utilisateurs de partager leurs expériences directement depuis l'application. Les données sont transmises via un workflow n8n qui envoie un email récapitulatif au propriétaire du site.
- **Conditions générales d'utilisation** : Ajout d'un modal de conditions générales d'utilisation conforme au RGPD et validation explicite du consentement utilisateur sur le formulaire de retour.

### Version BETA 2 (0.2-beta)
- **Architecture & Refactoring JSON** : Déplacement de la configuration des tuiles du tableau de bord et des données de repli des générateurs (émotions, lieux, époques) vers des fichiers JSON externes (`tiles.json`, `reservoir-config.json`).
- **Description des échauffements** : Ajout d'un champ description explicatif en français pour chaque exercice d'échauffement dans l'interface et le prompt système Gemini.
- **Robustesse n8n & Notion** : Gestion proactive des échecs d'API Notion dans le workflow n8n (renvoi d'une erreur 500 explicite et propagation propre au client).
- **Simplification Docker & Makefile** : Harmonisation des commandes de démarrage local (`make up` / `make down` / `make restart`) et isolation réseau locale complète pour éviter tout conflit de ports ou de réseaux Docker. Ajout de `make deploy-delay` pour automatiser l'attente du cycle de build CI/CD.
- **Normalisation du code** : Ajout d'en-têtes de commentaires de métadonnées normalisés pour toutes les classes, interfaces et routes d'API de l'application.

### Version Beta 1 (0.1-beta)
- Corrections de bugs.
- **Privacy & RGPD** : Ajout d'un modal de politique de confidentialité conforme au RGPD et validation explicite du consentement utilisateur sur le formulaire de retour.
- **Chemins d'URL dynamiques & Routage** : Association de chaque tuile à un sous-chemin d'URL dédié (ex: `/emotions`, `/timer`) pour un accès direct, avec des règles de réécriture (*rewrites*) Next.js pour empêcher les erreurs 404 lors du rafraîchissement d'une page.
- **Ajusteur de taille de texte** : Boutons d'ajustement dynamique de taille de police (Standard, Grand, Très Grand) dans l'Aide avec mémorisation persistante dans le `localStorage`.
