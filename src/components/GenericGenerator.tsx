"use client";

/**
 * @file GenericGenerator.tsx
 * @description Generic generator component that displays card options with spinning animation and random item selection.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState, useEffect } from "react";
import { RefreshCw, Clock, Tag } from "lucide-react";

interface GenericItem {
  id?: string;
  text: string;
  category?: string;
  duration?: string;
  description?: string;
  brief?: string;
}

interface GenericGeneratorProps {
  categoryKey: string;
  title: string;
  pickItem: (category: string, filter?: string) => Promise<any>;
  itemsPool: GenericItem[];
}

export default function GenericGenerator({ categoryKey, title, pickItem, itemsPool }: GenericGeneratorProps) {
  const [currentItem, setCurrentItem] = useState<GenericItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Pick initial item on mount
  useEffect(() => {
    let active = true;
    pickItem(categoryKey).then((initial) => {
      if (active && initial) {
        setCurrentItem(initial);
      }
    });
    return () => {
      active = false;
    };
  }, [categoryKey, pickItem]);

  const spinItem = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;

    const interval = setInterval(() => {
      // visual spin effect using static pool items
      if (itemsPool && itemsPool.length > 0) {
        const randItem = itemsPool[Math.floor(Math.random() * itemsPool.length)];
        setCurrentItem(randItem);
      }
      count++;
    }, 80);

    pickItem(categoryKey)
      .then((finalItem) => {
        const minSpinTime = 10 * 80;
        setTimeout(() => {
          clearInterval(interval);
          setIsSpinning(false);
          setCurrentItem(finalItem || null);
        }, Math.max(0, minSpinTime - count * 80));
      })
      .catch((err) => {
        console.error(err);
        clearInterval(interval);
        setIsSpinning(false);
        setCurrentItem(null);
      });
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
      {/* Title Header */}
      <div className="text-center">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Générateur de {title}
        </h3>
      </div>

      {/* Display Card */}
      <div className="generator-card w-full max-w-sm">
        <div className="generator-card-inner min-h-[200px] flex flex-col justify-center items-center p-6">
          <div className={`transition-all duration-300 flex flex-col items-center text-center w-full ${isSpinning ? "scale-95 blur-sm opacity-50" : "scale-100 opacity-100"}`}>
            
            {/* Tag or Category if available */}
            {currentItem?.category && (
              <div className="inline-flex items-center gap-1 mb-3 px-2.5 py-0.5 rounded-full bg-zinc-800/40 border border-zinc-700/20 text-xs text-zinc-400 font-medium">
                <Tag className="w-3 h-3 text-cyan-400" />
                <span>{currentItem.category}</span>
              </div>
            )}

            {/* Duration for Echauffements */}
            {currentItem?.duration && (
              <div className="inline-flex items-center gap-1 mb-3 px-2.5 py-0.5 rounded-full bg-amber-950/20 border border-amber-900/30 text-xs text-amber-400 font-medium">
                <Clock className="w-3 h-3" />
                <span>Durée : {currentItem.duration}</span>
              </div>
            )}

            {/* Main Item Title */}
            <h4 className="text-2xl font-extrabold tracking-tight text-white mb-1">
              {currentItem ? currentItem.text : "Réservoir vide..."}
            </h4>

            {/* Description or Brief if available */}
            {(currentItem?.description || currentItem?.brief) && (
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mt-2">
                {currentItem.description || currentItem.brief}
              </p>
            )}

          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={spinItem}
        disabled={isSpinning}
        className="w-full max-w-sm py-4 rounded-2xl bg-zinc-100 text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white"
      >
        <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
        Lancer le générateur
      </button>
    </div>
  );
}
