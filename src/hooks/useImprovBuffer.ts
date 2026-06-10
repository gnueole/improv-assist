"use client";

/**
 * @file useImprovBuffer.ts
 * @description React hook that manages the local prompts reservoir buffer and n8n sync states.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import { useState, useEffect, useCallback } from "react";
import { ImprovBuffer } from "@/types";

export function useImprovBuffer(activeTileId: string | null) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [n8nStatus, setN8nStatus] = useState<"green" | "red">("green");
  const [n8nError, setN8nError] = useState<string | null>(null);
  
  const [buffer, setBuffer] = useState<ImprovBuffer>({
    scenarios: [],
    categories: [],
    themes: [],
    echauffements: [],
    emotions: [],
    locations: [],
    eras: [],
    last_fetch: null
  });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize buffer from localStorage or fetch from public/data/reservoir-config.json
  useEffect(() => {
    const savedDevMode = localStorage.getItem("dev_mode") === "true";
    setDevMode(savedDevMode);

    const initialize = async () => {
      const savedBuffer = localStorage.getItem("improv_buffer");
      if (savedBuffer) {
        try {
          const parsed = JSON.parse(savedBuffer);
          if (
            parsed &&
            Array.isArray(parsed.scenarios) &&
            Array.isArray(parsed.categories) &&
            Array.isArray(parsed.themes) &&
            Array.isArray(parsed.echauffements) &&
            Array.isArray(parsed.emotions) &&
            Array.isArray(parsed.locations) &&
            Array.isArray(parsed.eras)
          ) {
            setBuffer(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse improv_buffer from localStorage", e);
        }
      }

      // Pre-fill from public/data/reservoir-config.json
      try {
        const response = await fetch("/data/reservoir-config.json");
        if (response.ok) {
          const data = await response.json();
          const mock = require("@/data/mockData");
          const initialBuffer: ImprovBuffer = {
            scenarios: data.scenarios || [],
            categories: data.categories || [],
            themes: data.themes || [],
            echauffements: data.echauffements || [],
            emotions: (data.emotions && data.emotions.length > 0) ? data.emotions : mock.EMOTIONS,
            locations: (data.locations && data.locations.length > 0) ? data.locations : mock.LOCATIONS,
            eras: (data.eras && data.eras.length > 0) ? data.eras : mock.ERAS,
            last_fetch: Date.now()
          };
          setBuffer(initialBuffer);
          localStorage.setItem("improv_buffer", JSON.stringify(initialBuffer));
        }
      } catch (err) {
        console.error("Failed to fetch initial reservoir config", err);
      }
    };

    initialize();
  }, []);

  const handleDevModeChange = useCallback((val: boolean) => {
    setDevMode(val);
    localStorage.setItem("dev_mode", val ? "true" : "false");
  }, []);

  // Reload Reservoir: Reset local queues by re-fetching reservoir-config.json
  const triggerRegen = useCallback(async (force: boolean = false) => {
    setIsReloading(true);
    setIsLoading(true);
    try {
      const response = await fetch("/data/reservoir-config.json");
      if (!response.ok) {
        throw new Error("Failed to load local reservoir-config.json");
      }
      const data = await response.json();
      const mock = require("@/data/mockData");
      const newBuffer: ImprovBuffer = {
        scenarios: data.scenarios || [],
        categories: data.categories || [],
        themes: data.themes || [],
        echauffements: data.echauffements || [],
        emotions: (data.emotions && data.emotions.length > 0) ? data.emotions : mock.EMOTIONS,
        locations: (data.locations && data.locations.length > 0) ? data.locations : mock.LOCATIONS,
        eras: (data.eras && data.eras.length > 0) ? data.eras : mock.ERAS,
        last_fetch: Date.now()
      };
      setBuffer(newBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(newBuffer));
      setN8nStatus("green");
      setN8nError(null);
      showToast("Réservoir rechargé depuis le pool local.");
    } catch (error) {
      console.error("[Regen Diagnostics] Reload failed:", error);
      setN8nStatus("red");
      setN8nError(error instanceof Error ? error.message : String(error));
      showToast("Erreur de rechargement.");
    } finally {
      setIsReloading(false);
      setIsLoading(false);
    }
  }, [showToast]);

  const pickItem = useCallback(async (category: string, filter?: string): Promise<any> => {
    // 1. Check if the category is one of the 7 managed categories
    const isManaged = ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras"].includes(category);
    
    if (!isManaged) {
      return null;
    }

    // 2. Fetch the current buffer
    const saved = localStorage.getItem("improv_buffer");
    let currentBuffer: ImprovBuffer = {
      scenarios: [],
      categories: [],
      themes: [],
      echauffements: [],
      emotions: [],
      locations: [],
      eras: [],
      last_fetch: null
    };
    if (saved) {
      try {
        currentBuffer = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    const queue = currentBuffer[category as keyof ImprovBuffer] as any[] || [];

    // Filter queue if a filter is provided
    let filteredQueue = [...queue];
    if (filter && filter !== "All") {
      filteredQueue = queue.filter((item: any) => item.category === filter || item.era === filter);
    }

    // A. If local array has items, pop one out (instant, free)
    if (filteredQueue.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQueue.length);
      const picked = filteredQueue[randomIndex];

      // Remove it from the buffer
      const updatedQueue = queue.filter((item: any) => item.text !== picked.text);
      const updatedBuffer = {
        ...currentBuffer,
        [category]: updatedQueue
      };

      setBuffer(updatedBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(updatedBuffer));
      return picked;
    }

    // B. If the local array is empty (exhausted), trigger live fetch to n8n for exactly 1 item
    setIsLoading(true);
    setIsReloading(true);
    showToast(`Réservoir vide pour ${category}. Récupération d'un nouvel élément via n8n...`);

    const apiUrl = "/api/improv-regen";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count: 1 })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Robustly extract the item
      let picked: any = null;
      if (data) {
        if (typeof data === "string") {
          picked = { text: data };
        } else if (Array.isArray(data)) {
          picked = data[0];
        } else if (typeof data === "object") {
          if (data.text) {
            picked = data;
          } else if (Array.isArray(data[category]) && data[category].length > 0) {
            picked = data[category][0];
          } else {
            const firstKey = Object.keys(data)[0];
            if (firstKey && Array.isArray(data[firstKey]) && data[firstKey].length > 0) {
              picked = data[firstKey][0];
            } else {
              picked = data;
            }
          }
        }
      }

      if (!picked || !picked.text) {
        throw new Error("Invalid response structure from n8n webhook");
      }

      setN8nStatus("green");
      setN8nError(null);
      return picked;
    } catch (error) {
      console.error(`[n8n Fallback Error] Failed to fetch single item for ${category}:`, error);
      setN8nStatus("red");
      setN8nError(error instanceof Error ? error.message : String(error));
      showToast("Erreur lors de la récupération n8n.");
      return null;
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  }, [showToast]);

  return {
    buffer,
    isRegenerating,
    isReloading,
    isLoading,
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
