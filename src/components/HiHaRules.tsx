"use client";

/**
 * @file HiHaRules.tsx
 * @description View showing the collective rules/signs of EFIT® "Hi Ha" warming and reflex game.
 * Features lists of command phrases and corresponding actions.
 */

import React from "react";
import { ChevronLeft } from "lucide-react";

interface HiHaRulesProps {
  onBack: () => void;
}

export default function HiHaRules({ onBack }: HiHaRulesProps) {
  const rules = [
    { name: "Hi Ha", detail: "" },
    { name: "Hold-On", detail: "" },
    { name: "Ha HI", detail: "" },
    { name: "Peter... Pan", detail: "" },
    { name: "Hip hip hip... Hourra", detail: "" },
    { name: "Pop Corn", detail: "" },
    { name: "Zap", detail: "" },
    { name: "Je laisse, je prends", detail: "" },
    { name: "Vade Retro", note: "Sa.. Ta... Nas => Je brûle" },
    { name: "Honki Tonk", note: "Houba Houba => Dring" }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between items-center gap-6 overflow-y-auto pb-4 max-h-[80vh] w-full">
      <div className="w-full flex flex-col gap-2.5">
        {rules.map((rule, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xs font-bold font-mono">
                {idx + 1}
              </span>
              <span className="font-bold text-sm text-zinc-100 tracking-wide">
                {rule.name}
              </span>
            </div>
            {rule.note && (
              <span className="text-[10px] text-zinc-500 font-medium px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-900">
                {rule.note}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-2 mb-4 flex flex-col gap-1">
        <p className="text-[11px] text-zinc-500 italic">
          Description des gestes à venir...
        </p>
        <p className="text-[9px] text-zinc-600 font-light">
          EFIT® est une marque déposée.
        </p>
      </div>

      <button
        onClick={onBack}
        className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 hover:text-white hover:bg-zinc-800/50 mt-auto"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au menu
      </button>
    </div>
  );
}
