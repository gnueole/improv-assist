/**
 * @file useDevMode.ts
 * @description React hook that manages the Developer Mode toggle state and persistence.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import { useState, useEffect, useCallback } from "react";

export function useDevMode() {
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    try {
      const savedDevMode = localStorage.getItem("dev_mode") === "true";
      setDevMode(savedDevMode);
    } catch (e) {
      console.error("Failed to read dev_mode from localStorage", e);
    }
  }, []);

  const handleDevModeChange = useCallback((val: boolean) => {
    setDevMode(val);
    try {
      localStorage.setItem("dev_mode", val ? "true" : "false");
    } catch (e) {
      console.error("Failed to save dev_mode to localStorage", e);
    }
  }, []);

  return {
    devMode,
    handleDevModeChange
  };
}
