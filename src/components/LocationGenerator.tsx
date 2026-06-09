"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { LOCATIONS } from "@/data/mockData";
import { Location } from "@/types";

export default function LocationGenerator() {
  const [currentLocation, setCurrentLocation] = useState<Location>(LOCATIONS[0]);
  const [locationCategory, setLocationCategory] = useState<string>("All");
  const [isSpinning, setIsSpinning] = useState(false);

  const spinLocation = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const filtered = locationCategory === "All" ? LOCATIONS : LOCATIONS.filter(l => l.category === locationCategory);
    if (filtered.length === 0) return;

    const interval = setInterval(() => {
      const rand = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentLocation(rand);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
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
      <div className="irised-border-wrapper w-full max-w-sm aspect-[4/3] flex items-center justify-center shadow-2xl">
        <div className="irised-border-inner flex flex-col justify-center items-center p-8 text-center relative overflow-hidden">
          <div className={`transition-all duration-300 ${isSpinning ? "scale-90 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block mb-3">
              Lieu suggéré
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
              "{currentLocation.text}"
            </h3>
            <div className="inline-block mt-4 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 text-xs text-zinc-300 font-light">
              Style : {currentLocation.category}
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
