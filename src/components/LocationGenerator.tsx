"use client";

/**
 * @file LocationGenerator.tsx
 * @description Component that presents suggested theatrical locations/settings. Supports category filtering,
 * has an irised border layout, and displays spinning animations during selection.
 */

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { LOCATIONS } from "@/data/mockData";
import { Location } from "@/types";

interface LocationGeneratorProps {
  pickItem: (category: "emotions" | "locations" | "eras", filter?: string) => Location | null;
}

export default function LocationGenerator({ pickItem }: LocationGeneratorProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationCategory, setLocationCategory] = useState<string>("All");
  const [isSpinning, setIsSpinning] = useState(false);

  // Piocher un lieu initial au montage
  useEffect(() => {
    const initial = pickItem("locations", locationCategory);
    if (initial) {
      setCurrentLocation(initial);
    }
  }, []);

  const spinLocation = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;

    const interval = setInterval(() => {
      const rand = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      setCurrentLocation(rand);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalLocation = pickItem("locations", locationCategory);
        if (finalLocation) {
          setCurrentLocation(finalLocation);
        } else {
          setCurrentLocation(null);
        }
      }
    }, 70);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Category Filter */}
      <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800/80 rounded-full text-xs z-10">
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

      {/* Display Box */}
      <div className="generator-card">
        <div className="generator-card-inner">
          <div className={`transition-all duration-300 ${isSpinning ? "scale-90 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block mb-3">
              Lieu suggéré
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
              {currentLocation ? `"${currentLocation.text}"` : "Réservoir vide..."}
            </h3>
            <div className="inline-block mt-4 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 text-xs text-zinc-300 font-light">
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
