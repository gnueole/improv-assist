"use client";

/**
 * @file ImprovBufferContext.tsx
 * @description React Context Provider that shares a single global prompts reservoir buffer and n8n sync state across the app.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ImprovBuffer } from "@/types";
import { useDevMode } from "@/hooks/useDevMode";
import { useToast } from "@/hooks/useToast";
import { EMPTY_BUFFER, buildBufferFromData, isValidBuffer } from "@/utils/bufferUtils";
import { trackWorkflowTrigger } from "@/utils/analytics";

interface ImprovBufferContextType {
  buffer: ImprovBuffer;
  isRegenerating: boolean;
  isReloading: boolean;
  isLoading: boolean;
  devMode: boolean;
  toastMessage: string | null;
  triggerRegen: (force?: boolean, category?: string) => Promise<void>;
  pickItem: (category: string, filter?: string) => Promise<any>;
  showToast: (msg: string) => void;
  setToastMessage: (msg: string | null) => void;
  handleDevModeChange: (val: boolean) => void;
  n8nStatus: "green" | "red";
  n8nError: string | null;
}

const ImprovBufferContext = createContext<ImprovBufferContextType | undefined>(undefined);

export function ImprovBufferProvider({ children }: { children: React.ReactNode }) {
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
  // Reload Reservoir: Reset local queues by re-fetching reservoir-config.json
  const triggerRegen = useCallback(async (force: boolean = false, category?: string) => {
    setIsReloading(true);
    setIsLoading(true);
    try {
      if (force) {
        trackWorkflowTrigger(category, true);
        showToast(category 
          ? `Régénération de la catégorie '${category}' via n8n...`
          : "Régénération du réservoir en cours via n8n & Gemini (1 à 2 minutes)..."
        );
        
        const payload: Record<string, any> = {
          count: category ? 50 : 400
        };
        if (category) {
          payload.category = category;
        } else {
          payload.categories_required = ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters"];
        }

        const response = await fetch("/api/improv-regen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error("Erreur de communication avec le serveur de génération");
        }
        const data = await response.json();
        
        let currentBuffer = { ...EMPTY_BUFFER };
        try {
          const saved = localStorage.getItem("improv_buffer");
          if (saved) currentBuffer = JSON.parse(saved);
        } catch (e) {}

        const fetchedBuffer = buildBufferFromData(data);
        const mergedBuffer = { ...currentBuffer };
        
        const catsToUpdate = category ? [category] : ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters"];
        for (const cat of catsToUpdate) {
          mergedBuffer[cat as keyof ImprovBuffer] = fetchedBuffer[cat as keyof ImprovBuffer] as any;
        }
        
        setBuffer(mergedBuffer);
        localStorage.setItem("improv_buffer", JSON.stringify(mergedBuffer));
        setN8nStatus("green");
        setN8nError(null);
        showToast(category 
          ? `Catégorie '${category}' régénérée avec succès !`
          : "Réservoir régénéré avec succès depuis n8n !"
        );
      } else {
        const response = await fetch("/data/reservoir-config.json");
        if (!response.ok) {
          throw new Error("Failed to load local reservoir-config.json");
        }
        const data = await response.json();
        const localBuffer = buildBufferFromData(data);
        
        let currentBuffer = { ...EMPTY_BUFFER };
        try {
          const saved = localStorage.getItem("improv_buffer");
          if (saved) currentBuffer = JSON.parse(saved);
        } catch (e) {}

        const mergedBuffer = { ...currentBuffer };
        const catsToUpdate = category ? [category] : ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters"];
        for (const cat of catsToUpdate) {
          mergedBuffer[cat as keyof ImprovBuffer] = localBuffer[cat as keyof ImprovBuffer] as any;
        }

        setBuffer(mergedBuffer);
        localStorage.setItem("improv_buffer", JSON.stringify(mergedBuffer));
        setN8nStatus("green");
        setN8nError(null);
        showToast(category 
          ? `Catégorie '${category}' rechargée.`
          : "Réservoir rechargé depuis le pool local."
        );
      }
    } catch (error) {
      console.error("[Regen Diagnostics] Reload failed:", error);
      setN8nStatus("red");
      const errorMsg = error instanceof Error ? error.message : String(error);
      setN8nError(errorMsg);
      if (errorMsg.includes("Timeout issued")) {
        showToast("Le service de génération a expiré (Timeout). Veuillez réessayer.");
      } else {
        showToast(force ? "Échec de la régénération via n8n." : "Erreur de rechargement.");
      }
    } finally {
      setIsReloading(false);
      setIsLoading(false);
    }
  }, [showToast]);

  const pickItem = useCallback(async (category: string, filter?: string): Promise<any> => {
    const isManaged = ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters"].includes(category);
    
    if (!isManaged) {
      return null;
    }

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

    let filteredQueue = [...queue];
    if (filter && filter !== "All") {
      filteredQueue = queue.filter((item: any) => item.category === filter || item.era === filter);
    }

    if (filteredQueue.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQueue.length);
      const picked = filteredQueue[randomIndex];

      const updatedQueue = queue.filter((item: any) => item.text !== picked.text);
      const updatedBuffer = {
        ...currentBuffer,
        [category]: updatedQueue
      };

      setBuffer(updatedBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(updatedBuffer));
      return picked;
    }

    setIsLoading(true);
    setIsReloading(true);
    showToast(`Réservoir vide pour ${category}. Récupération d'un nouvel élément via n8n...`);

    trackWorkflowTrigger(category, false);
    const apiUrl = "/api/improv-regen";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count: 50 })
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
      const fetchedBuffer = buildBufferFromData(data);
      const categoryQueue = (fetchedBuffer[category as keyof ImprovBuffer] || []) as any[];
      
      if (categoryQueue.length === 0) {
        throw new Error("n8n webhook did not return any items for category: " + category);
      }

      // Pick the first item
      const picked = categoryQueue[0];
      
      // Remove the picked item from the queue
      const remainingNewItems = categoryQueue.slice(1);

      // Merge into currentBuffer
      const mergedBuffer = { ...currentBuffer };
      for (const cat of ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters"]) {
        const existingQueue = (currentBuffer[cat as keyof ImprovBuffer] || []) as any[];
        const newItems = (cat === category ? remainingNewItems : (fetchedBuffer[cat as keyof ImprovBuffer] || [])) as any[];
        // Avoid duplicate items
        const filteredNew = newItems.filter(
          (newItem: any) => !existingQueue.some((existingItem: any) => existingItem.text === newItem.text)
        );
        mergedBuffer[cat as keyof ImprovBuffer] = [...existingQueue, ...filteredNew] as any;
      }

      setBuffer(mergedBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(mergedBuffer));
      
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
      if (errorMsg.includes("Timeout issued")) {
        showToast("Le service de génération a expiré (Timeout). Veuillez réessayer.");
      } else {
        showToast(devMode ? `Erreur n8n: ${errorMsg}` : "Erreur lors de la récupération n8n.");
      }
      return null;
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  }, [showToast, devMode]);

  return (
    <ImprovBufferContext.Provider
      value={{
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
      }}
    >
      {children}
    </ImprovBufferContext.Provider>
  );
}

export { ImprovBufferContext };
