"use client";

import React, { useState, useEffect, useRef } from "react";
import { Fingerprint } from "lucide-react";
import { PRESET_COLORS } from "@/data/mockData";
import { TouchPoint } from "@/types";

interface WhoStartsProps {
  onBack: () => void;
}

export default function WhoStarts({ onBack }: WhoStartsProps) {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [touchWinner, setTouchWinner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  const touchAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track touches with a ref to avoid stale closures in setTimeout
  const touchesRef = useRef<TouchPoint[]>([]);
  useEffect(() => {
    touchesRef.current = touches;
  }, [touches]);

  const resetTouchSelector = () => {
    setTouches([]);
    setTouchWinner(null);
    setCountdown(null);
    setIsCountingDown(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Countdown and winner logic trigger
  useEffect(() => {
    if (touches.length >= 2 && !isCountingDown && !touchWinner) {
      setIsCountingDown(true);
      setCountdown(3);

      let currentCount = 3;
      countdownIntervalRef.current = setInterval(() => {
        currentCount--;
        if (currentCount > 0) {
          setCountdown(currentCount);
        } else {
          setCountdown(null);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      timerRef.current = setTimeout(() => {
        const latestTouches = touchesRef.current;
        if (latestTouches.length > 0) {
          const winnerIdx = Math.floor(Math.random() * latestTouches.length);
          setTouchWinner(latestTouches[winnerIdx].id);
        }
        setIsCountingDown(false);
      }, 3000);
    } 
    
    if (touches.length < 2 && (isCountingDown || countdown !== null) && !touchWinner) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setIsCountingDown(false);
      setCountdown(null);
    }
  }, [touches, isCountingDown, touchWinner, countdown]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchWinner) return;

    const rect = touchAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newTouches: TouchPoint[] = [];
    for (let i = 0; i < e.targetTouches.length; i++) {
      const t = e.targetTouches[i];
      const existing = touches.find(x => x.id === t.identifier.toString());
      if (existing) {
        newTouches.push(existing);
      } else {
        newTouches.push({
          id: t.identifier.toString(),
          x: t.clientX - rect.left,
          y: t.clientY - rect.top,
          color: PRESET_COLORS[touches.length % PRESET_COLORS.length]
        });
      }
    }
    setTouches(newTouches);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchWinner) return;

    const rect = touchAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const updatedTouches = touches.map(t => {
      const matchingTouch = Array.from(e.targetTouches).find(x => x.identifier.toString() === t.id);
      if (matchingTouch) {
        return {
          ...t,
          x: matchingTouch.clientX - rect.left,
          y: matchingTouch.clientY - rect.top
        };
      }
      return t;
    });
    setTouches(updatedTouches);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchWinner) return;

    const remainingIds = Array.from(e.targetTouches).map(x => x.identifier.toString());
    setTouches(prev => prev.filter(t => remainingIds.includes(t.id)));
  };

  // Click handler for desktop testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (touchWinner) return;
    const rect = touchAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const existingIndex = touches.findIndex(t => Math.hypot(t.x - x, t.y - y) < 30);
    if (existingIndex !== -1) {
      setTouches(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      if (touches.length >= 5) return; // Limit players
      setTouches(prev => [
        ...prev,
        {
          id: `virtual_${Date.now()}_${Math.random()}`,
          x,
          y,
          color: PRESET_COLORS[prev.length % PRESET_COLORS.length]
        }
      ]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center gap-4">
      {/* Instructions */}
      <div className="text-center max-w-xs px-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {touches.length === 0 
            ? "📱 Mobile : Posez plusieurs doigts sur l'écran.\n💻 PC : Cliquez à différents endroits pour ajouter des joueurs virtuels."
            : `${touches.length} joueur${touches.length > 1 ? "s" : ""} active${touches.length > 1 ? "s" : ""}`}
        </p>
        
        {countdown !== null && (
          <div className="text-5xl font-black text-white mt-4 animate-ping">
            {countdown}
          </div>
        )}
        
        {touchWinner && (
          <div className="mt-2 text-sm font-semibold text-emerald-400 animate-pulse">
            🏆 Le joueur en surbrillance commence !
          </div>
        )}
      </div>

      {/* Canvas */}
      <div 
        ref={touchAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className="w-full flex-1 max-h-[380px] min-h-[300px] border border-zinc-800/80 rounded-3xl bg-zinc-950/70 relative overflow-hidden cursor-crosshair select-none touch-none"
      >
        {touches.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-650 gap-3 pointer-events-none p-6 text-center">
            <Fingerprint className="w-12 h-12 stroke-[1] text-zinc-700 animate-pulse" />
            <span className="text-sm">Zone multi-touch interactive</span>
          </div>
        )}

        {/* Display finger contacts */}
        {touches.map((t) => {
          const isWinner = touchWinner === t.id;
          const isLoser = touchWinner !== null && touchWinner !== t.id;
          return (
            <div
              key={t.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ 
                left: t.x, 
                top: t.y,
                opacity: isLoser ? 0.15 : 1,
                scale: isWinner ? 1.4 : 1
              }}
            >
              {/* Interactive pulse */}
              <div 
                className="absolute -inset-4 rounded-full touch-pulse"
                style={{ border: `2px solid ${t.color}` }}
              />
              
              {/* Core Dot */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-black border-2 border-black/50 shadow-lg ${
                  isWinner ? "animate-bounce" : ""
                }`}
                style={{ backgroundColor: t.color }}
              >
                {isWinner ? "👑" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset & Simulation Toggles */}
      <div className="w-full max-w-sm flex gap-3">
        <button
          onClick={resetTouchSelector}
          className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all text-sm font-semibold text-zinc-300 text-center"
        >
          Réinitialiser
        </button>

        {touches.length >= 2 && !isCountingDown && !touchWinner && (
          <button
            onClick={() => {
              setIsCountingDown(true);
              setCountdown(3);
              let currentCount = 3;
              const interval = setInterval(() => {
                currentCount--;
                if (currentCount > 0) setCountdown(currentCount);
                else {
                  setCountdown(null);
                  clearInterval(interval);
                }
              }, 1000);
              setTimeout(() => {
                const latestTouches = touchesRef.current;
                if (latestTouches.length > 0) {
                  const winnerIdx = Math.floor(Math.random() * latestTouches.length);
                  setTouchWinner(latestTouches[winnerIdx].id);
                }
                setIsCountingDown(false);
              }, 3000);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-white text-black active:scale-95 transition-all text-sm font-bold text-center"
          >
            Tirer au sort !
          </button>
        )}
      </div>
    </div>
  );
}
