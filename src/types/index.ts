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
