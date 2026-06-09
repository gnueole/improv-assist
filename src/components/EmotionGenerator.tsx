"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { EMOTIONS } from "@/data/mockData";
import { Emotion } from "@/types";

export default function EmotionGenerator() {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(EMOTIONS[0]);
  const [currentIntensity, setCurrentIntensity] = useState<number>(5);
  const [emotionCategory, setEmotionCategory] = useState<string>("All");
  const [isSpinning, setIsSpinning] = useState(false);

  const spinEmotion = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const filtered = emotionCategory === "All" ? EMOTIONS : EMOTIONS.filter(e => e.category === emotionCategory);
    if (filtered.length === 0) return;

    const interval = setInterval(() => {
      const randEmotion = filtered[Math.floor(Math.random() * filtered.length)];
      const randIntensity = Math.floor(Math.random() * 10) + 1; // 1 to 10
      
      setCurrentEmotion(randEmotion);
      setCurrentIntensity(randIntensity);
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
      <div className="irised-border-wrapper w-full max-w-sm aspect-[4/3] flex items-center justify-center shadow-2xl">
        <div className="irised-border-inner flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
          
          <div className={`transition-all duration-300 flex flex-col items-center ${isSpinning ? "scale-90 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            
            {/* Giant Intensity Number */}
            <div className="text-7xl font-black tracking-tight text-white mb-1 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse-slow">
              {currentIntensity}
            </div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block mb-4">
              Niveau d'intensité / 10
            </span>

            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">
              Émotion suggérée
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
              {currentEmotion.text}
            </h3>
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30 text-[11px] text-zinc-300 font-light">
              Style : {currentEmotion.category}
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
