# 🎭 Houba Houba!

<p align="center">
  <img src="images/improv-assist-beta2.jpg" alt="Houba Houba! — improvisation engine" />
</p>

`Houba Houba!` is a modern, mobile-first Progressive Web Application (PWA) built to help improv theatre performers and referees during rehearsals, workshops and matches. It provides tools to draw scene parameters at random, time improvisations, and look up the rules and constraints of the game.

The application wears a carefully made dark design, enriched with vivid iridescent reflections and glassmorphism, fitted to mobile screens for instant use.

---

[![Build and Push Docker Image to GHCR](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml/badge.svg)](https://github.com/gnueole/improv-assist/actions/workflows/build-image.yml)

## 📌 Table of Contents

- [🌟 Key Features](#-key-features)
- [📋 Wishlist / Todo](#-wishlist--todo)
- [📂 Appendices (Documentation)](#-appendices-documentation)
- [🛠️ Stack & Technologies](#️-stack--technologies)
- [🚀 Quick Start](#-quick-start)
- [🐳 Docker & Makefile](#-docker--makefile)
- [🔑 Secret Management with Doppler](#-secret-management-with-doppler)
- [⚙️ Notion Synchronisation](#️-notion-synchronisation)
- [🧠 AI Model Choices](#-ai-model-choices)
- [📝 Changelog](#-changelog)

---

## 🌟 Key Features
| Tool / Generator | Description |
| :--- | :--- |
| **🎭 Emotion generator** | Suggests a random acting emotion together with an intensity slider from **1 to 10**. |
| **👆 Who starts? (multi-touch)** | Interactive draw to decide who opens the scene. Put up to 5 fingers on the screen; after a 3-second countdown, the winner is picked at random. |
| **✨ Improv themes** | Suggests subjects to play and poetic or comedic story ideas. |
| **⏳ Stage timer** | Stopwatch preset to 2 minutes 30 seconds, with a neon glow, an end buzzer (rising chime arpeggio) and an urgency vibration effect. A male or female voice can be selected. |
| **🎬 Scenarios** | Provides opening situations and scripted plots, with explanations and briefs to launch the scene. |
| **📍 Location suggestion** | Instant creative suggestions of physical settings to place your scenes in. |
| **🕰️ Era suggestion** | Instant suggestions of time periods (Middle Ages, the future, the 80s) to situate your stories. |
| **👤 Characters** | Dramatic archetype suggestions with a suggested age, a prop to mime, and a body behaviour or tic. |
| **🐰 Animals** | Suggests an animal (wild, domestic, polar, and so on) with an unusual twist or an amusing adjective. |
| **📦 Objects** | Suggests an unusual or everyday object (a tool, a garment, a piece of technology) to embody or to use. |
| **🔍 Search & submenus** | The dashboard is arranged into thematic submenus (*Incarner*, *Inspiration*, *S'échauffer* — the UI is French) with a global Spotlight search bar (shortcut `/`). |
| **📚 Improv constraints** | Displays the theatrical constraints and rules held in the troupe's Notion workspace. |
| **🤸 Warm-ups** | A list of group and solo exercises with descriptions and tips to get ready to play. |
| **⚡ Hi Ha rules** | Quick reference guide listing the official gestures of the Hi Ha group warm-up game. |
| **💬 Feedback & ideas** | Feedback and suggestion form, connected to Notion through n8n. |
| **📦 Prompt reservoir (data pool)** | Suggestions are drawn from a local reservoir and consumed without repeats. When it runs dry, the category is refilled from the pool shipped with the application, and n8n is only called if that pool holds nothing outside the last ten draws. |
| **🔄 AI regeneration (Gemini through n8n)** | Reloads the local cache with prompts generated on the spot, by clicking the rotation icon. |
| **🚦 Connection indicator (n8n)** | A light reports whether the n8n service is available (green/red), with detailed error feedback for developers. |

---

## 📋 Wishlist / Todo

Features considered for later (or not, or not at all):
- [x] **Tile ideas to add** :
  - Personas with tips and variants
  - Animals
  - Objects
  - A big mixer to build your own wildest combinations!
- [x] **Better notifications** : Feedback toast after 20 minutes of use
- [x] **Audio resilience (autoplay policy)** : Call `AudioContext.resume()` explicitly on a direct user interaction (e.g. clicking the start button) so browsers stop blocking the synthetic audio.
- [ ] **Fully autonomous offline mode (Service Worker / Next-PWA)** : Implement a Service Worker based on Next-PWA/Workbox to cache the static pages and the script files (.js, .css), so the application can open and reload with no network at all.
- [ ] **New freemium/premium tiles** : To fund the application (or even make it sustainable), add new paid custom tiles, or a monthly/yearly subscription.
- [ ] **MOBILE application** : Build a mobile application for Android and iOS. That would allow push notifications, widgets, and so on.
- [x] **Game history & draw history** : Keep a local trace (in `localStorage`, under `improv_history`) of the last 10 suggestions drawn, to avoid outright repeats in the short term.
- [x] **Advanced timer with buzzer** : Add configurable end buzzer sounds, and the ability to set an arbitrary duration.
- [ ] **Multilingual (FR / EN)** : Full translation of the application, for use in international festivals or workshops.

---

## 📂 Appendices (Documentation)

To go further into the technical and architectural side of the project, see these companion documents:

1. 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** : Detailed architecture sheet describing the structure of the Next.js project (App Router), the global buffer management through Context, the API proxy configuration, the n8n automation and the production infrastructure topology.
2. 🎬 **[TILEAPI.md](TILEAPI.md)** : Tile API reference guide. It details the coding standards, the type tree and the step-by-step path to implementing a new generator or game micro-app cleanly.

---

## 🛠️ Stack & Technologies

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS 3 (responsive 2-column grid with square glassmorphism tiles), PostCSS
- **Icons** : Lucide React (normalised in size and stroke width for perfect visual consistency)
- **Deployment** : Multi-stage standalone Docker through GHCR

---

## 🚀 Quick Start

### Prerequisites
- Docker (tested with WSL2)
- Node.js (version 20+)
- npm
- A database (Notion or another) to hold the application's prompts (optional).
- An n8n account to wire the prompts, the AI and the email sending (optional).
- A Groq/Gemini key to regenerate replacement prompts (optional).

### Installation & Local Development

1. **Configure the environment and check the dependencies** :
   Run the interactive initialisation script at the project root:
   ```bash
   ./configure
   ```
   *(The script checks every system dependency, installs the required Python dependencies, initialises the `.env` file, and offers to configure your Notion and n8n integration keys interactively.)*

2. **Install the npm dependencies** :
   *(If the initialisation script did not already do it.)*
   ```bash
   npm install
   ```

3. **Start the development server** :
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build and start the production bundle locally** :
   ```bash
   npm run build
   ```
   ```bash
   npm start
   ```

---

## 🐳 Docker & Makefile

The application is fully containerised and driven through a `Makefile`, from WSL or any Linux environment.

| Command | Action |
| :--- | :--- |
| `make up` | Fetches the dev secrets from Doppler and starts the local container with HMR (port 3000 — [http://localhost:3000](http://localhost:3000)) |
| `make down` | Stops the local development container |
| `make restart` | Restarts the local development environment (down, then up) |
| `make deploy` | Fetches the production secrets from Doppler, streams them securely to the VPS over SSH, then deploys the application |
| `make deploy-delay` | Pushes the commits, waits 150 seconds for GitHub Actions to build, then deploys with the Doppler secrets |
| `make checklogs` | Streams the VPS production logs in real time |
| `make check-build` | Asks GitHub Actions for the status of the latest image build |
| `make refresh-pool` | Regenerates `public/data/reservoir-config.json` (runs automatically every Saturday at 06:00 UTC in CI) |

### Fixing a 504 (Traefik gateway)
If the VPS answers *504 Gateway Timeout* on a static page, reconnect Traefik's network to the application container:
```bash
ssh eole.me "docker network connect jobby-md2html_default <traefik_container_name>"
```
A 504 on `POST /api/improv-regen` is a different matter: that route answers one itself when n8n has not replied within 120 seconds.

---

## 🔑 Secret Management with Doppler

The application uses **Doppler** to manage every environment variable (API secrets, tracking identifiers, and so on) centrally and securely. Secrets are no longer stored in clear text in the project files.

### Initial setup (for developers)
1. **Install the Doppler CLI** on your system or inside your WSL environment.
2. **Authenticate** on your machine:
   ```bash
   doppler login
   ```
3. **Attach the project** to your workspace:
   ```bash
   doppler setup
   ```
   *(Pick the `eole-me` project and the `dev_eole-me-impro` dev config for local development.)*

---

## ⚙️ Notion Synchronisation

The local cache is built by synchronising part of Notion into `src/data/notionConstraints.json`, for the best possible offline behaviour:
```bash
node scripts/notion_fetch.js
```

---

## 🧠 AI Model Choices

Generating the prompt reservoir demands a delicate balance between dramatic creativity, strict JSON structure and speed:

* **Gemini 3.5 Flash (`models/gemini-3.5-flash`) — what actually runs** : The `Message a model` node of the `Improv-Assist BaaS` workflow is pinned to this model, for both the on-demand regenerations and the weekly pool refresh. It takes 11 to 19 seconds for a single category, and up to ~90 seconds for a full 400-item reservoir.
* **The `model` field sent by the client is vestigial** : `/api/improv-regen` still forwards a `model` value (defaulting to `llama-3.3-70b-versatile`, from the days when Groq served the real-time calls), but the Gemini node carries its own configuration and ignores it.
* **Gemini 3.1 Pro (`gemini-3.1-pro-preview`) — optional, for static generation** : Usable for offline mass population (the initial 350 prompts). Its dramatic reasoning is excellent.

---

## 📝 Changelog

The full history lives in [CHANGELOG.md](CHANGELOG.md). What follows is the beta history, kept as it was written.

### Version 0.10 BETA (0.10-beta) - 2026-06-15
- **Dynamic LLM model selection & logging** :
  - Support for a dynamic model selection passed from the client to the `/api/improv-regen` proxy and relayed to the n8n webhook.
  - The Notion tracking database schema gains a `Model` property (`rich_text`). The n8n workflow now records exactly which AI model was asked.
- **Robustness & n8n error fix** :
  - Fixed a `ReferenceError: mockDb is not defined` in the JS fallback script, by moving it into the n8n node's global scope.
  - Added a regex cleanup routine to strip the markdown code fences (such as ` ```json `) Groq occasionally returned, which broke JSON parsing.
- **Release 0.10-beta** : Version bump and automated VPS deployment.

### Version 0.9 BETA (0.9-beta) - 2026-06-15
- **Stage timer & voice (TTS)** :
  - **Voice gender choice** : Added a voice option (female / male). The speech synthesis pitch is adjusted dynamically to make the male rendering distinct.
  - **Quick adjustment buttons** : Four quick time adjustment buttons (-30s, -10s, +10s, +30s) under the stopwatch.
  - **Customisable default duration** : The timer's default duration is now a setting, persisted in `localStorage`.
  - **Customisable spoken announcements** : The list of announcement milestones can be edited by the user.
  - **Stronger end gong** : The gong was replaced by a more powerful end signal.
  - **Saving** : A checkbox to save the timer configuration.
- **Reservoir regeneration & n8n** :
  - **Refresh button fix** : The refresh button now always calls the AI, forcing a regeneration.
  - **n8n flow resilience** : Added static fallbacks for the animal and object categories.
  - **API cache disabled** : Added the `cache: "no-store"` header on the regeneration calls.
- **Responsive layout** :
  - **Scroll adjustment** : Vertical scrolling forced on the central area.

### Version 0.8 BETA (0.8-beta) - 2026-06-12
- **Generation duration measurement** : The total run time is recorded in the Notion database.
- **Trigger source tracking** : Added the `Source` property (prod / dev / other) in Notion.
- **n8n and Notion in parallel** : The Notion write moved to the end of the flow, alongside the webhook response.
- **Search layout optimisation** : Hero margins adjusted so the mobile keyboard no longer hides it.
- **Typographic normalisation** : Removed the stray space before the exclamation mark in "Houba Houba!".

### Version 0.7 BETA (0.7-beta) - 2026-06-12
- **Dynamic help documentation** : The feature list is generated automatically from `helpDescription`.
- **Bigger winner disc ("Who starts?")** : The touch indicator for the drawn player is 2.5× larger.
- **Bigger header buttons** : Touch target size optimised on mobile.
- **Tool creation guide** : Added the `TILEAPI.md` documentation.

### Version 0.6 BETA (0.6-beta) - 2026-06-12
- **Dashboard restructured (submenus)** : Thematic grouping (*Incarner*, *Inspiration*, *S'échauffer*).
- **Spotlight search bar** : A responsive filter bar (shortcut `/`).
- **New inspiration generators** : Animals and Objects.
- **Anti-repeat history** : The last 10 draws are saved locally.
- **Autoplay workaround (stage timer)** : Initialisation on the user's first click.
- **Better feedback & telemetry** : GA4/GTM integration and Notion logging through n8n.

### Version 0.5 BETA (0.5-beta) - 2026-06-11
- **Migration to Gemini 3.1 Pro** : An initial batch of 350 prompts across 7 categories.
- **Local Doppler resilience** : `.env.example` is copied automatically when the Doppler CLI is missing.
- **Adjusted network timeout** : Raised to 180s for the initial mass generation.

### Version 0.4 BETA (0.4-beta) - 2026-06-11
- **Notion feedback restored** : Fixed the text formatting and the bullet lists.
- **PC keyboard shortcuts & grid navigation** : Full control through the arrow keys, `Enter`, `Space`, `Esc`, and so on.
- **Optimised reservoir refills** : Fetching in blocks of 50 prompts, to preserve the offline mode.
- **Improved theatrical timer** : Web Audio arpeggio chime, red panic glow and a `scale-panic` effect.
- **UI & UX polish** : Inline counters, simplified "DEV" badge.

### Version 0.3 BETA (0.3-beta) - 2026-06-10
- **Global React Context (`ImprovBufferContext`)** : Centralisation, anti-repeat synchronisation and concurrent request handling.
- **50-entry backup reservoir** : Robustness when the AI is overloaded.
- **Explanatory descriptions** : French help text on the exercises and categories.
- **Feedback submission & GDPR** : Ratings from 1 to 5 stars, terms and GDPR consent modals.

### Version BETA 2 (0.2-beta) - 2026-06-09
- **JSON architecture** : `tiles.json` and `reservoir-config.json` extracted out of the code.
- **Notion robustness** : Handling of Notion API 500s.
- **Docker & Makefile** : Dev/prod and CI/CD deployment commands harmonised.

### Version Beta 1 (0.1-beta)
- Bug fixes.
- **Privacy & GDPR** : Privacy policy modals.
- **Dynamic URL paths & routing** : Direct URL refresh supported through Next.js rewrites.
- **Text size** : Standard/Large/Very Large setting, persisted in `localStorage`.
