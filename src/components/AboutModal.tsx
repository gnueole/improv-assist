"use client";

/**
 * @file AboutModal.tsx
 * @description Modal dialog overlay displaying app credits, versions, description of PWA capabilities,
 * and developer options (like enabling/disabling Dev Mode).
 */

import React from "react";
import { Sparkles, Instagram } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  devMode: boolean;
  onDevModeChange: (val: boolean) => void;
}

export default function AboutModal({ isOpen, onClose, devMode, onDevModeChange }: AboutModalProps) {
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
            Version beta 1
          </span>
          
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Assistant d'improvisation théâtrale minimaliste pour smartphones et tablettes. Conçu pour générer des idées de scènes fluides et rapides.
          </p>
          
          {/* Metadata Block */}
          <div className="w-full border-t border-zinc-800/80 pt-4 mb-6 text-xs text-zinc-400 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Création</span>
              <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <span>Éole</span>
                <span className="text-zinc-700 font-light">•</span>
                <a 
                  href="https://www.instagram.com/eolewind" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-xs font-semibold"
                >
                  <Instagram className="w-3.5 h-3.5 text-zinc-500" />
                  <span>@eolewind</span>
                </a>
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
                Rejoindre l'EFIT !
              </a>
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
              <span className="text-zinc-500">Copyright</span>
              <span className="text-zinc-300">© {new Date().getFullYear()} Éole</span>
            </div>
            <div className="text-[10px] text-zinc-500 text-center border-t border-zinc-800/80 pt-2.5 mt-1.5 font-light">
              EFIT® est une marque déposée.
            </div>
            <div className="flex justify-between items-center border-t border-zinc-800/80 pt-3 mt-1.5">
              <span className="text-zinc-500">Mode Développeur</span>
              <button
                onClick={() => onDevModeChange(!devMode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  devMode ? "bg-cyan-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    devMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
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
