"use client";

/**
 * @file AboutModal.tsx
 * @description Modal dialog overlay displaying app credits, versions, description of PWA capabilities,
 * and developer options (like enabling/disabling Dev Mode).
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState } from "react";
import { Sparkles, Instagram } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  devMode: boolean;
  onDevModeChange: (val: boolean) => void;
  onOpenPrivacy: () => void;
}

export default function AboutModal({ isOpen, onClose, devMode, onDevModeChange, onOpenPrivacy }: AboutModalProps) {
  const [isRinging, setIsRinging] = useState(false);

  if (!isOpen) return null;

  // Easter Egg: Play the "Dring" sound when clicking the sparkles icon
  const playDring = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscStrike = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      
      const gongGain = ctx.createGain();
      const lfoGain = ctx.createGain();
      const masterGain = ctx.createGain();

      // Vintage telephone frequencies (minor third + metallic strike)
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(698, ctx.currentTime); // F5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(830, ctx.currentTime); // Ab5

      oscStrike.type = "triangle";
      oscStrike.frequency.setValueAtTime(1396, ctx.currentTime); // Higher harmonic for metallic clank

      // Modulate the gong gain with a 16Hz square LFO to simulate the clapper trill
      lfo.type = "square";
      lfo.frequency.setValueAtTime(16, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);
      
      gongGain.gain.setValueAtTime(0.5, ctx.currentTime);

      // Connect LFO modulation
      lfo.connect(lfoGain);
      lfoGain.connect(gongGain.gain);

      // Connect oscillators to gong gain
      osc1.connect(gongGain);
      osc2.connect(gongGain);
      
      // Let the metallic strike be slightly lower and also modulated
      const strikeGain = ctx.createGain();
      strikeGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscStrike.connect(strikeGain);
      strikeGain.connect(gongGain);

      // Master volume and envelope (Two rings: 1.2s ring, 0.8s pause, 1.2s ring)
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      
      // Ring 1
      masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      masterGain.gain.setValueAtTime(0.25, ctx.currentTime + 1.05);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      // Pause
      masterGain.gain.setValueAtTime(0, ctx.currentTime + 1.25);
      
      // Ring 2
      masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2.05);
      masterGain.gain.setValueAtTime(0.25, ctx.currentTime + 3.05);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.2);

      gongGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start all nodes
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      oscStrike.start(ctx.currentTime);
      lfo.start(ctx.currentTime);

      // Stop all nodes
      osc1.stop(ctx.currentTime + 3.2);
      osc2.stop(ctx.currentTime + 3.2);
      oscStrike.stop(ctx.currentTime + 3.2);
      lfo.stop(ctx.currentTime + 3.2);

      // Close context after playback completes to release resources
      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 3500);
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  };

  const handleIconClick = () => {
    if (isRinging) return;
    setIsRinging(true);
    playDring();
    setTimeout(() => {
      setIsRinging(false);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-300 animate-fade-in">
      {isRinging && (
        <style>{`
          @keyframes dringPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
          .animate-dring {
            animation: dringPulse 0.15s infinite ease-in-out;
          }
        `}</style>
      )}
      <div className="irised-border-wrapper w-full max-w-sm">
        <div className="irised-border-inner p-6 flex flex-col justify-between items-center text-center">
          {/* Irised Icon Wrapper */}
          <button
            onClick={handleIconClick}
            className={`w-12 h-12 rounded-full bg-irised-gradient irised-glow flex items-center justify-center mb-4 active:scale-95 transition-all outline-none ${isRinging ? "animate-dring" : ""
              }`}
            title="Easter Egg !"
          >
            <Sparkles className="w-6 h-6 text-black" />
          </button>

          <h3 className="text-xl font-bold tracking-wider text-zinc-100 uppercase mb-1">
            Houba Houba !
          </h3>

          <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium mb-4">
            Version 0.5 BETA
          </span>

          <p className="text-sm text-zinc-300 leading-relaxed mb-6">
            Houba Houba ! est le compagnon de scène ultime pour les comédiens d'improvisation théâtrale. Conçu pour générer des idées de scènes fluides et rapides.
          </p>

          {/* Metadata Block */}
          <div className="w-full pt-2 mb-6 text-sm text-zinc-300 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Création</span>
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <a
                  href="https://www.instagram.com/eolewind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-sm font-semibold"
                >
                  <Instagram className="w-3.5 h-3.5 text-zinc-500" />
                  <span>@eolewind</span>
                </a>
                <span className="text-zinc-700 font-light">•</span>
                <span>Éole</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Communauté</span>
              <a
                href="https://www.improvisation.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Improvisation.org
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Code Source</span>
              <a
                href="https://github.com/gnueole/improv-assist"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                GitHub
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Copyright</span>
              <span className="text-zinc-300">© {new Date().getFullYear()} Éole</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Confidentialité</span>
              <button
                onClick={onOpenPrivacy}
                className="font-semibold text-cyan-400 hover:underline flex items-center gap-1 active:scale-95 transition-transform"
              >
                Politique & RGPD
              </button>
            </div>
            <div className="text-xs text-zinc-400 text-center pt-2 mt-1.5 font-light">
              Moteur d'improvisation théâtrale.
            </div>
            <div className="flex justify-between items-center pt-2 mt-1.5">
              <span className="text-zinc-500">Mode Développeur</span>
              <button
                onClick={() => onDevModeChange(!devMode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${devMode ? "bg-cyan-500" : "bg-zinc-800"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${devMode ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-black text-sm font-semibold active:scale-95 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
