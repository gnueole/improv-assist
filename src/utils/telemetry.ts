/**
 * @file telemetry.ts
 * @description Single client-side entry point for product events, carrying the dev
 *              and opt-out guards so no caller has to remember them.
 * @author Éole <hi@eole>
 * @creation-date 2026-09-26
 * @license MIT
 */

/**
 * Posts one product event to /api/telemetry, which stamps `application` and
 * forwards to Vector. Emit `event_type` in snake_case: that is the name the
 * Axiom dashboards group by, and there is no second acceptable spelling.
 *
 * Silent by design — telemetry must never break a draw on stage.
 */
export function sendTelemetry(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local");

  let isOptOut = false;
  try {
    isOptOut = localStorage.getItem("telemetry-opt-out") === "true";
  } catch (e) {}

  if (isDev || isOptOut) {
    console.log(`[Telemetry Skip - ${isDev ? "DEV" : "Opt-Out"}]`, payload);
    return;
  }

  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch((err) => console.warn("[Telemetry] Error sending event:", err));
}
