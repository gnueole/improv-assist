# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

