"use client";

/**
 * @file useImprovBuffer.ts
 * @description React hook that coordinates local prompts reservoir buffer and n8n sync states.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import { useState, useEffect, useCallback } from "react";
import { ImprovBuffer } from "@/types";
import { useDevMode } from "./useDevMode";
import { useToast } from "./useToast";
import { EMPTY_BUFFER, buildBufferFromData, isValidBuffer } from "@/utils/bufferUtils";

export function useImprovBuffer(activeTileId?: string | null) {
  const { devMode, handleDevModeChange } = useDevMode();
  const { toastMessage, showToast, setToastMessage } = useToast();

  const [isRegenerating] = useState(false); // Kept for interface compatibility
  const [isReloading, setIsReloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<"green" | "red">("green");
  const [n8nError, setN8nError] = useState<string | null>(null);
  const [buffer, setBuffer] = useState<ImprovBuffer>(EMPTY_BUFFER);

  // Initialize buffer from localStorage or fetch from public/data/reservoir-config.json
  useEffect(() => {
    const initialize = async () => {
      try {
        const savedBuffer = localStorage.getItem("improv_buffer");
        if (savedBuffer) {
          const parsed = JSON.parse(savedBuffer);
          if (isValidBuffer(parsed)) {
            setBuffer(parsed);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse improv_buffer from localStorage", e);
      }

      // Pre-fill from public/data/reservoir-config.json
      try {
        const response = await fetch("/data/reservoir-config.json");
        if (response.ok) {
          const data = await response.json();
          const initialBuffer = buildBufferFromData(data);
          setBuffer(initialBuffer);
          localStorage.setItem("improv_buffer", JSON.stringify(initialBuffer));
        }
      } catch (err) {
        console.error("Failed to fetch initial reservoir config", err);
      }
    };

    initialize();
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
      const newBuffer = buildBufferFromData(data);
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
    let currentBuffer = { ...EMPTY_BUFFER };
    try {
      const saved = localStorage.getItem("improv_buffer");
      if (saved) {
        currentBuffer = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to read/parse improv_buffer for pickItem", e);
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
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData) {
            const description = errData.errorDescription || errData.description;
            const message = errData.errorMessage || errData.error?.message || errData.error;
            
            if (message && description) {
              errorMsg = `${message} (${description})`;
            } else if (message) {
              errorMsg = message;
            } else if (description) {
              errorMsg = description;
            }
          }
        } catch (_) {}
        throw new Error(errorMsg);
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
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (devMode) {
        console.error(`[n8n Fallback Error Details] Failed to fetch single item for ${category}:`, error);
      } else {
        console.error(`[n8n Fallback Error] Failed to fetch single item for ${category}:`, errorMsg);
      }
      setN8nStatus("red");
      setN8nError(errorMsg);
      showToast(devMode ? `Erreur n8n: ${errorMsg}` : "Erreur lors de la récupération n8n.");
      return null;
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  }, [showToast, devMode]);

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
