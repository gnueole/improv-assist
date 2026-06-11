"use client";

/**
 * @file CharacterGenerator.tsx
 * @description Dedicated character generator component. Displays character archetypes with details: age, suggested accessory, and body gesture.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-12
 * @license MIT
 */

import React, { useState, useEffect, useContext, useCallback } from "react";
import { RefreshCw, User, Glasses, Accessibility } from "lucide-react";
import { ImprovBufferContext } from "@/context/ImprovBufferContext";
import { Character } from "@/types";

interface CharacterGeneratorProps {
  pickItem: (category: string, filter?: string) => Promise<any>;
  itemsPool: Character[];
}

export default function CharacterGenerator({ pickItem, itemsPool }: CharacterGeneratorProps) {
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const context = useContext(ImprovBufferContext);
  const devMode = context?.devMode ?? false;
  const remainingCount = context?.buffer?.characters?.length ?? 0;

  // Pick initial item on mount
  useEffect(() => {
    let active = true;
    pickItem("characters").then((initial) => {
      if (active && initial) {
        setCurrentCharacter(initial);
      }
    });
    return () => {
      active = false;
    };
  }, [pickItem]);

  const spinCharacter = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;

    const interval = setInterval(() => {
      if (itemsPool && itemsPool.length > 0) {
        const randItem = itemsPool[Math.floor(Math.random() * itemsPool.length)];
        setCurrentCharacter(randItem);
      }
      count++;
    }, 80);

    pickItem("characters")
      .then((finalItem) => {
        const minSpinTime = 10 * 80;
        setTimeout(() => {
          clearInterval(interval);
          setIsSpinning(false);
          setCurrentCharacter(finalItem || null);
        }, Math.max(0, minSpinTime - count * 80));
      })
      .catch((err) => {
        console.error(err);
        clearInterval(interval);
        setIsSpinning(false);
        setCurrentCharacter(null);
      });
  }, [isSpinning, itemsPool, pickItem]);

  // Keyboard shortcut listener (Space/Enter to trigger generation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        spinCharacter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [spinCharacter]);

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
      {/* Title Header */}
      <div className="text-center">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Générateur de Personnages
        </h3>
      </div>

      {devMode && (
        <span className="text-[10px] font-mono text-zinc-500 lowercase select-none animate-fade-in -mt-2 -mb-2">
          ({remainingCount} suggestions restantes)
        </span>
      )}

      {/* Display Card */}
      <div className="generator-card w-full max-w-sm">
        <div className="generator-card-inner min-h-[220px] flex flex-col justify-center items-center p-6">
          <div className={`transition-all duration-300 flex flex-col items-center text-center w-full ${isSpinning ? "scale-95 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            
            {/* Main Character Archetype */}
            <h4 className="text-2xl font-extrabold tracking-tight text-white mb-5">
              {currentCharacter ? currentCharacter.text : "Réservoir vide..."}
            </h4>

            {currentCharacter && (
              <div className="w-full flex flex-col gap-3 text-left border-t border-zinc-800/40 pt-4">
                
                {/* Age Attribute */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Âge suggéré</span>
                    <span className="text-sm text-zinc-300 font-medium">{currentCharacter.age}</span>
                  </div>
                </div>

                {/* Accessory Attribute */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Glasses className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Accessoire suggéré</span>
                    <span className="text-sm text-zinc-300 font-medium">{currentCharacter.accessory}</span>
                  </div>
                </div>

                {/* Gesture Attribute */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Accessibility className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Attitude corporelle / Tic</span>
                    <span className="text-sm text-zinc-300 font-medium leading-relaxed">{currentCharacter.gesture}</span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={spinCharacter}
        disabled={isSpinning}
        className="w-full max-w-sm py-4 rounded-2xl bg-zinc-100 text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white"
      >
        <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
        Lancer le générateur
      </button>
    </div>
  );
}
