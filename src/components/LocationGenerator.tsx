"use client";

/**
 * @file LocationGenerator.tsx
 * @description Component that presents suggested theatrical locations/settings. Supports category filtering,
 * has an irised border layout, and displays spinning animations during selection.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState, useEffect, useContext } from "react";
import { RefreshCw } from "lucide-react";
import { LOCATIONS as fallbackLocations } from "@/data/mockData";
import reservoirPool from "../../public/data/reservoir-config.json";
import { Location } from "@/types";
import { ImprovBufferContext } from "@/context/ImprovBufferContext";

const LOCATIONS_POOL: Location[] = (reservoirPool && Array.isArray((reservoirPool as any).locations) && (reservoirPool as any).locations.length > 0)
  ? (reservoirPool as any).locations
  : fallbackLocations;

interface LocationGeneratorProps {
  pickItem: (category: string, filter?: string) => Promise<any>;
}

export default function LocationGenerator({ pickItem }: LocationGeneratorProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationCategory, setLocationCategory] = useState<string>("All");
  const [isSpinning, setIsSpinning] = useState(false);

  const context = useContext(ImprovBufferContext);
  const devMode = context?.devMode ?? false;
  const remainingCount = context?.buffer?.locations?.length ?? 0;

  // Piocher un lieu initial au montage
  useEffect(() => {
    let active = true;
    pickItem("locations", locationCategory).then((initial) => {
      if (active && initial) {
        setCurrentLocation(initial);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const spinLocation = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;

    const interval = setInterval(() => {
      const rand = LOCATIONS_POOL[Math.floor(Math.random() * LOCATIONS_POOL.length)];
      setCurrentLocation(rand);
      count++;
    }, 70);

    pickItem("locations", locationCategory)
      .then((finalLocation) => {
        const minSpinTime = 12 * 70;
        setTimeout(() => {
          clearInterval(interval);
          setIsSpinning(false);
          setCurrentLocation(finalLocation || null);
        }, Math.max(0, minSpinTime - count * 70));
      })
      .catch((err) => {
        console.error(err);
        clearInterval(interval);
        setIsSpinning(false);
        setCurrentLocation(null);
      });
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Category Filter */}
      <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800/80 rounded-full text-sm z-10">
        {["All", "Huis clos", "Quotidien", "Aventure", "Insolite"].map((cat) => (
          <button
            key={cat}
            onClick={() => setLocationCategory(cat)}
            className={`px-3 py-1 rounded-full transition-all ${
              locationCategory === cat ? "bg-zinc-800 text-white font-medium shadow-md shadow-black/50" : "text-zinc-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {devMode && (
        <span className="text-[10px] font-mono text-zinc-500 lowercase select-none animate-fade-in -mt-2 -mb-2">
          ({remainingCount} suggestions restantes)
        </span>
      )}

      {/* Display Box */}
      <div className="generator-card">
        <div className="generator-card-inner">
          <div className={`transition-all duration-300 ${isSpinning ? "scale-90 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
              Lieu suggéré
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
              {currentLocation ? `"${currentLocation.text}"` : "Réservoir vide..."}
            </h3>
            <div className="inline-block mt-4 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 text-sm text-zinc-300 font-light">
              Style : {currentLocation ? currentLocation.category : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={spinLocation}
        disabled={isSpinning}
        className="w-full max-w-sm py-4 rounded-2xl bg-zinc-100 text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white"
      >
        <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
        Lancer le générateur
      </button>
    </div>
  );
}
