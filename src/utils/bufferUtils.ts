/**
 * @file bufferUtils.ts
 * @description Utility functions and constants for managing the improvisation buffer.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import { ImprovBuffer } from "@/types";
import { EMOTIONS, LOCATIONS, ERAS, CHARACTERS } from "@/data/mockData";

export const EMPTY_BUFFER: ImprovBuffer = {
  scenarios: [],
  categories: [],
  themes: [],
  echauffements: [],
  emotions: [],
  locations: [],
  eras: [],
  characters: [],
  last_fetch: null
};

/**
 * Helper to construct an ImprovBuffer object from raw JSON data,
 * falling back to static mock datasets when optional lists are empty.
 */
export function buildBufferFromData(data: any): ImprovBuffer {
  return {
    scenarios: data.scenarios || [],
    categories: data.categories || [],
    themes: data.themes || [],
    echauffements: data.echauffements || [],
    emotions: (data.emotions && data.emotions.length > 0) ? data.emotions : EMOTIONS,
    locations: (data.locations && data.locations.length > 0) ? data.locations : LOCATIONS,
    eras: (data.eras && data.eras.length > 0) ? data.eras : ERAS,
    characters: (data.characters && data.characters.length > 0) ? data.characters : CHARACTERS,
    last_fetch: Date.now()
  };
}

/**
 * Validates whether the parsed JSON data is a valid ImprovBuffer structure.
 */
export function isValidBuffer(parsed: any): boolean {
  return (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.scenarios) &&
    Array.isArray(parsed.categories) &&
    Array.isArray(parsed.themes) &&
    Array.isArray(parsed.echauffements) &&
    Array.isArray(parsed.emotions) &&
    Array.isArray(parsed.locations) &&
    Array.isArray(parsed.eras) &&
    Array.isArray(parsed.characters)
  );
}
