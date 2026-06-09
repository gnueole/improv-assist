"use client";

import React, { useState } from "react";
import { 
  Smile, 
  Fingerprint, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Sparkles, 
  Info,
  Hourglass,
  BookOpen
} from "lucide-react";

import { Tile } from "@/types";
import AboutModal from "@/components/AboutModal";
import EmotionGenerator from "@/components/EmotionGenerator";
import WhoStarts from "@/components/WhoStarts";
import LocationGenerator from "@/components/LocationGenerator";
import EraGenerator from "@/components/EraGenerator";
import ImprovTimer from "@/components/ImprovTimer";
import DocsView from "@/components/DocsView";

export default function Dashboard() {
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered on scope:", reg.scope))
          .catch((err) => console.error("Service Worker registration failed:", err));
      });
    }
  }, []);

  const tiles: Tile[] = [
    { id: "emotions", title: "Générateur d'Émotions", subtitle: "Sensation à incarner", icon: Smile, color: "from-cyan-400 to-purple-500" },
    { id: "who_starts", title: "Qui Commence ?", subtitle: "Tirage multi-touch", icon: Fingerprint, color: "from-purple-500 to-pink-500" },
    { id: "locations", title: "Suggestion de Lieu", subtitle: "Cadre de l'impro", icon: MapPin, color: "from-pink-500 to-yellow-400" },
    { id: "eras", title: "Suggestion d'Époque", subtitle: "Temporalité de la scène", icon: Clock, color: "from-yellow-400 to-cyan-400" },
    { id: "timer", title: "Timer de Scène", subtitle: "Lancer l'impro (2m30s)", icon: Hourglass, color: "from-cyan-400 to-pink-500" },
    { id: "docs", title: "Contraintes & Docs", subtitle: "Aide & règles d'impro", icon: BookOpen, color: "from-purple-500 to-cyan-400" }
  ];

  const activeTile = tiles.find(t => t.id === activeTileId);

  return (
    <main className="relative h-full w-full overflow-hidden bg-black flex flex-col justify-between">
      
      {/* 1. Main Dashboard Mode */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-6 pb-8 transition-all duration-500 ease-out z-10 ${
          activeTileId !== null ? "opacity-0 scale-95 pointer-events-none translate-y-4" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between pt-safe">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-irised-gradient irised-glow animate-pulse-slow flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h1 className="font-bold tracking-[0.15em] text-lg uppercase bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
              improv-assist
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="À propos"
            >
              <Info className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
              alpha 1
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="my-auto py-4 text-center max-w-sm mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Prêt pour l'impro ?
          </h2>
          <p className="text-zinc-500 text-sm">
            Choisissez un outil pour propulser votre prochaine scène théâtrale.
          </p>
        </section>

        {/* Dashboard Tile Grid */}
        <section className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full mb-auto">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => setActiveTileId(tile.id)}
                className="irised-border-wrapper group active:scale-[0.97] focus:outline-none w-full text-left"
              >
                <div className="irised-border-inner p-5 flex flex-col justify-between min-h-[145px]">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100 tracking-wide line-clamp-1">
                      {tile.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 font-light line-clamp-1">
                      {tile.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="text-center text-[10px] text-zinc-600 tracking-wider pt-4 flex flex-col gap-1 items-center">
          <div>IMPROV-ASSIST • MOBILE LAB</div>
          <div className="text-[9px] text-zinc-700 font-light flex items-center gap-1.5 flex-wrap justify-center">
            <span>© {new Date().getFullYear()} Éole Labs</span>
            <span>•</span>
            <a 
              href="https://github.com/gnueole/eoleme-infra" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline hover:text-zinc-500 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a 
              href="https://www.improvisation.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline hover:text-zinc-500 transition-colors"
            >
              Nous rejoindre
            </a>
          </div>
        </footer>
      </div>

      {/* 2. Fullscreen Detail Views */}
      <div 
        className={`absolute inset-0 bg-black flex flex-col justify-between p-6 pb-8 transition-all duration-500 ease-in-out z-20 ${
          activeTileId === null ? "opacity-0 scale-105 pointer-events-none translate-y-4" : "opacity-100 scale-100"
        }`}
      >
        {/* Detail Header */}
        <header className="flex items-center justify-between pt-safe">
          <button 
            onClick={() => setActiveTileId(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-all text-xs z-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 z-30">
            {activeTile?.title}
          </h2>

          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center z-30">
            {activeTile && React.createElement(activeTile.icon, { className: "w-4 h-4 text-zinc-300" })}
          </div>
        </header>

        {/* Central Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center my-6 max-w-md mx-auto w-full relative">
          {activeTileId === "emotions" && <EmotionGenerator />}
          {activeTileId === "who_starts" && <WhoStarts onBack={() => setActiveTileId(null)} />}
          {activeTileId === "locations" && <LocationGenerator />}
          {activeTileId === "eras" && <EraGenerator />}
          {activeTileId === "timer" && <ImprovTimer />}
          {activeTileId === "docs" && <DocsView />}
        </div>

        {/* Detail Footer */}
        <footer className="text-center text-[9px] text-zinc-700 tracking-wider">
          IMPROV-ASSIST • CONSOLE D'OUTILS
        </footer>
      </div>

      {/* 3. About Modal Overlay */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

    </main>
  );
}
