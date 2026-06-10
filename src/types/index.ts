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

export interface Scenario {
  id: string;
  title: string;
  description: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
}

export interface Constraint {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Theme {
  id: string;
  title: string;
  category?: string;
}

export interface Echauffement {
  id: string;
  title: string;
  description: string;
  duration?: string;
}

export interface ImprovBuffer {
  scenarios: Scenario[];
  categories: Category[];
  constraints: Constraint[];
  themes: Theme[];
  echauffements: Echauffement[];
  last_fetch: number | null;
}


