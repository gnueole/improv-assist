# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.15.0] - 2026-09-26

### Fixed

- **The weekly refresh regenerated a quarter of the pool.** Two runs of
  `refresh-pool.mjs` left 317 of 420 items exactly as they were before the job
  existed: `scenarios`, `categories`, `echauffements` and `characters` came back
  item-for-item identical both times, and `emotions`, `locations` and `animals`
  merely alternated between two stable lists. With `temperature: 0.2` and a prompt
  that never varies, the model returns its mode.

  `/api/improv-regen` now accepts an `avoid` array (up to 500 strings), which
  `parsePrompt` renders as a "do not propose these, nor a close variant" block
  inserted before the footer — the footer demands raw JSON and has to stay last.
  The refresh sends the category's current items, so each run is asked for
  something it does not already have.

### Added

- The refresh log prints a novelty count per category (`✔ themes: 50 -> 50
  (48 new)`). The mechanism working was not the same as the mechanism being
  useful, and only one of the two was visible before.

---

## [0.14.0] - 2026-09-26

### Added

- **The theme pool refreshes itself every Saturday at 06:00 UTC.**
  `.github/workflows/refresh-pool.yml` runs `toolkit/refresh-pool.mjs`, which asks
  the app's own `/api/improv-regen` route for one category at a time and commits
  `public/data/reservoir-config.json`. One generation a week now serves every
  client, where each user used to pay for their own. Going through the route rather
  than the n8n webhook means no token secret in CI and no second copy of the
  `master.prompt` assembly — at the cost of pacing the loop 25s apart, since that
  route rate-limits to 3 requests per minute.

  A category that comes back empty, truncated below half its current size, or in
  error keeps the items already shipped, so a partial failure degrades to "some
  categories unchanged" instead of a wiped pool. `make refresh-pool` runs it by
  hand, and `POOL_CATEGORIES=animals,objects` restricts it.

  The new pool reaches production at the next `make deploy`, which is soon enough
  for a list of themes.

### Changed

- `build-image.yml` accepts `workflow_dispatch`. A push made with `GITHUB_TOKEN`
  triggers no workflow, so the refresh starts the build itself — otherwise the
  regenerated pool would sit on `main` and never reach an image.

---

## [0.13.0] - 2026-09-26

### Added

- **An empty category refills from the shipped pool before n8n is called.**
  `pickItem` went straight to `/api/improv-regen` — a Gemini generation, 11-19s
  and billed — whenever a category ran dry, while `public/data/reservoir-config.json`
  sat one static request away, free and revalidated by the browser on its own.
  It is now tried first, and n8n is reached only when that pool holds nothing
  outside the last ten draws. For the six categories `buildBufferFromData` backs
  with static datasets, the paid path becomes unreachable in practice.

### Changed

- `readHistory` and `rememberPick` replace the three inline copies of the draw
  history read/write inside `pickItem`.

---

## [0.12.1] - 2026-09-25

### Fixed

- **Regeneration could not succeed at all.** The `/api/improv-regen` proxy aborted
  its call to n8n after 10s, while the workflow's Gemini node alone takes 11-19s
  for a single category. Twelve consecutive attempts from six devices ended in a
  `504`, every one of them against an n8n execution that had **succeeded** — the
  reservoir was generated, logged to Notion, and thrown away on the way back. The
  budget is now 120s, matching the 1-2 minutes the UI announces.

- **The timeout was reported as a generic failure.** The route answers a 504 with
  `{ error: "Timeout issued (from Message a model)" }`, but `reloadBuffer` threw
  its own message without reading the body, so the branch meant to surface it was
  unreachable and the toast read "Échec de la régénération via n8n." Both call
  sites now share a single `readErrorMessage` helper — the one in `pickItem`,
  which already did this correctly, was the model for it.

---

## [0.12.0] - 2026-08-28

### Changed

- **Telemetry goes to Vector, not to n8n and not to Notion.** The receiving
  workflow failed on **every single event** — 66 runs, 66 failures — because its
  Notion node read `$json.body` while its input was a data-table node's output.
  Rather than fix a workflow that writes to the wrong store, the route now posts
  to `http://vector:8080` and tags the payload `application: "improv"`.

  The workflow is quarantined as `TODEL_2026-08-28_improv - telemetry - prod`.

---

## [0.11.7] - 2026-08-28

### Added

- **`vector.dev/collect=true`** on the production container. Vector now collects
  logs by that label rather than by compose project, and improv was the only
  project of the five not declaring it — so its logs reached Axiom neither
  before the change nor after.

---

## [0.11.6] - 2026-08-27

### Fixed

- **Same unreachable address as jobby.** The fallback added in 0.11.5 pointed at
  `https://n8n.eole.me/webhook/feedback`, which no container can reach: the VPS
  `/etc/hosts` maps that name to `127.0.1.1`. Now
  `http://n8n-server:5678/webhook/feedback`, in Doppler
  (`prd_eole-me-improv`), in the compose default and in the code.

> Still requires a redeploy: the running image is seven weeks old and predates
> both this fix and the `/feedback` migration.

---

## [0.11.5] - 2026-08-27

### Fixed

- **Feedback never reached n8n, and said so only in the container logs.**
  `docker-compose.prod.yml` passed `X_N8N_TOKEN` and `N8N_BASE_URL` but not
  `N8N_FEEDBACK_WEBHOOK_URL`, so the app always used whatever fallback its image
  had baked in — and the image running in production still pointed at
  `/webhook/jobby-feedback`, retired in July. Every submission answered:

  ```
  [Feedback Background Task Error]: n8n webhook returned status 404
  ```

  The variable is now passed explicitly, defaulting to
  `https://n8n.eole.me/webhook/feedback`. **A redeploy is required**: the fix is
  in the image and in the compose, not in the running container.

- **`ARCHITECTURE.md` still documented `/webhook/improv-feedback`** as the
  trigger, which no longer exists.

---

## [0.11.4] - 2026-08-27

### Fixed

- **The image build broke on an unpinned npm.** Both Dockerfiles ran
  `npm install -g npm@latest` on a `node:20-alpine` base. npm now requires
  Node >= 22.22.2, so the step fails with `notsup` and takes the whole build
  down — on any push, without a line of this repo changing. Pinned to `npm@^10`,
  the line Node 20 ships and supports. Moving the base to Node 22 is the real
  answer and deserves its own change.

---

## [0.11.3] - 2026-08-27

### Fixed

- **Theme generation worked again.** `POST /improv-regen` had failed on every
  call: the n8n workflow read `$env.X_N8N_TOKEN` and died at the first node
  after the webhook — before the model, so nothing was spent, and
  `src/app/api/improv-regen/route.ts` has no fallback, so the error reached the
  browser as-is. Anyone following the link shared on 26 August got an error.

  The variable never existed in the container. Authentication now runs on the
  webhook's `improv-assist-token` header credential, which is what this app
  already sends as `x-n8n-token`. Verified: 403 without a token, 200 with one —
  the first successful generation since 6 July.

### Known

- **`improv - telemetry - prod` fails on every event**, 63 out of 63 over 30
  days, at the Notion node: the mapping reads `$json.body.session_id` while its
  input is the data-table node's output. The app is blameless — it still sends
  `session_id`.

- **Two workflows answer `/improv-regen`.** The live one runs Gemini against a
  hard-coded Notion database; the switched-off `improv - assist-baas - prod`
  runs Groq, resolves the database from the data table and reports to Vector.
  The last two successful runs before today, on 6 July, were Groq — that build
  was the one live then. Which of the two survives is still open.

---

