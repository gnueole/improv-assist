"use client";

import { useState, useEffect, useCallback } from "react";
import { ImprovBuffer } from "@/types";
import { EMOTIONS, LOCATIONS, ERAS } from "@/data/mockData";

export function useImprovBuffer(activeTileId: string | null) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [buffer, setBuffer] = useState<ImprovBuffer>({
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

  // Load from local storage
  useEffect(() => {
    const savedDevMode = localStorage.getItem("dev_mode") === "true";
    setDevMode(savedDevMode);

    const savedBuffer = localStorage.getItem("improv_buffer");
    if (savedBuffer) {
      try {
        const parsed = JSON.parse(savedBuffer);
        if (parsed && Array.isArray(parsed.emotions) && Array.isArray(parsed.locations) && Array.isArray(parsed.eras)) {
          setBuffer(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse improv_buffer from localStorage", e);
      }
    }

    const initialBuffer: ImprovBuffer = {
      emotions: [...EMOTIONS],
      locations: [...LOCATIONS],
      eras: [...ERAS],
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
    const webhookUrl = process.env.NODE_ENV === "development"
      ? "https://n8n.eole.me/webhook/improv-regen"
      : "/webhook/improv-regen";

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

      const newBuffer: ImprovBuffer = {
        emotions: Array.isArray(data?.emotions) && data.emotions.length > 0 ? data.emotions : [...EMOTIONS],
        locations: Array.isArray(data?.locations) && data.locations.length > 0 ? data.locations : [...LOCATIONS],
        eras: Array.isArray(data?.eras) && data.eras.length > 0 ? data.eras : [...ERAS],
        last_fetch: Date.now()
      };

      console.log(`[Regen Diagnostics] New buffer counts - emotions: ${newBuffer.emotions.length}, locations: ${newBuffer.locations.length}, eras: ${newBuffer.eras.length}`);

      setBuffer(newBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(newBuffer));
      showToast("Réservoir rechargé avec succès !");
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`[Regen Diagnostics] Regeneration failed after ${errorTime}ms. Error:`, error);
      showToast("Erreur de régénération. Utilisation des données locales.");

      // Ensure non-empty buffer on error
      setBuffer((prev) => {
        const finalEmotions = prev.emotions.length === 0 ? [...EMOTIONS] : prev.emotions;
        const finalLocations = prev.locations.length === 0 ? [...LOCATIONS] : prev.locations;
        const finalEras = prev.eras.length === 0 ? [...ERAS] : prev.eras;

        const resetBuffer: ImprovBuffer = {
          emotions: finalEmotions,
          locations: finalLocations,
          eras: finalEras,
          last_fetch: Date.now()
        };
        localStorage.setItem("improv_buffer", JSON.stringify(resetBuffer));
        return resetBuffer;
      });
    } finally {
      setIsRegenerating(false);
      if (window.history.state && window.history.state.isRegenerating) {
        window.history.back();
      }
    }
  }, [devMode, activeTileId, showToast]);

  const pickItem = useCallback((category: "emotions" | "locations" | "eras", filter?: string): any => {
    const saved = localStorage.getItem("improv_buffer");
    if (!saved) return null;
    try {
      const currentBuffer = JSON.parse(saved) as ImprovBuffer;
      const items = currentBuffer[category] || [];

      let filteredItems = [...items];
      if (filter && filter !== "All") {
        if (category === "emotions") {
          filteredItems = items.filter((e: any) => e.category === filter);
        } else if (category === "locations") {
          filteredItems = items.filter((l: any) => l.category === filter);
        }
      }

      if (filteredItems.length === 0) {
        triggerRegen(true);
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

      if (updatedItems.length === 0) {
        triggerRegen(true);
      }

      return pickedItem;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [triggerRegen]);

  return {
    buffer,
    isRegenerating,
    devMode,
    toastMessage,
    triggerRegen,
    pickItem,
    showToast,
    setToastMessage,
    handleDevModeChange
  };
}
