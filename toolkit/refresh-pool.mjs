/**
 * @file refresh-pool.mjs
 * @description Regenerates public/data/reservoir-config.json through the app's own
 *              /api/improv-regen route, one category at a time, keeping whatever
 *              could not be regenerated. Run weekly by .github/workflows/refresh-pool.yml.
 * @author Éole <hi@eole>
 * @creation-date 2026-09-26
 * @license MIT
 */

import fs from "node:fs";
import path from "node:path";

const POOL_FILE = path.join(process.cwd(), "public", "data", "reservoir-config.json");
const ENDPOINT = process.env.POOL_ENDPOINT || "https://impro.eole.me/api/improv-regen";
// The route rate-limits to 3 requests per minute and per IP, and Gemini's own free
// tier rejects a call outright once two or three have gone through 25s apart, so the
// caller waits a full minute between them.
const PACING_MS = Number(process.env.POOL_PACING_MS || 60000);
// Three categories a week, not ten: fewer calls stay under the quota, and a themes
// reservoir does not need every category renewed weekly. The window advances with the
// week number, so each category comes round every few weeks with no cursor to store.
const BATCH_SIZE = Number(process.env.POOL_BATCH_SIZE || 3);
// The route gives up on n8n at 120s; leave it the room to answer that with a 504.
const REQUEST_TIMEOUT_MS = 150000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isUsable = (item) => item && typeof item.text === "string" && item.text.trim().length > 0;

async function requestCategory(category, count, avoid) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Without `avoid`, the model converges on the same answer week after week:
    // the first two runs reproduced four categories out of ten item-for-item.
    body: JSON.stringify({ category, count, platform: "ci", avoid }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
  // Since 0.17.0 the workflow labels its own fallback reservoir, so this no longer
  // rests on the novelty heuristic below.
  if (data && data.fallback === true) {
    throw new Error("the workflow answered with its fallback reservoir");
  }
  const fresh = data?.[category];
  if (!Array.isArray(fresh)) {
    throw new Error(`the response carries no "${category}" array`);
  }

  const seen = new Set();
  return fresh.filter((item) => {
    if (!isUsable(item) || seen.has(item.text)) return false;
    seen.add(item.text);
    return true;
  });
}

// POOL_CATEGORIES=animals,objects restricts the run, for a test or a partial refresh.
const only = (process.env.POOL_CATEGORIES || "").split(",").map((name) => name.trim()).filter(Boolean);

const pool = JSON.parse(fs.readFileSync(POOL_FILE, "utf-8"));
const available = Object.keys(pool).filter((key) => Array.isArray(pool[key]));

const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
const rotating = [];
for (let i = 0; i < Math.min(BATCH_SIZE, available.length); i += 1) {
  const candidate = available[(week * BATCH_SIZE + i) % available.length];
  if (!rotating.includes(candidate)) {
    rotating.push(candidate);
  }
}

const categories = only.length > 0 ? available.filter((key) => only.includes(key)) : rotating;
const report = [];
let refreshed = 0;

console.log(`Refreshing ${categories.length} categor${categories.length === 1 ? "y" : "ies"}: ${categories.join(", ")}`);

for (const [index, category] of categories.entries()) {
  const previous = pool[category];
  const target = previous.length || 50;
  // A short answer means a truncated generation: the items already shipped are worth more.
  const floor = Math.max(3, Math.floor(target / 2));

  if (index > 0) {
    await sleep(PACING_MS);
  }

  const known = new Set(previous.map((item) => item.text));

  try {
    const fresh = await requestCategory(category, target, [...known]);
    if (fresh.length < floor) {
      report.push(`~ ${category}: kept ${previous.length} (only ${fresh.length} returned, ${floor} needed)`);
      continue;
    }
    // Not one new item means the n8n workflow answered with the fallback reservoir
    // hardcoded in its `Check Error and Mock` node — it does that on any model
    // failure, with HTTP 200, and 46% of calls hit it. Writing that into the repo
    // would replace real generated content with canned data, which is how seven of
    // the ten categories came to be identical to the mock.
    const novel = fresh.filter((item) => !known.has(item.text)).length;
    if (novel === 0) {
      report.push(`~ ${category}: kept ${previous.length} (nothing new — the workflow served its fallback)`);
      continue;
    }
    pool[category] = fresh;
    refreshed += 1;
    report.push(`✔ ${category}: ${previous.length} -> ${fresh.length} (${novel} new)`);
  } catch (error) {
    report.push(`✘ ${category}: kept ${previous.length} (${error.message})`);
  }
}

console.log(report.join("\n"));
console.log(`\n${refreshed}/${categories.length} categories refreshed.`);

if (refreshed === 0) {
  console.error("Nothing came back usable — the pool is left untouched.");
  process.exit(1);
}

// The file ships without a trailing newline: keep it that way so a weekly diff
// stays confined to the items that actually changed.
fs.writeFileSync(POOL_FILE, JSON.stringify(pool, null, 2), "utf-8");
