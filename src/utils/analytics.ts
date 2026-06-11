/**
 * @file analytics.ts
 * @description Helper utility for dispatching custom tracking events to Google Analytics (GA4) and Google Tag Manager (GTM).
 * @author Éole <hi@eole>
 * @creation-date 2026-06-12
 * @license MIT
 */

/**
 * Tracks a custom event in Google Analytics (gtag) or Google Tag Manager (dataLayer)
 * when a workflow regeneration is triggered.
 * 
 * @param category The category name triggered (e.g. "characters", "themes"), or "all"
 * @param force True if manually forced (Dev Mode), false if automatic reload or normal reload
 */
export function trackWorkflowTrigger(category?: string, force: boolean = false) {
  if (typeof window === "undefined") return;

  const eventCategory = "improv_regen";
  const categoryName = category || "all";

  // 1. Send to Google Analytics (gtag.js) if available
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "workflow_trigger", {
      event_category: eventCategory,
      category_name: categoryName,
      is_forced: force,
    });
  }

  // 2. Send to Google Tag Manager (GTM) dataLayer if available
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: "workflow_trigger",
      eventCategory: eventCategory,
      categoryName: categoryName,
      isForced: force,
    });
  }
}
