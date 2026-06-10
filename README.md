# 🎭 Houba Houba !

`Houba Houba !` is a modern, mobile-first Progressive Web Application (PWA) designed to aid improv theater actors and referees during training, workshops, and matches. It provides utilities to randomize scene parameters, time improvisations, and consult game rules/constraints.

The application is styled with a sleek dark aesthetic utilizing vibrant iridescent highlights and glassmorphism, tailored for mobile screens and immediate interaction.

---

[![Build and Push Docker Image to GHCR](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml/badge.svg)](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml)

## 🌟 Key Features

- **🎭 Générateur d'Émotions** : Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de **1 à 10**.
- **👆 Qui Commence ? (Multi-touch)** : Tirage au sort interactif pour désigner qui débute la scène. Posez jusqu'à 5 doigts sur l'écran. Après un décompte de 3 secondes, le vainqueur est choisi aléatoirement.
- **📍 Suggestion de Lieu & Époque** : Suggestions instantanées de cadres physiques et de temporalités pour situer vos histoires.
- **⏳ Timer de Scène** : Un chronomètre préréglé sur 2 minutes 30 secondes (durée standard d'improvisation) affichant un message de fin dynamique.
- **⚡ Règles du Hi Ha (EFIT)** : Guide de référence rapide listant les 10 gestes et réflexes officiels du jeu d'échauffement collectif.
- **📚 Contraintes & Docs** : Affiche les contraintes et guides d'improvisation récupérés directement depuis un espace de travail Notion partagé.
- **📦 Réservoir de Prompts (Data Pool)** : Pour éviter de tirer plusieurs fois les mêmes suggestions, les prompts sont piochés dans un réservoir local et consommés dynamiquement. Si le réservoir se vide, des données de repli sont utilisées.
- **🔄 Régénération par l'IA (Gemini via n8n)** : Permet de recharger le réservoir local avec de nouvelles idées générées par l'IA en cliquant sur les flèches de rotation en haut à droite.
- **🚦 Indicateur de connexion Gemini (n8n)** : Un voyant lumineux indique l'état de l'API. Si vous effectuez trop de recharges, vous consommerez tous les jetons (tokens) gratuits de l'API Gemini, ce qui provoquera une erreur (voyant **rouge**).
- **🔗 Chemins d'URL dynamiques (Google Analytics)** : Chaque tuile est associée à un sous-chemin d'URL dédié (ex: `/emotions`, `/timer`) permettant de suivre précisément les consultations dans Google Analytics. Des règles de réécriture (*rewrites*) Next.js empêchent les erreurs 404 lors du rafraîchissement d'une page.
- **🔍 Ajusteur de taille de texte** : Des boutons d'ajustement dynamique de taille de police (Standard, Grand, Très Grand) sont disponibles dans l'Aide avec mémorisation persistante dans le navigateur (`localStorage`).

---

## ⚙️ Notion Synchronization

Le cache local est généré en synchronisant les données depuis Notion vers `src/data/notionConstraints.json` pour un fonctionnement hors-ligne optimal :
```bash
node notion_fetch.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 20+)
- npm

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

## 🐳 Docker & Makefile

L'application est conteneurisée et gérée à l'aide d'un `Makefile` local et dans WSL.

| Commande | Action |
| :--- | :--- |
| `make dev-up` | Démarre le conteneur de développement local avec HMR (Port 3000) |
| `make dev-down` | Arrête le conteneur de développement local |
| `make up` | Démarre la configuration de production localement |
| `make down` | Arrête la configuration de production localement |
| `make deploy` | Déploie automatiquement l'application sur le serveur VPS (mise en production) |
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

*EFIT® est une marque déposée. Tous droits réservés.*
