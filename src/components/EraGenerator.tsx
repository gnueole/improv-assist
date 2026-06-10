"use client";

/**
 * @file EraGenerator.tsx
 * @description Component that presents suggested eras/time periods. Draws prompts from the offline cache,
 * features a card display, and spins/animates during randomization.
 */

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { ERAS } from "@/data/mockData";
import { Era } from "@/types";

interface EraGeneratorProps {
  pickItem: (category: "emotions" | "locations" | "eras", filter?: string) => Era | null;
}

export default function EraGenerator({ pickItem }: EraGeneratorProps) {
  const [currentEra, setCurrentEra] = useState<Era | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Piocher une époque initiale au montage
  useEffect(() => {
    const initial = pickItem("eras");
    if (initial) {
      setCurrentEra(initial);
    }
  }, []);

  const spinEra = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = ERAS[Math.floor(Math.random() * ERAS.length)];
      setCurrentEra(rand);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalEra = pickItem("eras");
        if (finalEra) {
          setCurrentEra(finalEra);
        } else {
          setCurrentEra(null);
        }
      }
    }, 70);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Visual top accent spacing */}
      <div className="w-full max-w-[200px] border-b border-zinc-800/80 mb-2"></div>

      {/* Display Box */}
      <div className="generator-card">
        <div className="generator-card-inner">
          <div className={`transition-all duration-300 ${isSpinning ? "scale-90 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
              Époque suggérée
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
              {currentEra ? currentEra.text : "Réservoir vide..."}
            </h3>
            <div className="inline-block mt-4 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 text-sm text-zinc-300 font-light">
              Classification : {currentEra ? currentEra.era : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={spinEra}
        disabled={isSpinning}
        className="w-full max-w-sm py-4 rounded-2xl bg-zinc-100 text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white"
      >
        <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
        Lancer le générateur
      </button>
    </div>
  );
}
