/**
 * @file index.ts
 * @description Global TypeScript interface and type declarations for the Improv Engine.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React from "react";

export interface Tile {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  menu?: string;
  keywords?: string[];
  isDir?: boolean;
}

export interface TouchPoint {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface Emotion {
  text: string;
  category: string;
}

export interface Location {
  text: string;
  category: string;
}

export interface Era {
  text: string;
  era: string;
}

export interface Theme {
  text: string;
  category?: string;
}

export interface Scenario {
  text: string;
  category?: string;
  brief?: string;
}

export interface Category {
  text: string;
  category?: string;
  description?: string;
}

export interface Echauffement {
  text: string;
  duration?: string;
  category?: string;
  description?: string;
}

export interface Character {
  text: string;
  age: string;
  accessory: string;
  gesture: string;
}

export interface Animal {
  text: string;
  category?: string;
}

export interface ObjectItem {
  text: string;
  category?: string;
}

export interface ImprovBuffer {
  scenarios: Scenario[];
  categories: Category[];
  themes: Theme[];
  echauffements: Echauffement[];
  emotions: Emotion[];
  locations: Location[];
  eras: Era[];
  characters: Character[];
  animals: Animal[];
  objects: ObjectItem[];
  last_fetch: number | null;
}

