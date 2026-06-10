"use client";

import { useState, useEffect, useCallback } from "react";
import { ImprovBuffer } from "@/types";

export function useImprovBuffer(activeTileId: string | null) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [n8nStatus, setN8nStatus] = useState<"green" | "red">("green");
  const [n8nError, setN8nError] = useState<string | null>(null);
  
  const [buffer, setBuffer] = useState<ImprovBuffer>({
    emotions: [],
    locations: [],
    eras: [],
    themes: [],
    scenarios: [],
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
            Array.isArray(parsed.emotions) &&
            Array.isArray(parsed.locations) &&
            Array.isArray(parsed.eras) &&
            Array.isArray(parsed.themes) &&
            Array.isArray(parsed.scenarios)
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
          const initialBuffer: ImprovBuffer = {
            emotions: data.emotions || [],
            locations: data.locations || [],
            eras: data.eras || [],
            themes: data.themes || [],
            scenarios: data.scenarios || [],
            last_fetch: null
          };
          setBuffer(initialBuffer);
          localStorage.setItem("improv_buffer", JSON.stringify(initialBuffer));
          // Clear consumed IDs on fresh pre-fill
          localStorage.setItem(
            "improv_consumed_ids",
            JSON.stringify({ emotions: [], locations: [], eras: [], themes: [], scenarios: [] })
          );
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

  // Reload Reservoir logic with n8n/API fallback
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

    setIsReloading(true);
    setIsRegenerating(true);

    window.history.pushState({
      activeTileId,
      isAboutOpen: false,
      isPromptOpen: false,
      isRegenerating: true
    }, "", "");

    const startTime = Date.now();
    const webhookUrl = "https://n8n.eole.me/webhook/improv-regen";

    try {
      // 1. Fetch the full pool from the local JSON config file
      const localResponse = await fetch("/data/reservoir-config.json");
      if (!localResponse.ok) {
        throw new Error("Failed to load local reservoir-config.json");
      }
      const localPool = await localResponse.json();

      // Read current consumed IDs from localStorage
      const consumedStr = localStorage.getItem("improv_consumed_ids");
      const consumed = consumedStr ? JSON.parse(consumedStr) : { emotions: [], locations: [], eras: [], themes: [], scenarios: [] };

      // Read current buffer
      const currentBufStr = localStorage.getItem("improv_buffer");
      const currentBuf = currentBufStr ? JSON.parse(currentBufStr) : { emotions: [], locations: [], eras: [], themes: [], scenarios: [] };

      // Determine available items for each category
      const available: ImprovBuffer = {
        emotions: (localPool.emotions || []).filter((item: any) => !consumed.emotions.includes(item.text) && !currentBuf.emotions.some((x: any) => x.text === item.text)),
        locations: (localPool.locations || []).filter((item: any) => !consumed.locations.includes(item.text) && !currentBuf.locations.some((x: any) => x.text === item.text)),
        eras: (localPool.eras || []).filter((item: any) => !consumed.eras.includes(item.text) && !currentBuf.eras.some((x: any) => x.text === item.text)),
        themes: (localPool.themes || []).filter((item: any) => !consumed.themes.includes(item.text) && !currentBuf.themes.some((x: any) => x.text === item.text)),
        scenarios: (localPool.scenarios || []).filter((item: any) => !consumed.scenarios.includes(item.text) && !currentBuf.scenarios.some((x: any) => x.text === item.text)),
        last_fetch: null
      };

      // Check if any category is exhausted
      const isExhausted = 
        (localPool.emotions && localPool.emotions.length > 0 && available.emotions.length === 0 && currentBuf.emotions.length === 0) ||
        (localPool.locations && localPool.locations.length > 0 && available.locations.length === 0 && currentBuf.locations.length === 0) ||
        (localPool.eras && localPool.eras.length > 0 && available.eras.length === 0 && currentBuf.eras.length === 0) ||
        (localPool.themes && localPool.themes.length > 0 && available.themes.length === 0 && currentBuf.themes.length === 0) ||
        (localPool.scenarios && localPool.scenarios.length > 0 && available.scenarios.length === 0 && currentBuf.scenarios.length === 0);

      // If we have available items in the local pool, refill the queue
      if (!isExhausted) {
        const newBuffer: ImprovBuffer = {
          emotions: [...currentBuf.emotions, ...available.emotions],
          locations: [...currentBuf.locations, ...available.locations],
          eras: [...currentBuf.eras, ...available.eras],
          themes: [...currentBuf.themes, ...available.themes],
          scenarios: [...currentBuf.scenarios, ...available.scenarios],
          last_fetch: Date.now()
        };

        setBuffer(newBuffer);
        localStorage.setItem("improv_buffer", JSON.stringify(newBuffer));
        setN8nStatus("green");
        setN8nError(null);
        showToast("Réservoir rechargé depuis le pool local.");
      } else {
        // Fallback to n8n AI Endpoint
        console.log(`[Regen Diagnostics] Local pool exhausted, falling back to: ${webhookUrl}`);
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.error) {
          throw new Error(data.error);
        }

        const newBuffer: ImprovBuffer = {
          emotions: Array.isArray(data?.emotions) && data.emotions.length > 0 ? data.emotions : (localPool.emotions || []),
          locations: Array.isArray(data?.locations) && data.locations.length > 0 ? data.locations : (localPool.locations || []),
          eras: Array.isArray(data?.eras) && data.eras.length > 0 ? data.eras : (localPool.eras || []),
          themes: Array.isArray(data?.themes) && data.themes.length > 0 ? data.themes : (localPool.themes || []),
          scenarios: Array.isArray(data?.scenarios) && data.scenarios.length > 0 ? data.scenarios : (localPool.scenarios || []),
          last_fetch: Date.now()
        };

        setBuffer(newBuffer);
        localStorage.setItem("improv_buffer", JSON.stringify(newBuffer));
        // Reset consumed list since we got fresh AI items
        localStorage.setItem(
          "improv_consumed_ids",
          JSON.stringify({ emotions: [], locations: [], eras: [], themes: [], scenarios: [] })
        );
        setN8nStatus("green");
        setN8nError(null);
        showToast("Réservoir régénéré par l'IA !");
      }
    } catch (error) {
      console.error("[Regen Diagnostics] Reload failed:", error);
      setN8nStatus("red");
      setN8nError(error instanceof Error ? error.message : String(error));
      showToast("Erreur de rechargement.");
    } finally {
      setIsReloading(false);
      setIsRegenerating(false);
      if (window.history.state && window.history.state.isRegenerating) {
        window.history.back();
      }
    }
  }, [devMode, activeTileId, showToast]);

  const pickItem = useCallback((category: "emotions" | "locations" | "eras" | "themes" | "scenarios", filter?: string): any => {
    const saved = localStorage.getItem("improv_buffer");
    if (!saved) return null;
    try {
      const currentBuffer = JSON.parse(saved) as ImprovBuffer;
      const items = currentBuffer[category] || [];

      let filteredItems = [...items];
      if (filter && filter !== "All") {
        if (category === "emotions" || category === "locations" || category === "themes" || category === "scenarios") {
          filteredItems = items.filter((e: any) => e.category === filter);
        } else if (category === "eras") {
          filteredItems = items.filter((e: any) => e.era === filter);
        }
      }

      if (filteredItems.length === 0) {
        showToast("Réservoir vide, pensez à le recharger !");
        return null;
      }

      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      const pickedItem = filteredItems[randomIndex];

      const updatedItems = items.filter((item: any) => item.text !== pickedItem.text);
      const updatedBuffer = {
        ...currentBuffer,
        [category]: updatedItems
      };

      setBuffer(updatedBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(updatedBuffer));

      // Track consumed ID (using the text since original items don't have id)
      const consumedStr = localStorage.getItem("improv_consumed_ids");
      const consumed = consumedStr ? JSON.parse(consumedStr) : { emotions: [], locations: [], eras: [], themes: [], scenarios: [] };
      if (!consumed[category].includes(pickedItem.text)) {
        consumed[category].push(pickedItem.text);
        localStorage.setItem("improv_consumed_ids", JSON.stringify(consumed));
      }

      return pickedItem;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [showToast]);

  return {
    buffer,
    isRegenerating,
    isReloading,
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
