"use client";

/**
 * @file useImprovBuffer.ts
 * @description Custom React hook that manages the offline/caching buffer reservoir of improvisation prompts 
 * (scenarios, categories, constraints, themes, echauffements) in localStorage. Handles state transitions
 * and ensures robust fallback loading from static-reservoir.
 */

import { useState, useEffect, useCallback } from "react";
import { ImprovBuffer, Scenario, Category, Constraint, Theme, Echauffement } from "@/types";
import {
  STATIC_SCENARIOS,
  STATIC_CATEGORIES,
  STATIC_CONSTRAINTS,
  STATIC_THEMES,
  STATIC_ECHAUFFEMENTS
} from "@/data/static-reservoir";

export function useImprovBuffer(activeTileId: string | null) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [n8nStatus, setN8nStatus] = useState<"green" | "red">("green");
  const [n8nError, setN8nError] = useState<string | null>(null);
  const [buffer, setBuffer] = useState<ImprovBuffer>({
    scenarios: [],
    categories: [],
    constraints: [],
    themes: [],
    echauffements: [],
    last_fetch: null
  });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Load from local storage or pre-fill with static reservoir
  useEffect(() => {
    const savedDevMode = localStorage.getItem("dev_mode") === "true";
    setDevMode(savedDevMode);

    const savedBuffer = localStorage.getItem("improv_buffer");
    if (savedBuffer) {
      try {
        const parsed = JSON.parse(savedBuffer);
        if (
          parsed &&
          Array.isArray(parsed.scenarios) &&
          Array.isArray(parsed.categories) &&
          Array.isArray(parsed.constraints) &&
          Array.isArray(parsed.themes) &&
          Array.isArray(parsed.echauffements)
        ) {
          setBuffer(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse improv_buffer from localStorage", e);
      }
    }

    const initialBuffer: ImprovBuffer = {
      scenarios: [...STATIC_SCENARIOS],
      categories: [...STATIC_CATEGORIES],
      constraints: [...STATIC_CONSTRAINTS],
      themes: [...STATIC_THEMES],
      echauffements: [...STATIC_ECHAUFFEMENTS],
      last_fetch: null
    };
    setBuffer(initialBuffer);
    localStorage.setItem("improv_buffer", JSON.stringify(initialBuffer));
  }, []);

  const handleDevModeChange = useCallback((val: boolean) => {
    setDevMode(val);
    localStorage.setItem("dev_mode", val ? "true" : "false");
  }, []);

  const triggerRegen = useCallback(async (force: boolean = false) => {
    const savedBuffer = localStorage.getItem("improv_buffer");
    let currentLastFetch: number | null = null;
    if (savedBuffer) {
      try {
        const parsed = JSON.parse(savedBuffer);
        currentLastFetch = parsed.last_fetch;
      } catch (e) {
        console.error(e);
      }
    }

    if (!force && !devMode && currentLastFetch) {
      const elapsed = Date.now() - currentLastFetch;
      const min5 = 5 * 60 * 1000;
      if (elapsed < min5) {
        const remainingMin = Math.ceil((min5 - elapsed) / 60000);
        showToast(`Réservoir mis à jour récemment. Prochain refresh possible dans ${remainingMin} min`);
        return;
      }
    }

    setIsRegenerating(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: false,
      isPromptOpen: false,
      isRegenerating: true
    }, "", "");

    const startTime = Date.now();
    const webhookUrl = "https://n8n.eole.me/webhook/improv-regen";

    console.log(`[Regen Diagnostics] Starting webhook call to: ${webhookUrl}`);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const responseTime = Date.now() - startTime;
      console.log(`[Regen Diagnostics] HTTP response received. Status: ${response.status} (${response.statusText}) in ${responseTime}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} (${response.statusText})`);
      }

      const rawText = await response.text();
      const textTime = Date.now() - startTime;
      console.log(`[Regen Diagnostics] Raw response text fetched (length: ${rawText.length} chars) in ${textTime}ms`);

      let data;
      try {
        data = JSON.parse(rawText);
        console.log(`[Regen Diagnostics] JSON parsed successfully. Keys present:`, Object.keys(data));
      } catch (jsonErr: any) {
        console.error(`[Regen Diagnostics] JSON Parse Error:`, jsonErr);
        console.log(`[Regen Diagnostics] Raw Response was:`, rawText);
        throw jsonErr;
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      const newBuffer: ImprovBuffer = {
        scenarios: Array.isArray(data?.scenarios) && data.scenarios.length > 0 ? data.scenarios : [...STATIC_SCENARIOS],
        categories: Array.isArray(data?.categories) && data.categories.length > 0 ? data.categories : [...STATIC_CATEGORIES],
        constraints: Array.isArray(data?.constraints) && data.constraints.length > 0 ? data.constraints : [...STATIC_CONSTRAINTS],
        themes: Array.isArray(data?.themes) && data.themes.length > 0 ? data.themes : [...STATIC_THEMES],
        echauffements: Array.isArray(data?.echauffements) && data.echauffements.length > 0 ? data.echauffements : [...STATIC_ECHAUFFEMENTS],
        last_fetch: Date.now()
      };

      console.log(`[Regen Diagnostics] New buffer counts - scenarios: ${newBuffer.scenarios.length}, categories: ${newBuffer.categories.length}, constraints: ${newBuffer.constraints.length}, themes: ${newBuffer.themes.length}, echauffements: ${newBuffer.echauffements.length}`);

      setBuffer(newBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(newBuffer));
      setN8nStatus("green");
      setN8nError(null);
      showToast("Réservoir rechargé avec succès !");
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`[Regen Diagnostics] Regeneration failed after ${errorTime}ms. Error:`, error);
      setN8nStatus("red");
      setN8nError(error instanceof Error ? error.message : String(error));
      showToast("Erreur de régénération. Utilisation des données locales.");

      // Ensure non-empty buffer on error
      setBuffer((prev) => {
        const finalScenarios = prev.scenarios.length === 0 ? [...STATIC_SCENARIOS] : prev.scenarios;
        const finalCategories = prev.categories.length === 0 ? [...STATIC_CATEGORIES] : prev.categories;
        const finalConstraints = prev.constraints.length === 0 ? [...STATIC_CONSTRAINTS] : prev.constraints;
        const finalThemes = prev.themes.length === 0 ? [...STATIC_THEMES] : prev.themes;
        const finalEchauffements = prev.echauffements.length === 0 ? [...STATIC_ECHAUFFEMENTS] : prev.echauffements;

        const resetBuffer: ImprovBuffer = {
          scenarios: finalScenarios,
          categories: finalCategories,
          constraints: finalConstraints,
          themes: finalThemes,
          echauffements: finalEchauffements,
          last_fetch: Date.now()
        };
        localStorage.setItem("improv_buffer", JSON.stringify(resetBuffer));
        return resetBuffer;
      });
    } finally {
      // 🎯 Glitch Fix: Ensure loading state is reset inside finally block
      setIsRegenerating(false);
      if (window.history.state && window.history.state.isRegenerating) {
        window.history.back();
      }
    }
  }, [devMode, activeTileId, showToast]);

  const pickItem = useCallback((category: "scenarios" | "categories" | "constraints" | "themes" | "echauffements"): any => {
    const saved = localStorage.getItem("improv_buffer");
    if (!saved) return null;
    try {
      const currentBuffer = JSON.parse(saved) as ImprovBuffer;
      const items = currentBuffer[category] || [];

      // If category is exhausted, refill it with local static default data
      if (items.length === 0) {
        showToast("Réservoir épuisé. Données locales utilisées, pensez à le recharger !");
        
        let defaults: any[] = [];
        if (category === "scenarios") defaults = [...STATIC_SCENARIOS];
        else if (category === "categories") defaults = [...STATIC_CATEGORIES];
        else if (category === "constraints") defaults = [...STATIC_CONSTRAINTS];
        else if (category === "themes") defaults = [...STATIC_THEMES];
        else if (category === "echauffements") defaults = [...STATIC_ECHAUFFEMENTS];

        if (defaults.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * defaults.length);
        const pickedItem = defaults[randomIndex];

        const updatedItems = defaults.filter((item: any) => item.id !== pickedItem.id);
        const updatedBuffer = {
          ...currentBuffer,
          [category]: updatedItems
        };

        setBuffer(updatedBuffer);
        localStorage.setItem("improv_buffer", JSON.stringify(updatedBuffer));
        return pickedItem;
      }

      const randomIndex = Math.floor(Math.random() * items.length);
      const pickedItem = items[randomIndex];

      const updatedItems = items.filter((item: any) => item.id !== pickedItem.id);
      const updatedBuffer = {
        ...currentBuffer,
        [category]: updatedItems
      };

      setBuffer(updatedBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(updatedBuffer));

      return pickedItem;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [showToast]);

  return {
    buffer,
    isRegenerating,
    devMode,
    toastMessage,
    triggerRegen,
    pickItem,
    showToast,
    setToastMessage,
    handleDevModeChange,
    n8nStatus,
    n8nError
  };
}
