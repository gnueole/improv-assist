"use client";

/**
 * @file useImprovBuffer.ts
 * @description React hook that consumes the global ImprovBufferContext.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import { useContext } from "react";
import { ImprovBufferContext } from "@/context/ImprovBufferContext";

export function useImprovBuffer(activeTileId?: string | null) {
  const context = useContext(ImprovBufferContext);
  if (!context) {
    throw new Error("useImprovBuffer must be used within an ImprovBufferProvider");
  }
  return context;
}
