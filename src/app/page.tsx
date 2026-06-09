"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RotateCw,
  Terminal,
  Zap
} from "lucide-react";

import { Tile, ImprovBuffer } from "@/types";
import { EMOTIONS, LOCATIONS, ERAS } from "@/data/mockData";
import AboutModal from "@/components/AboutModal";
import EmotionGenerator from "@/components/EmotionGenerator";
import WhoStarts from "@/components/WhoStarts";
import LocationGenerator from "@/components/LocationGenerator";
import EraGenerator from "@/components/EraGenerator";
import ImprovTimer from "@/components/ImprovTimer";
import DocsView from "@/components/DocsView";
import HiHaRules from "@/components/HiHaRules";

const SYSTEM_PROMPT = `Tu es un assistant d'improvisation théâtrale pour l'EFIT. 
Génère un fichier JSON structuré contenant 3 listes d'éléments inspirants pour alimenter des générateurs d'impro :

1. "emotions" : 50 suggestions d'émotions/états d'esprit avec leur catégorie (Positive, Négative, Neutre).
Chaque objet doit être au format : { "text": string, "category": "Positive" | "Négative" | "Neutre" }

2. "locations" : 50 suggestions de lieux propices au jeu dramatique ou comique, classés par catégorie (Huis clos, Quotidien, Aventure, Insolite).
Chaque objet doit être au format : { "text": string, "category": "Huis clos" | "Quotidien" | "Aventure" | "Insolite" }

3. "eras" : 50 suggestions de périodes temporelles ou époques inspirantes, classées par temporalité (Passé, Présent, Futur).
Chaque objet doit être au format : { "text": string, "era": "Passé" | "Présent" | "Futur" }

Important : Ne renvoie rien d'autre que le JSON brut de cette structure. Les suggestions doivent être variées, théâtrales, poétiques ou insolites.`;

export default function Dashboard() {
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [buffer, setBuffer] = useState<ImprovBuffer>({
    emotions: [],
    locations: [],
    eras: [],
    last_fetch: null
  });

  // Charger le mode développeur et le réservoir depuis le LocalStorage au montage
  useEffect(() => {
    const savedDevMode = localStorage.getItem("dev_mode") === "true";
    setDevMode(savedDevMode);

    const savedBuffer = localStorage.getItem("improv_buffer");
    if (savedBuffer) {
      try {
        const parsed = JSON.parse(savedBuffer);
        if (parsed && Array.isArray(parsed.emotions) && Array.isArray(parsed.locations) && Array.isArray(parsed.eras)) {
          setBuffer(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse improv_buffer from localStorage", e);
      }
    }
    
    // Initialisation par défaut avec les données statiques
    const initialBuffer: ImprovBuffer = {
      emotions: [...EMOTIONS],
      locations: [...LOCATIONS],
      eras: [...ERAS],
      last_fetch: null
    };
    setBuffer(initialBuffer);
    localStorage.setItem("improv_buffer", JSON.stringify(initialBuffer));
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Régénérer le réservoir via le Webhook n8n
  const triggerRegen = async (force: boolean = false) => {
    const savedBuffer = localStorage.getItem("improv_buffer");
    let currentLastFetch: number | null = null;
    if (savedBuffer) {
      try {
        const parsed = JSON.parse(savedBuffer);
        currentLastFetch = parsed.last_fetch;
      } catch (e) {
        console.error(e);
      }
    }

    if (!force && !devMode && currentLastFetch) {
      const elapsed = Date.now() - currentLastFetch;
      const min5 = 5 * 60 * 1000;
      if (elapsed < min5) {
        const remainingMin = Math.ceil((min5 - elapsed) / 60000);
        showToast(`Réservoir mis à jour récemment. Prochain refresh possible dans ${remainingMin} min`);
        return;
      }
    }

    setIsRegenerating(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: false,
      isPromptOpen: false,
      isRegenerating: true
    }, "", "");

    try {
      const response = await fetch("/webhook/improv-regen", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("HTTP error");
      }

      const data = await response.json();
      
      const newBuffer: ImprovBuffer = {
        emotions: Array.isArray(data?.emotions) && data.emotions.length > 0 ? data.emotions : [...EMOTIONS],
        locations: Array.isArray(data?.locations) && data.locations.length > 0 ? data.locations : [...LOCATIONS],
        eras: Array.isArray(data?.eras) && data.eras.length > 0 ? data.eras : [...ERAS],
        last_fetch: Date.now()
      };

      setBuffer(newBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(newBuffer));
      showToast("Réservoir rechargé avec succès !");
    } catch (error) {
      console.error("Regen failed:", error);
      showToast("Erreur de régénération. Utilisation des données locales.");
      
      // Assurer un réservoir non vide en cas d'erreur réseau
      const finalEmotions = buffer.emotions.length === 0 ? [...EMOTIONS] : buffer.emotions;
      const finalLocations = buffer.locations.length === 0 ? [...LOCATIONS] : buffer.locations;
      const finalEras = buffer.eras.length === 0 ? [...ERAS] : buffer.eras;
      
      const resetBuffer: ImprovBuffer = {
        emotions: finalEmotions,
        locations: finalLocations,
        eras: finalEras,
        last_fetch: Date.now()
      };
      setBuffer(resetBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(resetBuffer));
    } finally {
      if (window.history.state && window.history.state.isRegenerating) {
        window.history.back();
      } else {
        setIsRegenerating(false);
      }
    }
  };

  // Piocher un item au hasard et le supprimer du cache local
  const pickItem = useCallback((category: "emotions" | "locations" | "eras", filter?: string): any => {
    const saved = localStorage.getItem("improv_buffer");
    if (!saved) return null;
    try {
      const currentBuffer = JSON.parse(saved) as ImprovBuffer;
      const items = currentBuffer[category] || [];
      
      let filteredItems = [...items];
      if (filter && filter !== "All") {
        if (category === "emotions") {
          filteredItems = items.filter((e: any) => e.category === filter);
        } else if (category === "locations") {
          filteredItems = items.filter((l: any) => l.category === filter);
        }
      }

      if (filteredItems.length === 0) {
        triggerRegen(true);
        return null;
      }

      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      const pickedItem = filteredItems[randomIndex];

      const updatedItems = items.filter((item: any) => item.text !== pickedItem.text);
      const updatedBuffer = {
        ...currentBuffer,
        [category]: updatedItems
      };

      setBuffer(updatedBuffer);
      localStorage.setItem("improv_buffer", JSON.stringify(updatedBuffer));

      if (updatedItems.length === 0) {
        triggerRegen(true);
      }

      return pickedItem;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [devMode, activeTileId, buffer]);

  // Gérer la sélection de tuile en poussant un état dans l'historique
  const handleSelectTile = (id: string) => {
    setActiveTileId(id);
    window.history.pushState({
      activeTileId: id,
      isAboutOpen: false,
      isPromptOpen: false,
      isRegenerating: false
    }, "", "");
  };

  // Modale À Propos
  const openAbout = () => {
    setIsAboutOpen(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: true,
      isPromptOpen: false,
      isRegenerating: false
    }, "", "");
  };

  const closeAbout = () => {
    if (window.history.state && window.history.state.isAboutOpen) {
      window.history.back();
    } else {
      setIsAboutOpen(false);
    }
  };

  const handleDevModeChange = (val: boolean) => {
    setDevMode(val);
    localStorage.setItem("dev_mode", val ? "true" : "false");
  };

  // Modale Prompt Système
  const openPrompt = () => {
    setIsPromptOpen(true);
    window.history.pushState({
      activeTileId,
      isAboutOpen: false,
      isPromptOpen: true,
      isRegenerating: false
    }, "", "");
  };

  const closePrompt = () => {
    if (window.history.state && window.history.state.isPromptOpen) {
      window.history.back();
    } else {
      setIsPromptOpen(false);
    }
  };

  // Gestion de l'historique système (swipe Retour)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state === "object") {
        setActiveTileId(state.activeTileId !== undefined ? state.activeTileId : null);
        setIsAboutOpen(!!state.isAboutOpen);
        setIsPromptOpen(!!state.isPromptOpen);
        setIsRegenerating(!!state.isRegenerating);
      } else {
        setActiveTileId(null);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        setIsRegenerating(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Service Worker
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

  const tiles: Tile[] = [
    { id: "emotions", title: "Générateur d'Émotions", subtitle: "Sensation à incarner", icon: Smile, color: "from-cyan-400 to-purple-500" },
    { id: "who_starts", title: "Qui Commence ?", subtitle: "Tirage multi-touch", icon: Fingerprint, color: "from-purple-500 to-pink-500" },
    { id: "locations", title: "Suggestion de Lieu", subtitle: "Cadre de l'impro", icon: MapPin, color: "from-pink-500 to-yellow-400" },
    { id: "eras", title: "Suggestion d'Époque", subtitle: "Temporalité de la scène", icon: Clock, color: "from-yellow-400 to-cyan-400" },
    { id: "timer", title: "Timer de Scène", subtitle: "Lancer l'impro (2m30s)", icon: Hourglass, color: "from-cyan-400 to-pink-500" },
    { id: "docs", title: "Contraintes & Docs", subtitle: "Aide & règles d'impro", icon: BookOpen, color: "from-purple-500 to-cyan-400" },
    { id: "hiha", title: "Règles du Hi Ha (EFIT)", subtitle: "Signes & réflexes collectifs", icon: Zap, color: "from-amber-500 to-orange-600" }
  ];

  const activeTile = tiles.find(t => t.id === activeTileId);

  const renderActiveComponent = () => {
    switch (activeTileId) {
      case "emotions":
        return <EmotionGenerator pickItem={pickItem} />;
      case "who_starts":
        return <WhoStarts onBack={() => window.history.back()} />;
      case "locations":
        return <LocationGenerator pickItem={pickItem} />;
      case "eras":
        return <EraGenerator pickItem={pickItem} />;
      case "timer":
        return <ImprovTimer />;
      case "docs":
        return <DocsView />;
      case "hiha":
        return <HiHaRules onBack={() => window.history.back()} />;
      default:
        return null;
    }
  };

  return (
    <main className="relative h-full w-full overflow-hidden bg-black flex flex-col justify-between">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 max-w-sm mx-auto z-50 p-[1.5px] rounded-2xl bg-gradient-to-r from-cyan-500 via-yellow-500 to-purple-500 animate-toast shadow-2xl">
          <div className="bg-zinc-950 px-4 py-3 rounded-[15px] text-center text-xs text-zinc-300">
            {toastMessage}
          </div>
        </div>
      )}

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
        <section className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full my-auto landscape:my-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => handleSelectTile(tile.id)}
                className="irised-border-wrapper group active:scale-[0.97] focus:outline-none w-full aspect-square text-left"
              >
                <div className="irised-border-inner p-5 flex flex-col justify-between min-h-[145px]">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100 tracking-wide">
                      <span className="break-words line-clamp-2 hyphens-auto">
                        {tile.title}
                      </span>
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

        {/* Dev Prompt Inspector Button */}
        {devMode && (
          <button 
            onClick={openPrompt}
            className="mx-auto mt-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-semibold active:scale-95 transition-all hover:text-white flex items-center gap-1.5 animate-fade-in"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Consulter le Prompt Système
          </button>
        )}

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
            onClick={() => window.history.back()}
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
          {renderActiveComponent()}
        </div>

        {/* Detail Footer */}
        <footer className="text-center text-[9px] text-zinc-700 tracking-wider">
          IMPROV-ASSIST • CONSOLE D'OUTILS
        </footer>
      </div>

      {/* 3. About Modal Overlay */}
      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={closeAbout} 
        devMode={devMode}
        onDevModeChange={handleDevModeChange}
      />

      {/* 4. Loader Overlay */}
      {isRegenerating && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Spinning Irised Loader */}
            <div className="w-16 h-16 rounded-full bg-irised-gradient irised-glow flex items-center justify-center animate-spin mb-4">
              <div className="w-12 h-12 rounded-full bg-black" />
            </div>
            <h3 className="text-lg font-bold tracking-wider text-zinc-100 uppercase">
              Génération IA...
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              Mise à jour du réservoir d'improvisation depuis Gemini. Veuillez patienter.
            </p>
          </div>
        </div>
      )}

      {/* 5. Prompt Modal Overlay */}
      {isPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-300 animate-fade-in">
          <div className="irised-border-wrapper w-full max-w-md">
            <div className="irised-border-inner p-6 flex flex-col justify-between items-center text-center max-h-[85vh]">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-cyan-400" />
              </div>
              
              <h3 className="text-lg font-bold tracking-wider text-zinc-100 uppercase mb-2">
                Prompt Système Gemini
              </h3>
              
              <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 mb-6 text-left overflow-y-auto font-mono text-[10px] text-zinc-400 leading-relaxed max-h-[40vh] select-text">
                {SYSTEM_PROMPT}
              </div>
              
              <button
                onClick={closePrompt}
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-black text-xs font-semibold active:scale-95 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
