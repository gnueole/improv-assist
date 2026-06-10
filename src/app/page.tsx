"use client";

/**
 * @file page.tsx
 * @description Main app orchestrator / home dashboard page. Features a balanced 10-item grid of tiles, 
 * handles active tile navigation, virtual history states, and mounts generator components.
 */

import React, { useState, useEffect } from "react";
import {
  Smile,
  Fingerprint,
  MapPin,
  Clock,
  ChevronLeft,
  Sparkles,
  Info,
  Hourglass,
  BookOpen,
  Zap,
  HelpCircle,
  Terminal,
  RotateCw
} from "lucide-react";

import { Tile } from "@/types";
import { useImprovBuffer } from "@/hooks/useImprovBuffer";
import AboutModal from "@/components/AboutModal";
import PromptModal from "@/components/PromptModal";
import LoaderOverlay from "@/components/LoaderOverlay";
import ToastAlert from "@/components/ToastAlert";

import EmotionGenerator from "@/components/EmotionGenerator";
import WhoStarts from "@/components/WhoStarts";
import LocationGenerator from "@/components/LocationGenerator";
import EraGenerator from "@/components/EraGenerator";
import ImprovTimer from "@/components/ImprovTimer";
import DocsView from "@/components/DocsView";
import ConstraintsView from "@/components/ConstraintsView";
import HiHaRules from "@/components/HiHaRules";
import GenericGenerator from "@/components/GenericGenerator";

import reservoirPool from "../../public/data/reservoir-config.json";

const SYSTEM_PROMPT = `Tu es un assistant d'improvisation théâtrale. 
Génère un fichier JSON structuré contenant les listes suivantes pour alimenter les générateurs d'impro :

1. "emotions" : 20 suggestions d'émotions/états d'esprit avec leur catégorie (Positive, Négative, Neutre).
Chaque objet doit être au format : { "text": string, "category": "Positive" | "Négative" | "Neutre" }

2. "locations" : 20 suggestions de lieux propices au jeu dramatique ou comique, classés par catégorie (Huis clos, Quotidien, Aventure, Insolite).
Chaque objet doit être au format : { "text": string, "category": "Huis clos" | "Quotidien" | "Aventure" | "Insolite" }

3. "eras" : 20 suggestions de périodes temporelles ou époques inspirantes, classées par géographie/époque (Passé, Présent, Futur).
Chaque objet doit être au format : { "text": string, "era": "Passé" | "Présent" | "Futur" }

4. "themes" : 20 suggestions de thèmes d'improvisation (sujets courts).
Chaque objet doit être au format : { "text": string, "category": string }

5. "scenarios" : 20 suggestions de situations de départ ou d'intrigues dramatiques/comiques.
Chaque objet doit être au format : { "text": string, "category": string }`;

export default function Dashboard() {
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  // Expose functions & state from hook
  const {
    isRegenerating,
    isReloading,
    devMode,
    toastMessage,
    triggerRegen,
    pickItem,
    handleDevModeChange,
    n8nStatus,
    n8nError
  } = useImprovBuffer(activeTileId);

  // Symmetrical layout with 10 items grid (2 columns on mobile, 3 columns on desktop)
  const tiles: Tile[] = [
    { id: "emotions", title: "Générateur d'Émotions", subtitle: "Sensation à incarner", icon: Smile, color: "from-cyan-400 to-purple-500" },
    { id: "who_starts", title: "Qui Commence ?", subtitle: "Tirage multi-touch", icon: Fingerprint, color: "from-purple-500 to-pink-500" },
    { id: "themes", title: "Thèmes d'Impro", subtitle: "Sujets & idées d'histoires", icon: Sparkles, color: "from-indigo-400 to-cyan-400" },
    { id: "scenarios", title: "Scénarios", subtitle: "Situations de départ", icon: BookOpen, color: "from-yellow-400 to-green-500" },
    { id: "locations", title: "Suggestion de Lieu", subtitle: "Cadre de l'impro", icon: MapPin, color: "from-pink-500 to-yellow-400" },
    { id: "eras", title: "Suggestion d'Époque", subtitle: "Temporalité de la scène", icon: Clock, color: "from-yellow-400 to-cyan-400" },
    { id: "timer", title: "Timer de Scène", subtitle: "Lancer l'impro (2m30s)", icon: Hourglass, color: "from-cyan-400 to-pink-500" },
    { id: "constraints", title: "Contraintes d'Impro", subtitle: "Explorer les contraintes", icon: BookOpen, color: "from-purple-500 to-cyan-400" },
    { id: "docs", title: "Aide & Guide", subtitle: "Conseils & PWA hors-ligne", icon: HelpCircle, color: "from-pink-500 to-yellow-400" },
    { id: "hiha", title: "Règles du Hi Ha", subtitle: "Signes & réflexes collectifs", icon: Zap, color: "from-amber-500 to-orange-600" }
  ];

  const activeTile = tiles.find(t => t.id === activeTileId);

  // Tile Selection History Navigation
  const handleSelectTile = (id: string) => {
    setActiveTileId(id);
    window.history.pushState({
      activeTileId: id,
      isAboutOpen: false,
      isPromptOpen: false,
      isRegenerating: false
    }, "", `/${id}`);
  };

  // Modals History Open/Close Actions
  const openAbout = () => {
    setIsAboutOpen(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: true,
      isPromptOpen: false,
      isRegenerating: false
    }, "", activeTileId ? `/${activeTileId}` : "/");
  };

  const closeAbout = () => {
    if (window.history.state?.isAboutOpen) {
      window.history.back();
    } else {
      setIsAboutOpen(false);
    }
  };

  const openPrompt = () => {
    setIsPromptOpen(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: false,
      isPromptOpen: true,
      isRegenerating: false
    }, "", activeTileId ? `/${activeTileId}` : "/");
  };

  const closePrompt = () => {
    if (window.history.state?.isPromptOpen) {
      window.history.back();
    } else {
      setIsPromptOpen(false);
    }
  };

  const handleBackToDashboard = () => {
    if (window.history.state === null || window.history.state?.activeTileId === undefined) {
      setActiveTileId(null);
      window.history.pushState({
        activeTileId: null,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", "/");
    } else {
      window.history.back();
    }
  };

  // Handle browser back swipe/button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state === "object") {
        setActiveTileId(state.activeTileId !== undefined ? state.activeTileId : null);
        setIsAboutOpen(!!state.isAboutOpen);
        setIsPromptOpen(!!state.isPromptOpen);
      } else {
        const path = window.location.pathname.replace(/^\//, "");
        const validTileIds = ["emotions", "who_starts", "themes", "scenarios", "locations", "eras", "timer", "constraints", "docs", "hiha"];
        setActiveTileId(validTileIds.includes(path) ? path : null);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Initial load pathname detection
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, "");
    const validTileIds = ["emotions", "who_starts", "themes", "scenarios", "locations", "eras", "timer", "constraints", "docs", "hiha"];
    if (validTileIds.includes(path)) {
      setActiveTileId(path);
      window.history.replaceState({
        activeTileId: path,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", `/${path}`);
    }
  }, []);

  // Service Worker Registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered on scope:", reg.scope))
          .catch((err) => console.error("Service Worker registration failed:", err));
      });
    }
  }, []);

  const renderActiveComponent = () => {
    switch (activeTileId) {
      case "emotions":
        return <EmotionGenerator pickItem={pickItem} />;
      case "who_starts":
        return <WhoStarts onBack={handleBackToDashboard} />;
      case "themes":
        return (
          <GenericGenerator
            categoryKey="themes"
            title="Thèmes"
            pickItem={pickItem}
            itemsPool={reservoirPool.themes || []}
          />
        );
      case "scenarios":
        return (
          <GenericGenerator
            categoryKey="scenarios"
            title="Scénarios"
            pickItem={pickItem}
            itemsPool={reservoirPool.scenarios || []}
          />
        );
      case "locations":
        return <LocationGenerator pickItem={pickItem} />;
      case "eras":
        return <EraGenerator pickItem={pickItem} />;
      case "timer":
        return <ImprovTimer />;
      case "constraints":
        return <ConstraintsView />;
      case "docs":
        return <DocsView />;
      case "hiha":
        return <HiHaRules />;
      default:
        return null;
    }
  };

  return (
    <main className="relative h-full w-full overflow-hidden bg-black flex flex-col justify-between">
      
      {/* Toast Alert */}
      <ToastAlert message={toastMessage} />

      {/* 1. Main Dashboard Mode */}
      <div
        className={`dashboard-container transition-all duration-500 ease-out z-10 ${
          activeTileId !== null ? "opacity-0 scale-95 pointer-events-none translate-y-4" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <header className="dashboard-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-irised-gradient irised-glow animate-pulse-slow flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h1 className="font-bold tracking-[0.15em] text-lg uppercase bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
              Houba Houba !
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Light */}
            <div
              className={`status-light ${n8nStatus}`}
              title={n8nStatus === "red" ? `Erreur n8n : ${n8nError}` : "Connexion n8n opérationnelle"}
            />
            <button
              onClick={() => triggerRegen(false)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="Régénérer le réservoir"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={openAbout}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="À propos"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="dashboard-hero">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Prêt pour l'impro ?
          </h2>
          <p className="text-zinc-500 text-sm">
            Choisissez un outil pour propulser votre prochaine scène théâtrale.
          </p>
        </section>

        {/* Dashboard Tile Grid */}
        <section className="grid grid-cols-2 gap-3 w-full max-w-md md:max-w-sm mx-auto px-0.5 landscape:my-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => handleSelectTile(tile.id)}
                className="dashboard-tile aspect-square"
              >
                <div className="dashboard-tile-inner">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2.5 shrink-0">
                    <Icon className="w-5 h-5 text-white/90 shrink-0" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-base font-semibold text-zinc-100 tracking-wide leading-snug">
                      <span className="break-words line-clamp-2 hyphens-auto">
                        {tile.title}
                      </span>
                    </h3>
                    <p className="text-sm md:text-xs text-zinc-400 font-light mt-1">
                      {tile.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Dev Prompt Inspector Button */}
        {devMode && (
          <button
            onClick={openPrompt}
            className="mx-auto mt-4 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-semibold active:scale-95 transition-all hover:text-white flex items-center gap-1.5 animate-fade-in"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Consulter le Prompt Système
          </button>
        )}

        {/* Footer */}
        <footer className="dashboard-footer">
          <div>Houba Houba !</div>
          <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 flex-wrap justify-center">
            <span>© {new Date().getFullYear()} Éole</span>
            <span>•</span>
            <a
              href="https://www.improvisation.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-zinc-400 transition-colors"
            >
              Improvisation.org
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
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-all text-xs z-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400 z-30">
            {activeTile?.title}
          </h2>

          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center z-30">
            {activeTile && React.createElement(activeTile.icon, { className: "w-4 h-4 text-zinc-300" })}
          </div>
        </header>

        {/* Central Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center my-6 max-w-md mx-auto w-full relative">
          {renderActiveComponent()}
        </div>

        {/* Detail Footer */}
        <footer className="text-center text-xs text-zinc-500 tracking-wider">
          HOUBA HOUBA ! • CONSOLE D'OUTILS
        </footer>
      </div>

      {/* About Modal Overlay */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={closeAbout}
        devMode={devMode}
        onDevModeChange={handleDevModeChange}
      />

      {/* Loader Overlay */}
      <LoaderOverlay isVisible={isRegenerating || isReloading} />

      {/* Prompt Modal Overlay */}
      <PromptModal
        isOpen={isPromptOpen}
        onClose={closePrompt}
        systemPrompt={SYSTEM_PROMPT}
      />

    </main>
  );
}
