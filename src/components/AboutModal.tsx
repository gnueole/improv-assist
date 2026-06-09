"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-300 animate-fade-in">
      <div className="irised-border-wrapper w-full max-w-sm">
        <div className="irised-border-inner p-6 flex flex-col justify-between items-center text-center">
          {/* Irised Icon Wrapper */}
          <div className="w-12 h-12 rounded-full bg-irised-gradient irised-glow flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          
          <h3 className="text-xl font-bold tracking-wider text-zinc-100 uppercase mb-1">
            improv-assist
          </h3>
          
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium mb-4">
            Version alpha 1
          </span>
          
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Assistant d'improvisation théâtrale minimaliste pour smartphones et tablettes. Conçu pour générer des idées de scènes fluides et rapides.
          </p>
          
          {/* Metadata Block */}
          <div className="w-full border-t border-zinc-800/80 pt-4 mb-6 text-xs text-zinc-400 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Création</span>
              <span className="font-semibold text-zinc-300">Éole Labs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Code Source</span>
              <a 
                href="https://github.com/gnueole/eoleme-infra" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                GitHub
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Communauté</span>
              <a 
                href="https://www.improvisation.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Nous rejoindre
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Copyright</span>
              <span className="text-zinc-300">© {new Date().getFullYear()} Éole Labs</span>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-black text-xs font-semibold active:scale-95 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
