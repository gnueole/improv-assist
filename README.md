# 🎭 improv-assist

`improv-assist` is a modern, mobile-first Progressive Web Application (PWA) designed to aid improv theater actors and referees during training, workshops, and matches. It provides utilities to randomize scene parameters, time improvisations, and consult game rules/constraints.

The application is styled with a sleek dark aesthetic utilizing vibrant iridescent highlights and glassmorphism, tailored for mobile screens and immediate interaction.

---

## 🌟 Key Features

- **🎭 Générateur d'Émotions** : Instantly generates emotions or psychological states to inspire characters.
- **👆 Qui Commence ? (Multi-touch)** : A visual multitouch picker. Multiple users touch the screen simultaneously, and a random actor is selected to start the scene.
- **📍 Suggestion de Lieu** : Randomizes locations to set the scene's context.
- **🕰️ Suggestion d'Époque** : Provides time periods (past, future, or specific eras) for the staging.
- **⏳ Timer de Scène** : A simple, intuitive timer configured for typical improv limits (e.g., 2m 30s) to keep track of performance length.
- **📚 Contraintes & Docs** : Displays guidelines and game constraints cached directly from a shared Notion workspace.
- **📶 Offline-ready PWA** : Employs service workers (`sw.js`) to cache assets and constraints so that the app remains fully functional in theaters or basement venues without internet access.

---

## ⚙️ Notion Synchronization

The application features a cache synchronization script (`notion_fetch.js`) that retrieves constraints and documents directly from Notion databases or pages, saving them to `src/data/notionConstraints.json` for offline usage.

### Setup Notion Credentials
Create a `.env` file in the root directory (based on `.env.example`) and configure your integration:

```env
NOTION_API_KEY="your-notion-integration-token"
NOTION_DATABASE_ID="your-notion-database-or-page-id"
```

> [!IMPORTANT]
> Ensure the target Notion database or page is shared with your integration (e.g. `n8n lab` or your bot name) by clicking on the `...` menu in Notion -> **Connections** -> **Add connections**.

### Syncing Data
To pull the latest constraints from Notion and compile the local cache:
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

The project is fully containerized and supports both local development under Hot Module Reloading (HMR) and deployment behind reverse proxies like Traefik.

A `Makefile` is included to simplify Docker orchestration.

| Command | Action |
| :--- | :--- |
| `make dev-up` | Start the local development container with HMR enabled (Port 3000) |
| `make dev-down` | Stop the local development container |
| `make up` | Start the optimized production container (VPS / Traefik-ready) |
| `make down` | Stop the production container |
| `make build-prod` | Force a complete, uncached rebuild of the production Docker image |

---

## 🛠️ Stack & Technologies

- **Core**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **PWA**: Service Worker caching
- **Deployment**: Multi-stage Docker build producing a slim standalone Node.js server
