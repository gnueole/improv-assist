/**
 * @file icon-helper.ts
 * @description Helper functions that provide the Sparkles icon SVG definition 
 * (matching the dashboard header sparkles) with different color themes depending on the environment.
 */

const PROD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="irised" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="33%" stop-color="#ffea00" />
      <stop offset="66%" stop-color="#ff007f" />
      <stop offset="100%" stop-color="#7000ff" />
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#irised)" />
  <g transform="translate(106, 106) scale(12.5)" fill="black" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"/>
  </g>
</svg>`;

const DEV_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="dev-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b30" />
      <stop offset="50%" stop-color="#ff9500" />
      <stop offset="100%" stop-color="#ffcc00" />
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#dev-grad)" />
  <g transform="translate(106, 106) scale(12.5)" fill="black" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"/>
  </g>
</svg>`;

export function getIconSvg() {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? DEV_SVG : PROD_SVG;
}
