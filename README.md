# 🎭 Houba Houba!

<p align="center">
  <img src="images/improv-assist-beta2.jpg" alt="Houba Houba! — Moteur d'improvisation" />
</p>

`Houba Houba!` est une Progressive Web Application (PWA) moderne et mobile-first conçue pour aider les comédiens et arbitres de théâtre d'improvisation lors des entraînements, ateliers et matchs. Elle fournit des outils pour tirer au sort des paramètres de scène, chronométrer les improvisations et consulter les règles et contraintes de jeu.

L'application arbore un design sombre soigné, enrichi de reflets irisés vibrants et de glassmorphisme, adapté aux écrans mobiles pour une utilisation instantanée.

---

[![Build and Push Docker Image to GHCR](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml/badge.svg)](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml)

## 📌 Sommaire (TOC)

- [🌟 Fonctionnalités Clés](#-fonctionnalités-clés)
- [📋 Wishlist / Todo](#-wishlist--todo)
- [📂 Annexes (Documentation)](#-annexes-documentation)
- [🛠️ Stack & Technologies](#️-stack--technologies)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🐳 Docker & Makefile](#-docker--makefile)
- [🔑 Gestion des Secrets avec Doppler](#-gestion-des-secrets-avec-doppler)
- [⚙️ Synchronisation Notion](#️-synchronisation-notion)
- [🧠 Choix des Modèles d'IA](#-choix-des-modèles-dia)
- [📝 Changelog (Historique)](#-changelog-historique)

---

## 🌟 Fonctionnalités Clés
| Outil / Générateur | Description |
| :--- | :--- |
| **🎭 Générateur d'Émotions** | Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de **1 à 10**. |
| **👆 Qui Commence ? (Multi-touch)** | Tirage au sort interactif pour désigner qui débute la scène. Posez jusqu'à 5 doigts sur l'écran. Après un décompte de 3 secondes, le vainqueur est choisi aléatoirement. |
| **✨ Thèmes d'Impro** | Suggère des sujets de jeu et des idées d'histoires poétiques ou comiques. |
| **⏳ Timer de Scène** | Chronomètre préréglé sur 2 minutes 30 secondes avec neon glow, buzzer de fin (chime arpeggio ascendant) et effet vibratoire d'urgence. Sélection possible de voix masculine ou féminine. |
| **🎬 Scénarios** | Fournit des situations de départ et intrigues scénarisées avec des explications et briefs pour lancer la scène. |
| **📍 Suggestion de Lieu** | Suggestions créatives instantanées de cadres physiques pour planter le décor de vos scènes. |
| **🕰️ Suggestion d'Époque** | Suggestions instantanées de temporalités (Moyen Âge, futur, années 80) pour situer vos histoires. |
| **👤 Personnages** | Suggestions d'archétypes dramatiques avec âge suggéré, accessoire à mimer et comportement corporel/tic. |
| **🐰 Animaux** | Suggère un animal (sauvage, domestique, polaire, etc.) avec une touche insolite ou un adjectif amusant. |
| **📦 Objets** | Suggère un objet insolite ou du quotidien (outil, vêtement, technologie, etc.) à incarner ou utiliser. |
| **🔍 Recherche & Submenus** | Restructuration du dashboard en sous-menus thématiques (*Incarner*, *Inspiration*, *S'échauffer*) avec barre de recherche Spotlight globale (raccourci `/`). |
| **📚 Contraintes d'Impro** | Affiche les contraintes et règles théâtrales issues de l'espace de travail Notion de la troupe. |
| **🤸 Échauffements** | Liste d'exercices collectifs ou individuels avec des descriptions et conseils pour se préparer au jeu. |
| **⚡ Règles du Hi Ha** | Guide de référence rapide listant les gestes officiels du jeu d'échauffement collectif Hi Ha. |
| **💬 Retour & Idées** | Formulaire de retours d'expérience et de suggestions d'améliorations connecté à Notion via n8n. |
| **📦 Réservoir de Prompts (Data Pool)** | Les suggestions sont piochées dans un réservoir local et consommées sans doublon. Si le réservoir se vide, 50 nouveaux items sont rechargés depuis n8n. |
| **🔄 Régénération par l'IA (Groq via n8n)** | Permet de recharger le cache local avec de nouveaux prompts générés à la volée par Groq (Llama-3.3) en cliquant sur l'icône de rotation. |
| **🚦 Indicateur de connexion (n8n)** | Un voyant lumineux indique la disponibilité du service n8n (vert/rouge) avec retour d'erreurs détaillé pour les développeurs. |

---

## 📋 Wishlist / Todo

Voici les fonctionnalités futures envisagées (ou pas, ou pas) pour enrichir l'application :
- [x] **Idées de tuiles à rajouter** : 
  - Personnas avec tips et variantes
  - Animaux 
  - Objets
  - Un grand mixer pour créer ses propres combinaisons les plus folles !
- [x] **Améliorations des notifications** : Toaster de feedback après 20 min d'utilisation
- [x] **Résilience Audio (Autoplay Policy)** : Déclencher explicitement `AudioContext.resume()` lors d'une interaction utilisateur directe (ex: au clic sur le bouton de démarrage) afin d'éviter le blocage automatique de l'audio synthétique par les navigateurs.
- [ ] **Mode Hors-ligne 100% autonome (Service Worker / Next-PWA)** : Implémenter un Service Worker basé sur Next-PWA/Workbox pour mettre en cache les pages statiques et les fichiers de script (.js, .css) afin de permettre à l'application de s'ouvrir et de se recharger sans aucune connexion réseau.
- [ ] **Ajout de nouvelles tuiles freemium/premium** : Pour financer l'application (voire la rendre pérenne), il faudrait ajouter de nouvelles tuiles personalisées payantes ou via un abonnement mensuel/annuel.
- [ ] **Application MOBILE** : Développer une application mobile pour Android et iOS. Cela permettrait d'avoir des notifications push, des widgets, etc.
- [x] **Historique de jeu & Historique des tirages** : Garder une trace locale (dans le `localStorage` sous `improv_history`) des 10 dernières suggestions tirées pour éviter les doublons absolus à court terme.
- [x] **Timer avancé avec buzzer** : Ajouter des sons de buzzer de fin configurables, ainsi que la possibilité de régler le temps libre.
- [ ] **Multilingue (FR / EN)** : Traduction complète de l'application pour l'usage dans des festivals ou ateliers internationaux.

---

## 📂 Annexes (Documentation)

Pour approfondir les aspects techniques et architecturaux du projet, veuillez consulter les documentations annexes suivantes :

1. 🏗️ **[Architecture.md](Architecture.md)** : Fiche d'architecture détaillée décrivant la structure du projet Next.js (App Router), la gestion globale des buffers via Context, la configuration des proxies d'API, l'automatisation n8n et la topologie de l'infrastructure de production.
2. 🎬 **[TileAPI.md](TileAPI.md)** : Guide de référence de l'API de Tuiles. Ce document détaille les normes de codage, l'arborescence des types et les étapes à suivre pas-à-pas pour implémenter proprement un nouveau générateur ou une micro-app de jeu.

---

## 🛠️ Stack & Technologies

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS 3 (Grid responsive 2 colonnes avec tuiles carrées en Glassmorphism), PostCSS
- **Icones** : Lucide React (normalisées en taille et épaisseur pour une parfaite cohérence visuelle)
- **Déploiement** : Docker Standalone multi-stage via GHCR

---

## 🚀 Démarrage Rapide

### Prérequis
- Docker (testé avec WSL2)
- Node.js (version 20+)
- npm
- Une base de données (Notion ou autre) pour interfacer avec les prompts de l'application (optionnel).
- Un compte n8n pour interfacer avec les prompts de l'application, l'IA et les envois d'emails (optionnel).
- Une clé Groq/Gemini pour régénérer des prompts de remplacement (optionnel).

### Installation & Développement Local

1. **Configurer l'environnement et vérifier les dépendances** :
   Lancez le script d'initialisation interactif à la racine du projet :
   ```bash
   ./configure
   ```
   *(Ce script vérifie toutes vos dépendances système, installe les dépendances Python requises, initialise le fichier `.env` et vous propose de configurer interactivement vos clés d'intégration Notion et n8n).*

2. **Installer les dépendances npm** :
   *(Si non fait automatiquement par le script d'initialisation)*
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

4. **Compiler et démarrer le bundle de production localement** :
   ```bash
   npm run build
   ```
   ```bash
   npm start
   ```

---

## 🐳 Docker & Makefile

L'application est entièrement conteneurisée et gérée de manière simplifiée à l'aide d'un `Makefile` via WSL ou environnement Linux.

| Commande | Action |
| :--- | :--- |
| `make up` | Récupère dynamiquement les secrets de dev depuis Doppler et démarre le conteneur local avec HMR (Port 3000 - [http://localhost:3000](http://localhost:3000)) |
| `make down` | Arrête le conteneur de développement local |
| `make restart` | Redémarre l'environnement de développement local (down puis up) |
| `make deploy` | Récupère les secrets de production depuis Doppler, les transfère de manière sécurisée au VPS par SSH, puis déploie l'application |
| `make deploy-delay` | Envoie les commits, attend 150 secondes pour laisser le temps à GitHub Actions de compiler, puis déploie avec les secrets Doppler |
| `make checklogs` | Affiche les journaux de production du VPS en temps réel |

### Résolution d'erreur 504 (Passerelle Traefik)
Si le VPS renvoie une erreur *504 Gateway Timeout*, reconnectez le réseau de Traefik au conteneur de l'application :
```bash
ssh eole.me "docker network connect jobby-md2html_default <nom_du_conteneur_traefik>"
```

---

## 🔑 Gestion des Secrets avec Doppler

L'application utilise **Doppler** pour gérer de manière sécurisée et centralisée toutes les variables d'environnement (secrets API, identifiants de suivi, etc.). Les secrets ne sont plus stockés en clair dans les fichiers du projet.

### Configuration Initiale (pour les développeurs)
1. **Installer la CLI Doppler** sur votre système ou dans votre environnement WSL.
2. **S'authentifier** sur votre machine :
   ```bash
   doppler login
   ```
3. **Associer le projet** à votre espace de travail :
   ```bash
   doppler setup
   ```
   *(Sélectionnez le projet `eole-me` et la configuration de dev `dev_eole-me-impro` pour le développement local).*

---

## ⚙️ Synchronisation Notion

Le cache local est généré en synchronisant certaines données depuis Notion vers `src/data/notionConstraints.json` pour un fonctionnement hors-ligne optimal :
```bash
node scripts/notion_fetch.js
```

---

## 🧠 Choix des Modèles d'IA

La génération du réservoir de prompts requiert un équilibre délicat entre créativité dramatique, structure JSON rigoureuse et rapidité :

* **Groq Chat Model (`llama-3.3-70b-versatile`) — Modèle par Défaut en Temps Réel** : Migré pour les appels dynamiques de régénération depuis la PWA (au clic sur le bouton de rafraîchissement). Sa vitesse de traitement (inférieure à 2 secondes) et sa robustesse de sortie JSON résolvent les goulots d'étranglement de quotas réseau.
* **Gemini 3.1 Pro (`gemini-3.1-pro-preview`) — Optionnel pour la Génération Statique** : Utilisable pour le peuplement de masse hors-ligne (350 prompts initiaux). Il dispose d'une excellente capacité de raisonnement dramatique.

---

## 📝 Changelog

### Version 0.10 BETA (0.10-beta) - 2026-06-15
- **Sélection Dynamique & Logging du Modèle LLM** :
  - Support de la sélection de modèle dynamique transmise de l'application client à l'API proxy `/api/improv-regen` et relayée au webhook n8n.
  - Mise à jour du schéma de base de données de suivi Notion pour ajouter la propriété `Model` (`rich_text`). Le workflow n8n y inscrit désormais précisément le modèle d'IA sollicité.
- **Robustesse & Correction d'Erreur n8n** :
  - Résolution d'une `ReferenceError: mockDb is not defined` dans le script JS de repli en le déplaçant dans la portée globale du nœud n8n.
  - Ajout d'une routine de nettoyage regex pour supprimer les backticks de délimiteur de code markdown (comme ` ```json `) renvoyés occasionnellement par Groq, évitant ainsi les échecs de parsing JSON.
- **Release 0.10-beta** : Incrément de version et déploiement VPS automatisé.

### Version 0.9 BETA (0.9-beta) - 2026-06-15
- **Timer de Scène & Voix (TTS)** :
  - **Choix du Genre de la Voix** : Ajout d'une option de choix de la voix (Féminine / Masculine). Le pitch de la synthèse vocale est dynamiquement ajusté pour assurer un rendu masculin distinct.
  - **Boutons d'Ajustement Rapide** : Intégration de 4 boutons d'ajustement rapide du temps (-30s, -10s, +10s, +30s) sous le chronomètre.
  - **Durée par Défaut Personnalisable** : Ajout d'un réglage de la durée par défaut du timer, persistant en `localStorage`.
  - **Annonces Vocales Personnalisables** : Liste de jalons de temps d'annonces modifiable par l'utilisateur.
  - **Gong de Fin Renforcé** : Remplacement du gong par un signal de fin plus puissant.
  - **Gestion de la Sauvegarde** : Case à cocher pour sauvegarder la configuration du timer.
- **Régénération du Réservoir & n8n** :
  - **Correction du Bouton Rafraîchir** : Le bouton de rafraîchissement appelle systématiquement l'IA en forçant la régénération.
  - **Résilience du Flux n8n** : Ajout de secours statiques pour les catégories d'animaux et d'objets.
  - **Désactivation du Cache API** : Ajout de l'en-tête `cache: "no-store"` sur les appels de régénération.
- **Mise en Page Réactive** :
  - **Ajustement du Défilement (Scroll)** : Forçage du défilement vertical sur la zone centrale.

### Version 0.8 BETA (0.8-beta) - 2026-06-12
- **Mesure de Durée de Génération** : Enregistrement de la durée totale d'exécution dans la base Notion.
- **Suivi de la Source de Déclenchement** : Ajout de la propriété `Source` (prod / dev / other) dans Notion.
- **Parallélisation n8n et Notion** : Déplacement de l'écriture Notion à la fin du flux en parallèle de la réponse webhook.
- **Optimisation de la Mise en Page de Recherche** : Ajustement des marges du Hero pour éviter l'occultation par le clavier mobile.
- **Normalisation Typographique** : Suppression de l'espace superflu avant le point d'exclamation pour "Houba Houba!".

### Version 0.7 BETA (0.7-beta) - 2026-06-12
- **Documentation dynamique de l'aide** : Génération automatisée de la liste des fonctionnalités basée sur `helpDescription`.
- **Disque de vainqueur plus grand ("Qui Commence ?")** : Agrandissement de l'indicateur tactile du joueur tiré au sort (x2.5).
- **Boutons d'en-tête agrandis** : Optimisation de la taille tactile sur mobile.
- **Guide de création d'outil** : Ajout de la documentation `TileAPI.md`.

### Version 0.6 BETA (0.6-beta) - 2026-06-12
- **Restructuration du Tableau de Bord (Submenus)** : Regroupement thématique (*Incarner*, *Inspiration*, *S'échauffer*).
- **Barre de Recherche Spotlight** : Intégration d'une barre de filtrage réactive (raccourci `/`).
- **Nouveaux Générateurs d'Inspiration** : Animaux et Objets.
- **Historique Anti-Doublons** : Sauvegarde locale des 10 derniers tirages.
- **Contournement Autoplay (Scene Timer)** : Initialisation lors du clic initial utilisateur.
- **Amélioration des retours & Télémétrie** : Intégration de GA4/GTM et journalisation Notion via n8n.

### Version 0.5 BETA (0.5-beta) - 2026-06-11
- **Migration vers Gemini 3.1 Pro** : Lot de 350 prompts initiaux sur 7 catégories.
- **Résilience Doppler locale** : Copie de sauvegarde automatique de `.env.example` en cas d'absence du CLI Doppler.
- **Timeout réseau adapté** : Passage à 180s pour la génération initiale de masse.

### Version 0.4 BETA (0.4-beta) - 2026-06-11
- **Restauration des retours Notion (Notion Feedback)** : Correction du formattage de texte et des listes à puces.
- **Raccourcis clavier PC & Navigation de grille** : Contrôles complets via touches fléchées, `Entrée`, `Espace`, `Échap`, etc.
- **Recharges optimisées du réservoir** : Récupération par blocs de 50 prompts pour préserver le mode hors-ligne.
- **Amélioration du Timer Théâtral** : Carillon arpège Web Audio, lueur de panique rouge et effet d'échelle `scale-panic`.
- **Polissage UI & UX** : Compteurs intégrés, simplification du badge "DEV".

### Version 0.3 BETA (0.3-beta) - 2026-06-10
- **React Context global (`ImprovBufferContext`)** : Centralisation et synchronisation anti-doublon et requêtes concurrentes.
- **Réservoir de secours de 50 entrées** : Robustesse face aux surcharges d'IA.
- **Descriptions explicatives** : Aide en français sur les exercices et catégories.
- **Envoi de feedback & RGPD** : Notes de 1 à 5 étoiles, modals CGU et consentement RGPD.

### Version BETA 2 (0.2-beta) - 2026-06-09
- **Architecture JSON** : Externalisation de `tiles.json` et `reservoir-config.json`.
- **Robustesse Notion** : Gestion des erreurs 500 sur l'API Notion.
- **Docker & Makefile** : Harmonisation des commandes dev/prod et de déploiement CI/CD.

### Version Beta 1 (0.1-beta)
- Corrections de bugs.
- **Privacy & RGPD** : Modals de politique de confidentialité.
- **Chemins d'URL dynamiques & Routage** : Support du rafraîchissement direct d'URL via rewrites Next.js.
- **Taille de texte** : Ajustement Standard/Grand/Très Grand persistant en `localStorage`.
