import { Emotion, Location, Era } from "@/types";
import reservoirData from "../../public/data/reservoir-config.json";

export const EMOTIONS: Emotion[] = (reservoirData as any).emotions || [];
export const LOCATIONS: Location[] = (reservoirData as any).locations || [];
export const ERAS: Era[] = (reservoirData as any).eras || [];

export const PRESET_COLORS: string[] = [
  "rgba(6, 182, 212, 0.8)", // Cyan
  "rgba(234, 179, 8, 0.8)",  // Yellow
  "rgba(236, 72, 153, 0.8)", // Pink/Magenta
  "rgba(168, 85, 247, 0.8)", // Purple
  "rgba(249, 115, 22, 0.8)", // Orange
];
