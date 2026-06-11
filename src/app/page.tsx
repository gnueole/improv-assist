"use client";

/**
 * @file page.tsx
 * @description Main app orchestrator / home dashboard page. Features a balanced 10-item grid of tiles, 
 * handles active tile navigation, virtual history states, and mounts generator components.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Smile,         // Emotions Generator
  Fingerprint,   // Who Starts? (Multi-touch)
  MapPin,        // Location Generator
  Clock,         // Era Generator
  ChevronLeft,   // Back navigation button
  Sparkles,      // Themes Generator
  Info,          // About / Help Trigger
  Hourglass,     // Scene Timer
  BookOpen,      // Scenarios & Constraints Views
  Zap,           // HiHa Rules & Echauffements Generators
  HelpCircle,    // Help & Guide Modal
  Terminal,      // Dev Prompt Inspector Trigger
  RotateCw,      // Reservoir Regeneration Button
  MessageSquare, // Feedback & Ideas Form
  User           // Characters Icon
} from "lucide-react";

import { Tile } from "@/types";
import { useImprovBuffer } from "@/hooks/useImprovBuffer";
import AboutModal from "@/components/AboutModal";
import PrivacyModal from "@/components/PrivacyModal";
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
import FeedbackView from "@/components/FeedbackView";
import CharacterGenerator from "@/components/CharacterGenerator";

import reservoirPool from "../../public/data/reservoir-config.json";

// Symmetrical layout with 11 items grid (2 columns on mobile, 3 columns on desktop)
const tiles: Tile[] = [
  { id: "emotions", title: "Générateur d'Émotions", subtitle: "Sensation à incarner", icon: Smile, color: "from-cyan-400 to-purple-500" },
  { id: "who_starts", title: "Qui Commence ?", subtitle: "Tirage multi-touch", icon: Fingerprint, color: "from-purple-500 to-pink-500" },
  { id: "themes", title: "Thèmes d'Impro", subtitle: "Sujets & idées d'histoires", icon: Sparkles, color: "from-indigo-400 to-cyan-400" },
  { id: "timer", title: "Timer de Scène", subtitle: "Lancer l'impro (2m30s)", icon: Hourglass, color: "from-cyan-400 to-pink-500" },
  { id: "scenarios", title: "Scénarios", subtitle: "Situations de départ", icon: BookOpen, color: "from-yellow-400 to-green-500" },
  { id: "locations", title: "Suggestion de Lieu", subtitle: "Cadre de l'impro", icon: MapPin, color: "from-pink-500 to-yellow-400" },
  { id: "eras", title: "Suggestion d'Époque", subtitle: "Temporalité de la scène", icon: Clock, color: "from-yellow-400 to-cyan-400" },
  { id: "characters", title: "Personnages", subtitle: "Âge, accessoire & attitude", icon: User, color: "from-purple-500 to-cyan-400" },
  { id: "constraints", title: "Contraintes d'Impro", subtitle: "Explorer les contraintes", icon: BookOpen, color: "from-purple-500 to-cyan-400" },
  { id: "echauffements", title: "Échauffements", subtitle: "Exercices de préparation", icon: Zap, color: "from-amber-500 to-orange-600" },
  { id: "docs", title: "Aide & Guide", subtitle: "Aide à propos de l'application", icon: HelpCircle, color: "from-pink-500 to-yellow-400" },
  { id: "hiha", title: "Règles du Hi Ha", subtitle: "Signes & réflexes collectifs", icon: Zap, color: "from-amber-500 to-orange-600" },
  { id: "feedback", title: "Retour & Idées", subtitle: "Envoyer vos suggestions", icon: MessageSquare, color: "from-cyan-400 to-indigo-500" }
];

export default function Dashboard() {
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("Chargement du prompt...");
  const [focusedTileIndex, setFocusedTileIndex] = useState<number>(0);

  // Fetch master.prompt dynamically when prompt modal is opened
  useEffect(() => {
    if (isPromptOpen) {
      fetch("/api/prompt")
        .then((res) => {
          if (!res.ok) throw new Error("Impossible de lire le fichier");
          return res.text();
        })
        .then((text) => setSystemPrompt(text))
        .catch((err) => {
          console.error("Error loading system prompt:", err);
          setSystemPrompt("Erreur lors de la lecture de master.prompt.");
        });
    }
  }, [isPromptOpen]);

  // Expose functions & state from hook
  const {
    buffer,              // Shared global buffer state containing suggestion queues
    isRegenerating,      // Legacy loading state maintained for compatibility
    isReloading,         // True when resetting/reloading the local reservoir pool
    isLoading,           // General loading indicator for async operations
    devMode,             // Flag indicating if Developer Mode is enabled
    toastMessage,        // Message text to display in ToastAlert
    triggerRegen,        // Reloads the static reservoir JSON into the buffer
    pickItem,            // Draws a random prompt item from a category or fetches via n8n
    showToast,           // Dispatches a toast notification message
    handleDevModeChange, // Toggles developer mode on/off
    n8nStatus,           // Connection status to n8n webhook ("green" or "red")
    n8nError             // Details of the last n8n sync/connection error
  } = useImprovBuffer(activeTileId);

  const activeTile = tiles.find(t => t.id === activeTileId);

  // Tile Selection History Navigation
  const handleSelectTile = useCallback((id: string) => {
    setActiveTileId(id);
    const idx = tiles.findIndex(t => t.id === id);
    if (idx !== -1) {
      setFocusedTileIndex(idx);
    }
    window.history.pushState({
      activeTileId: id,
      isAboutOpen: false,
      isPromptOpen: false,
      isRegenerating: false
    }, "", `/${id}`);
  }, []);

  // Modals History Open/Close Actions
  const openAbout = useCallback(() => {
    setIsAboutOpen(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: true,
      isPromptOpen: false,
      isRegenerating: false
    }, "", activeTileId ? `/${activeTileId}` : "/");
  }, [activeTileId]);

  const closeAbout = useCallback(() => {
    if (window.history.state?.isAboutOpen) {
      window.history.back();
    } else {
      setIsAboutOpen(false);
    }
  }, []);

  const openPrompt = useCallback(() => {
    setIsPromptOpen(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: false,
      isPromptOpen: true,
      isRegenerating: false
    }, "", activeTileId ? `/${activeTileId}` : "/");
  }, [activeTileId]);

  const closePrompt = useCallback(() => {
    if (window.history.state?.isPromptOpen) {
      window.history.back();
    } else {
      setIsPromptOpen(false);
    }
  }, []);

  const handleBackToDashboard = useCallback(() => {
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
  }, []);

  // Handle browser back swipe/button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state === "object") {
        setActiveTileId(state.activeTileId !== undefined ? state.activeTileId : null);
        setIsAboutOpen(!!state.isAboutOpen);
        setIsPromptOpen(!!state.isPromptOpen);
        if (state.activeTileId) {
          const idx = tiles.findIndex(t => t.id === state.activeTileId);
          if (idx !== -1) {
            setFocusedTileIndex(idx);
          }
        }
      } else {
        const path = window.location.pathname.replace(/^\//, "");
        const validTileIds = ["emotions", "who_starts", "themes", "timer", "scenarios", "locations", "eras", "characters", "constraints", "echauffements", "docs", "hiha", "feedback"];
        const nextActive = validTileIds.includes(path) ? path : null;
        setActiveTileId(nextActive);
        if (nextActive) {
          const idx = tiles.findIndex(t => t.id === nextActive);
          if (idx !== -1) {
            setFocusedTileIndex(idx);
          }
        }
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
    const validTileIds = ["emotions", "who_starts", "themes", "timer", "scenarios", "locations", "eras", "characters", "constraints", "echauffements", "docs", "hiha", "feedback"];
    if (validTileIds.includes(path)) {
      setActiveTileId(path);
      const idx = tiles.findIndex(t => t.id === path);
      if (idx !== -1) {
        setFocusedTileIndex(idx);
      }
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

  // Global keyboard shortcuts on PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bypass shortcuts if the user is typing in any input field
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      // Check key (case insensitive for letters)
      const key = e.key.toLowerCase();

      // 1. Modals & Detail Navigation (Back / Left Arrow / Escape)
      if (e.key === "ArrowLeft" || e.key === "Escape" || e.key === "Esc") {
        if (isPrivacyOpen) {
          e.preventDefault();
          setIsPrivacyOpen(false);
          return;
        }
        if (isAboutOpen) {
          e.preventDefault();
          closeAbout();
          return;
        }
        if (isPromptOpen) {
          e.preventDefault();
          closePrompt();
          return;
        }
        if (activeTileId !== null) {
          e.preventDefault();
          handleBackToDashboard();
          return;
        }
      }

      // 2. "a" or "i" is About Modal toggle
      if (key === "a" || key === "i") {
        e.preventDefault();
        if (isAboutOpen) {
          closeAbout();
        } else {
          setIsPrivacyOpen(false);
          setIsPromptOpen(false);
          openAbout();
        }
        return;
      }

      // 3. "g" is Regen trigger
      if (key === "g") {
        e.preventDefault();
        triggerRegen(devMode);
        return;
      }

      // 4. "m" is Feedback panel shortcut
      if (key === "m") {
        e.preventDefault();
        setIsPrivacyOpen(false);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        handleSelectTile("feedback");
        return;
      }

      // 5. "h" is HiHa rules shortcut
      if (key === "h") {
        e.preventDefault();
        setIsPrivacyOpen(false);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        handleSelectTile("hiha");
        return;
      }

      // 6. "d" is Dev Mode toggle
      if (key === "d") {
        e.preventDefault();
        handleDevModeChange(!devMode);
        return;
      }

      // 7. "p" is Prompt Modal toggle (in Dev Mode only)
      if (key === "p") {
        e.preventDefault();
        if (isPromptOpen) {
          closePrompt();
        } else if (devMode) {
          setIsPrivacyOpen(false);
          setIsAboutOpen(false);
          openPrompt();
        }
        return;
      }

      // 8. "?" is Help & Guide panel shortcut
      if (e.key === "?") {
        e.preventDefault();
        setIsPrivacyOpen(false);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        handleSelectTile("docs");
        return;
      }

      // 9. Arrow navigation
      if (activeTileId === null) {
        // Dashboard mode: navigate tiles in grid
        if (isAboutOpen || isPromptOpen || isPrivacyOpen) return;

        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev - 2 + 13) % 13);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev + 2) % 13);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev - 1 + 13) % 13);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev + 1) % 13);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelectTile(tiles[focusedTileIndex].id);
        }
      } else {
        // Detail view mode: go from tile to tile with arrows (Right/Down = next, Up = prev)
        if (isAboutOpen || isPromptOpen || isPrivacyOpen) return;

        const currentIdx = tiles.findIndex((t) => t.id === activeTileId);
        if (currentIdx !== -1) {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            const nextIdx = (currentIdx + 1) % tiles.length;
            setActiveTileId(tiles[nextIdx].id);
            setFocusedTileIndex(nextIdx);
            window.history.replaceState({
              activeTileId: tiles[nextIdx].id,
              isAboutOpen: false,
              isPromptOpen: false,
              isRegenerating: false
            }, "", `/${tiles[nextIdx].id}`);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIdx = (currentIdx - 1 + tiles.length) % tiles.length;
            setActiveTileId(tiles[prevIdx].id);
            setFocusedTileIndex(prevIdx);
            window.history.replaceState({
              activeTileId: tiles[prevIdx].id,
              isAboutOpen: false,
              isPromptOpen: false,
              isRegenerating: false
            }, "", `/${tiles[prevIdx].id}`);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeTileId,
    isAboutOpen,
    isPromptOpen,
    isPrivacyOpen,
    focusedTileIndex,
    devMode,
    triggerRegen,
    openAbout,
    closeAbout,
    closePrompt,
    handleBackToDashboard,
    handleSelectTile,
    handleDevModeChange
  ]);

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
        return <DocsView onOpenPrivacy={() => setIsPrivacyOpen(true)} />;
      case "hiha":
        return <HiHaRules />;
      case "echauffements":
        return (
          <GenericGenerator
            categoryKey="echauffements"
            title="Échauffements"
            pickItem={pickItem}
            itemsPool={reservoirPool.echauffements || []}
          />
        );
      case "characters":
        return (
          <CharacterGenerator
            pickItem={pickItem}
            itemsPool={reservoirPool.characters || []}
          />
        );
      case "feedback":
        return <FeedbackView showToast={showToast} onOpenPrivacy={() => setIsPrivacyOpen(true)} />;
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
        className={`dashboard-container transition-all duration-500 ease-out z-10 ${activeTileId !== null ? "opacity-0 scale-95 pointer-events-none translate-y-4 invisible" : "opacity-100 scale-100"
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
            {devMode && (
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-1 select-none animate-fade-in">
                dev
              </span>
            )}
            {/* Status Light */}
            <div
              className={`status-light ${n8nStatus}`}
              title={n8nStatus === "red" ? `Erreur n8n : ${n8nError}` : "Connexion 🧠 Opérationnelle"}
            />
            <button
              onClick={() => triggerRegen(devMode)}
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
          {tiles.map((tile, index) => {
            const Icon = tile.icon;
            
            // Get count for devMode display
            let suggestionCount: number | null = null;
            if (devMode && buffer) {
              if (tile.id === "eras") suggestionCount = buffer.eras?.length ?? 0;
              else if (tile.id === "locations") suggestionCount = buffer.locations?.length ?? 0;
              else if (tile.id === "emotions") suggestionCount = buffer.emotions?.length ?? 0;
              else if (tile.id === "scenarios") suggestionCount = buffer.scenarios?.length ?? 0;
              else if (tile.id === "themes") suggestionCount = buffer.themes?.length ?? 0;
              else if (tile.id === "characters") suggestionCount = buffer.characters?.length ?? 0;
            }

            return (
              <button
                key={tile.id}
                onClick={() => handleSelectTile(tile.id)}
                onMouseEnter={() => setFocusedTileIndex(index)}
                className={`dashboard-tile relative ${tile.id === "feedback" ? "col-span-2 min-h-[96px]" : "aspect-square"} ${focusedTileIndex === index ? "focused" : ""}`}
              >
                {suggestionCount !== null && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-mono text-zinc-500/80 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-800/30 select-none z-10 animate-fade-in" title="Suggestions restantes">
                    {suggestionCount}
                  </span>
                )}
                <div className={`dashboard-tile-inner ${tile.id === "feedback" ? "flex-row items-center gap-4 text-left" : "flex-col"}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 ${tile.id === "feedback" ? "mb-0" : "mb-2.5"}`}>
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
        className={`absolute inset-0 bg-black flex flex-col justify-between p-6 pb-8 transition-all duration-500 ease-in-out z-20 ${activeTileId === null ? "opacity-0 scale-105 pointer-events-none translate-y-4" : "opacity-100 scale-100"
          }`}
      >
        {/* Detail Header */}
        <header className="flex items-center justify-between pt-safe gap-2">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-all text-xs z-30 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          <div className="flex flex-col items-center text-center z-30 mx-2 flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-400 truncate w-full">
              {activeTile?.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 z-30 shrink-0">
            {devMode && (
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mr-0.5 select-none animate-fade-in">
                dev
              </span>
            )}
            {/* Status Light */}
            <div
              className={`status-light ${n8nStatus}`}
              title={n8nStatus === "red" ? `Erreur n8n : ${n8nError}` : "Connexion 🧠 Opérationnelle"}
            />
            <button
              onClick={() => triggerRegen(devMode, activeTileId || undefined)}
              className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="Régénérer cette catégorie"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={openAbout}
              className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="À propos"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Central Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center my-6 max-w-md mx-auto w-full relative">
          {renderActiveComponent()}
        </div>

        {/* Detail Footer */}
        <footer className="text-center py-4 border-t border-zinc-900/60 w-full flex flex-col items-center justify-center gap-1 select-none shrink-0">
          <div className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-zinc-300">
            Houba Houba !
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-500">
              Compagnon d'Inspiration
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
          </div>
        </footer>
      </div>

      {/* About Modal Overlay */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={closeAbout}
        devMode={devMode}
        onDevModeChange={handleDevModeChange}
        onOpenPrivacy={() => {
          setIsAboutOpen(false);
          setIsPrivacyOpen(true);
        }}
      />

      {/* Loader Overlay */}
      <LoaderOverlay isVisible={isRegenerating || isReloading || isLoading} />

      {/* Prompt Modal Overlay */}
      <PromptModal
        isOpen={isPromptOpen}
        onClose={closePrompt}
        systemPrompt={systemPrompt}
      />

      {/* Privacy Policy Modal Overlay */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

    </main>
  );
}
