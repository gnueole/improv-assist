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
// The route rate-limits to 3 requests per minute and per IP, so the caller paces itself.
const PACING_MS = Number(process.env.POOL_PACING_MS || 25000);
// The route gives up on n8n at 120s; leave it the room to answer that with a 504.
const REQUEST_TIMEOUT_MS = 150000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isUsable = (item) => item && typeof item.text === "string" && item.text.trim().length > 0;

async function requestCategory(category, count) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, count, platform: "ci" }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
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
const categories = Object.keys(pool)
  .filter((key) => Array.isArray(pool[key]))
  .filter((key) => only.length === 0 || only.includes(key));
const report = [];
let refreshed = 0;

for (const [index, category] of categories.entries()) {
  const previous = pool[category];
  const target = previous.length || 50;
  // A short answer means a truncated generation: the items already shipped are worth more.
  const floor = Math.max(3, Math.floor(target / 2));

  if (index > 0) {
    await sleep(PACING_MS);
  }

  try {
    const fresh = await requestCategory(category, target);
    if (fresh.length < floor) {
      report.push(`~ ${category}: kept ${previous.length} (only ${fresh.length} returned, ${floor} needed)`);
      continue;
    }
    pool[category] = fresh;
    refreshed += 1;
    report.push(`✔ ${category}: ${previous.length} -> ${fresh.length}`);
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
