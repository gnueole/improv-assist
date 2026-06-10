"use client";

/**
 * @file EmotionGenerator.tsx
 * @description Component that presents suggested emotions/mindsets to portray. Features a randomized
 * intensity indicator (1-10), category filtering, and spinning animation behavior.
 */

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { EMOTIONS } from "@/data/mockData";
import { Emotion } from "@/types";

interface EmotionGeneratorProps {
  pickItem: (category: "emotions" | "locations" | "eras", filter?: string) => Emotion | null;
}

export default function EmotionGenerator({ pickItem }: EmotionGeneratorProps) {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [currentIntensity, setCurrentIntensity] = useState<number>(5);
  const [emotionCategory, setEmotionCategory] = useState<string>("All");
  const [isSpinning, setIsSpinning] = useState(false);

  // Piocher une émotion initiale au montage
  useEffect(() => {
    const initial = pickItem("emotions", emotionCategory);
    if (initial) {
      setCurrentEmotion(initial);
      setCurrentIntensity(Math.floor(Math.random() * 10) + 1);
    }
  }, []);

  const spinEmotion = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;

    const interval = setInterval(() => {
      // Pour l'effet visuel de défilement, on pioche au hasard dans les données statiques
      const randEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      const randIntensity = Math.floor(Math.random() * 10) + 1;
      
      setCurrentEmotion(randEmotion);
      setCurrentIntensity(randIntensity);
      count++;

      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        // On atterrit sur la vraie valeur piochée et retirée du réservoir local
        const finalEmotion = pickItem("emotions", emotionCategory);
        if (finalEmotion) {
          setCurrentEmotion(finalEmotion);
          setCurrentIntensity(Math.floor(Math.random() * 10) + 1);
        } else {
          setCurrentEmotion(null);
        }
      }
    }, 70);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Category Filter */}
      <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800/80 rounded-full text-sm z-10">
        {["All", "Positive", "Négative", "Neutre"].map((cat) => (
          <button
            key={cat}
            onClick={() => setEmotionCategory(cat)}
            className={`px-3 py-1 rounded-full transition-all ${
              emotionCategory === cat ? "bg-zinc-800 text-white font-medium shadow-md shadow-black/50" : "text-zinc-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Display Card */}
      <div className="generator-card">
        <div className="generator-card-inner">
          
          <div className={`transition-all duration-300 flex flex-col items-center ${isSpinning ? "scale-90 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            
            {/* Giant Intensity Number */}
            <div className="text-7.5xl font-black tracking-tight text-white mb-1 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse-slow">
              {currentIntensity}
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-4">
              Niveau d'intensité / 10
            </span>

            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-1">
              Émotion suggérée
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
              {currentEmotion ? currentEmotion.text : "Réservoir vide..."}
            </h3>
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 text-xs text-zinc-300 font-light">
              Style : {currentEmotion ? currentEmotion.category : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={spinEmotion}
        disabled={isSpinning}
        className="w-full max-w-sm py-4 rounded-2xl bg-zinc-100 text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white"
      >
        <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
        Lancer le générateur
      </button>
    </div>
  );
}
