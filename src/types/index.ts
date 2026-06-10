import React from "react";

export interface Tile {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
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
}

export interface Category {
  text: string;
  category?: string;
}

export interface Echauffement {
  text: string;
  duration?: string;
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
  last_fetch: number | null;
}
