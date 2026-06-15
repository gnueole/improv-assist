"use client";

/**
 * @file page.tsx
 * @description Main app orchestrator / home dashboard page. Features a nested menu hierarchy,
 * a Spotlight-style search bar, handles active tile navigation, virtual history states, 
 * and mounts generator components including the new Animaux and Objets generators.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  User,          // Characters Icon
  PawPrint,      // Animals Icon
  Package,       // Objects Icon
  Search,        // Search Icon
  Folder         // Folder Icon
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

// Nested structure with parent directories and leaf nodes
const tiles: Tile[] = [
  // Directories
  { id: "incarnate", title: "Incarner", subtitle: "Personnages, émotions...", icon: User, color: "from-purple-500 to-indigo-500", isDir: true },
  { id: "inspiration", title: "Inspiration", subtitle: "Thèmes, lieux, scénarios...", icon: Sparkles, color: "from-indigo-400 to-cyan-400", isDir: true },
  { id: "warmup", title: "S'échauffer", subtitle: "Exercices et contraintes...", icon: Zap, color: "from-amber-500 to-orange-600", isDir: true },

  // Incarner submenu
  {
    id: "emotions",
    title: "Générateur d'Émotions",
    subtitle: "Sensation à incarner",
    icon: Smile,
    color: "from-cyan-400 to-purple-500",
    menu: "incarnate",
    keywords: ["emotions", "émotion", "colère", "joie", "tristesse", "sensation", "sentiment", "incarner", "jeu"],
    helpDescription: <span>Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de <strong>1 à 10</strong>. Ce niveau de performance pousse les acteurs à nuancer ou à exagérer leur état psychologique.</span>
  },
  {
    id: "characters",
    title: "Personnages",
    subtitle: "Âge, accessoire & attitude",
    icon: User,
    color: "from-purple-500 to-cyan-400",
    menu: "incarnate",
    keywords: ["personnage", "avatar", "rôle", "archétype", "âge", "accessoire", "attitude", "incarner"],
    helpDescription: <span>Suggère un personnage aléatoire avec un <strong>âge</strong>, un <strong>accessoire</strong> et une <strong>attitude</strong> pour guider rapidement l'interprétation.</span>
  },
  {
    id: "animals",
    title: "Animaux",
    subtitle: "Animaux insolites",
    icon: PawPrint,
    color: "from-green-400 to-emerald-600",
    menu: "incarnate",
    keywords: ["animaux", "animal", "bête", "faune", "cri", "incarner", "sauvage", "domestique"],
    helpDescription: <span>Suggère un animal insolite à <strong>incarner</strong> ou pour inspirer une posture physique et un comportement de jeu originaux.</span>
  },
  {
    id: "objects",
    title: "Objets",
    subtitle: "Objets à incarner ou utiliser",
    icon: Package,
    color: "from-orange-400 to-amber-500",
    menu: "incarnate",
    keywords: ["objets", "objet", "chose", "accessoire", "truc", "outil", "matériel", "incarner"],
    helpDescription: <span>Suggère un objet du quotidien à <strong>utiliser</strong> sur scène, à <strong>détourner</strong> ou à <strong>incarner</strong> directement.</span>
  },

  // Inspiration submenu
  {
    id: "scenarios",
    title: "Scénarios",
    subtitle: "Situations de départ",
    icon: BookOpen,
    color: "from-yellow-400 to-green-500",
    menu: "inspiration",
    keywords: ["scenarios", "scénario", "situation", "histoire", "contexte", "brief", "départ", "inspiration"],
    helpDescription: <span>Des situations de départ et intrigues dramatiques ou comiques pour amorcer les scènes avec un <strong>enjeu immédiat</strong>.</span>
  },
  {
    id: "locations",
    title: "Suggestion de Lieu",
    subtitle: "Cadre de l'impro",
    icon: MapPin,
    color: "from-pink-500 to-yellow-400",
    menu: "inspiration",
    keywords: ["lieux", "lieu", "endroit", "cadre", "décor", "pièce", "pays", "inspiration"],
    helpDescription: <span>Des idées créatives instantanées pour planter le <strong>décor physique</strong> (salon de coiffure, sous-marin, etc.) de vos histoires.</span>
  },
  {
    id: "eras",
    title: "Suggestion d'Époque",
    subtitle: "Temporalité de la scène",
    icon: Clock,
    color: "from-yellow-400 to-cyan-400",
    menu: "inspiration",
    keywords: ["époques", "époque", "temps", "futur", "passé", "siècle", "temporalité", "inspiration"],
    helpDescription: <span>Des repères temporels (Moyen Âge, an 3000, années 80) pour situer l'action et la <strong>temporalité</strong> de l'improvisation.</span>
  },
  {
    id: "themes",
    title: "Thèmes d'Impro",
    subtitle: "Sujets & idées d'histoires",
    icon: Sparkles,
    color: "from-indigo-400 to-cyan-400",
    menu: "inspiration",
    keywords: ["thèmes", "thème", "sujet", "titre", "idée", "inspiration"],
    helpDescription: <span>Une sélection de sujets courts poétiques ou comiques pour servir de <strong>fil conducteur</strong> ou d'inspiration pour vos improvisations.</span>
  },

  // Warmup submenu
  {
    id: "echauffements",
    title: "Échauffements",
    subtitle: "Exercices de préparation",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    menu: "warmup",
    keywords: ["échauffements", "échauffement", "exercice", "préparation", "groupe", "corps", "voix", "s'échauffer"],
    helpDescription: <span>Des exercices de préparation physique, mentale et vocale pour se mettre en condition de jeu individuellement ou collectivement.</span>
  },
  {
    id: "constraints",
    title: "Contraintes d'Impro",
    subtitle: "Explorer les contraintes",
    icon: BookOpen,
    color: "from-purple-500 to-cyan-400",
    menu: "warmup",
    keywords: ["contraintes", "contrainte", "règle", "défi", "difficulté", "limite", "s'échauffer"],
    helpDescription: <span>Des contraintes de jeu (sans verbe, en rimes, etc.) pour pimenter vos improvisations et forcer la créativité.</span>
  },
  {
    id: "hiha",
    title: "Règles du Hi Ha",
    subtitle: "Signes & réflexes collectifs",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    menu: "warmup",
    keywords: ["hiha", "hi ha", "jeu", "réflexe", "rythme", "bruit", "s'échauffer"],
    helpDescription: <span>Les règles et gestes du célèbre jeu d'échauffement collectif Hi Ha, idéal pour travailler le <strong>rythme</strong> et la <strong>concentration</strong>.</span>
  },

  // Root utilities (always visible at root level)
  {
    id: "who_starts",
    title: "Qui Commence ?",
    subtitle: "Tirage multi-touch",
    icon: Fingerprint,
    color: "from-purple-500 to-pink-500",
    keywords: ["qui commence", "commencer", "début", "premier", "tirage", "tactile", "touch", "jeu"],
    helpDescription: <span>Idéal pour désigner l'initiateur d'une scène. Posez jusqu'à 5 doigts sur l'écran. Après 3 secondes de décompte, le gagnant s'affiche en vert vif avec un effet haptique.</span>
  },
  {
    id: "timer",
    title: "Timer de Scène",
    subtitle: "Lancer l'impro (2m30s)",
    icon: Hourglass,
    color: "from-cyan-400 to-pink-500",
    keywords: ["timer", "temps", "chronomètre", "durée", "scène", "jeu", "cloche", "buzzer"],
    helpDescription: <span>Un chronomètre préréglé sur <strong>2 minutes 30 secondes</strong> (durée standard d'improvisation). Lorsque le temps est écoulé, le message dynamique « Hey ! Impro ! » signale la fin.</span>
  },
  {
    id: "docs",
    title: "Aide & Guide",
    subtitle: "Aide à propos de l'application",
    icon: HelpCircle,
    color: "from-pink-500 to-yellow-400",
    keywords: ["aide", "guide", "à propos", "documentation", "règles", "mentions", "infos"]
  },
  {
    id: "feedback",
    title: "Retour & Idées",
    subtitle: "Envoyer vos suggestions",
    icon: MessageSquare,
    color: "from-cyan-400 to-indigo-500",
    keywords: ["retour", "avis", "feedback", "idée", "suggestion", "bug", "amélioration", "message"],
    helpDescription: <span>Un formulaire de feedback direct permettant aux utilisateurs d'envoyer des demandes, suggestions ou observations pour améliorer l'application.</span>
  }
];

export default function Dashboard() {
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("Chargement du prompt...");
  const [focusedTileIndex, setFocusedTileIndex] = useState<number>(0);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Filter visible tiles dynamically based on submenu state and search query
  const searchNormalized = searchQuery.trim().toLowerCase();
  const renderedTiles = (() => {
    if (searchNormalized !== "") {
      // Bypasses the submenu hierarchy and flattens all leaf node cards matching the query
      return tiles.filter(t => 
        !t.isDir && 
        (t.title.toLowerCase().includes(searchNormalized) ||
         t.subtitle.toLowerCase().includes(searchNormalized) ||
         (t.keywords && t.keywords.some(k => k.toLowerCase().includes(searchNormalized))))
      );
    }
    
    // Normal submenu structure
    const baseTiles = tiles.filter(t => t.menu === (currentMenuId || undefined));
    return baseTiles;
  })();

  // Tile Selection History Navigation
  const handleSelectTile = useCallback((tile: Tile) => {
    if (tile.isDir) {
      setCurrentMenuId(tile.id);
      setFocusedTileIndex(0);
      window.history.pushState({
        activeTileId: null,
        currentMenuId: tile.id,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", `/${tile.id}`);
    } else if (tile.id === "back_to_root") {
      setCurrentMenuId(null);
      setFocusedTileIndex(0);
      window.history.pushState({
        activeTileId: null,
        currentMenuId: null,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", "/");
    } else {
      setActiveTileId(tile.id);
      window.history.pushState({
        activeTileId: tile.id,
        currentMenuId: currentMenuId,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", `/${tile.id}`);
    }
  }, [currentMenuId]);

  const dismissFeedbackToast = useCallback(() => {
    localStorage.setItem("feedback_prompt_dismissed", "true");
    setShowFeedbackToast(false);
  }, []);

  const handleFeedbackClick = useCallback(() => {
    localStorage.setItem("feedback_prompt_dismissed", "true");
    setShowFeedbackToast(false);
    const feedbackTile = tiles.find(t => t.id === "feedback");
    if (feedbackTile) handleSelectTile(feedbackTile);
  }, [handleSelectTile]);

  // Track cumulative usage time for feedback toast
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem("feedback_prompt_dismissed");
    if (dismissed === "true") return;

    const targetTime = 20 * 60 * 1000; // 20 minutes

    const urlParams = new URLSearchParams(window.location.search);
    const testFeedback = urlParams.get("test_feedback") === "true";

    // 1. Initial check on mount
    const rawTimeOnMount = localStorage.getItem("cumulative_usage_time") || "0";
    const totalUsageOnMount = parseInt(rawTimeOnMount, 10);

    if (totalUsageOnMount >= targetTime || testFeedback) {
      const delay = testFeedback ? 5000 : 5000;
      const initialTimer = setTimeout(() => {
        setShowFeedbackToast(true);
      }, delay);
      return () => clearTimeout(initialTimer);
    }

    // 2. Otherwise, set up interval to track and show once reached
    const interval = setInterval(() => {
      const rawTime = localStorage.getItem("cumulative_usage_time") || "0";
      let totalUsage = parseInt(rawTime, 10);
      totalUsage += 5000; // increment by 5 seconds
      localStorage.setItem("cumulative_usage_time", totalUsage.toString());

      if (totalUsage >= targetTime) {
        setShowFeedbackToast(true);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Modals History Open/Close Actions
  const openAbout = useCallback(() => {
    setIsAboutOpen(true);
    window.history.pushState({
      activeTileId,
      currentMenuId,
      isAboutOpen: true,
      isPromptOpen: false,
      isRegenerating: false
    }, "", activeTileId ? `/${activeTileId}` : (currentMenuId ? `/${currentMenuId}` : "/"));
  }, [activeTileId, currentMenuId]);

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
      currentMenuId,
      isAboutOpen: false,
      isPromptOpen: true,
      isRegenerating: false
    }, "", activeTileId ? `/${activeTileId}` : (currentMenuId ? `/${currentMenuId}` : "/"));
  }, [activeTileId, currentMenuId]);

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
        currentMenuId: currentMenuId,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", currentMenuId ? `/${currentMenuId}` : "/");
    } else {
      window.history.back();
    }
  }, [currentMenuId]);

  // Handle browser back swipe/button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state === "object") {
        setActiveTileId(state.activeTileId !== undefined ? state.activeTileId : null);
        setCurrentMenuId(state.currentMenuId !== undefined ? state.currentMenuId : null);
        setIsAboutOpen(!!state.isAboutOpen);
        setIsPromptOpen(!!state.isPromptOpen);
        if (state.activeTileId) {
          const leafTiles = tiles.filter(t => !t.isDir);
          const idx = leafTiles.findIndex(t => t.id === state.activeTileId);
          if (idx !== -1) {
            setFocusedTileIndex(idx);
          }
        }
      } else {
        const path = window.location.pathname.replace(/^\//, "");
        const validTileIds = ["emotions", "who_starts", "themes", "timer", "scenarios", "locations", "eras", "characters", "constraints", "echauffements", "docs", "hiha", "feedback", "animals", "objects"];
        const validDirs = ["incarnate", "inspiration", "warmup"];
        if (validTileIds.includes(path)) {
          setActiveTileId(path);
          setCurrentMenuId(tiles.find(t => t.id === path)?.menu || null);
        } else if (validDirs.includes(path)) {
          setActiveTileId(null);
          setCurrentMenuId(path);
        } else {
          setActiveTileId(null);
          setCurrentMenuId(null);
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
    const validTileIds = ["emotions", "who_starts", "themes", "timer", "scenarios", "locations", "eras", "characters", "constraints", "echauffements", "docs", "hiha", "feedback", "animals", "objects"];
    const validDirs = ["incarnate", "inspiration", "warmup"];
    if (validTileIds.includes(path)) {
      setActiveTileId(path);
      const menuId = tiles.find(t => t.id === path)?.menu || null;
      setCurrentMenuId(menuId);
      window.history.replaceState({
        activeTileId: path,
        currentMenuId: menuId,
        isAboutOpen: false,
        isPromptOpen: false,
        isRegenerating: false
      }, "", `/${path}`);
    } else if (validDirs.includes(path)) {
      setActiveTileId(null);
      setCurrentMenuId(path);
      window.history.replaceState({
        activeTileId: null,
        currentMenuId: path,
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
      // Bypass shortcuts if the user is typing in any input field (except Esc to blur)
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.getAttribute("contenteditable") === "true"
      );

      // Esc logic for search bar focus escape
      if ((e.key === "Escape" || e.key === "Esc") && activeEl === searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.blur();
        setSearchQuery("");
        setIsSearchOpen(false);
        return;
      }

      if (isTyping) {
        return;
      }

      // Check key (case insensitive for letters)
      const key = e.key.toLowerCase();

      // 1. Focus Search Bar on '/'
      if (e.key === "/" && activeTileId === null) {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
        return;
      }

      // 2. Modals & Detail Navigation (Back / Left Arrow / Escape)
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

      // 3. "a" or "i" is About Modal toggle
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

      // 4. "g" is Regen trigger
      if (key === "g") {
        e.preventDefault();
        triggerRegen(devMode);
        return;
      }

      // 5. "m" is Feedback panel shortcut
      if (key === "m") {
        e.preventDefault();
        setIsPrivacyOpen(false);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        const feedbackTile = tiles.find(t => t.id === "feedback");
        if (feedbackTile) handleSelectTile(feedbackTile);
        return;
      }

      // 6. "h" is HiHa rules shortcut
      if (key === "h") {
        e.preventDefault();
        setIsPrivacyOpen(false);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        const hihaTile = tiles.find(t => t.id === "hiha");
        if (hihaTile) handleSelectTile(hihaTile);
        return;
      }

      // 7. "d" is Dev Mode toggle
      if (key === "d") {
        e.preventDefault();
        handleDevModeChange(!devMode);
        return;
      }

      // 8. "p" is Prompt Modal toggle (in Dev Mode only)
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

      // 9. "?" is Help & Guide panel shortcut
      if (e.key === "?") {
        e.preventDefault();
        setIsPrivacyOpen(false);
        setIsAboutOpen(false);
        setIsPromptOpen(false);
        const docsTile = tiles.find(t => t.id === "docs");
        if (docsTile) handleSelectTile(docsTile);
        return;
      }

      // 10. Arrow grid/navigation
      if (activeTileId === null) {
        // Dashboard mode: navigate renderedTiles in grid
        if (isAboutOpen || isPromptOpen || isPrivacyOpen || renderedTiles.length === 0) return;

        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev - 2 + renderedTiles.length) % renderedTiles.length);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev + 2) % renderedTiles.length);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev - 1 + renderedTiles.length) % renderedTiles.length);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setFocusedTileIndex((prev) => (prev + 1) % renderedTiles.length);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (renderedTiles[focusedTileIndex]) {
            handleSelectTile(renderedTiles[focusedTileIndex]);
          }
        }
      } else {
        // Detail view mode: navigate only leaf tiles with arrows
        if (isAboutOpen || isPromptOpen || isPrivacyOpen) return;

        const leafTiles = tiles.filter(t => !t.isDir);
        const currentIdx = leafTiles.findIndex((t) => t.id === activeTileId);
        if (currentIdx !== -1) {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            const nextIdx = (currentIdx + 1) % leafTiles.length;
            setActiveTileId(leafTiles[nextIdx].id);
            setFocusedTileIndex(nextIdx);
            window.history.replaceState({
              activeTileId: leafTiles[nextIdx].id,
              currentMenuId: leafTiles[nextIdx].menu || null,
              isAboutOpen: false,
              isPromptOpen: false,
              isRegenerating: false
            }, "", `/${leafTiles[nextIdx].id}`);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            const prevIdx = (currentIdx - 1 + leafTiles.length) % leafTiles.length;
            setActiveTileId(leafTiles[prevIdx].id);
            setFocusedTileIndex(prevIdx);
            window.history.replaceState({
              activeTileId: leafTiles[prevIdx].id,
              currentMenuId: leafTiles[prevIdx].menu || null,
              isAboutOpen: false,
              isPromptOpen: false,
              isRegenerating: false
            }, "", `/${leafTiles[prevIdx].id}`);
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
    currentMenuId,
    renderedTiles,
    isAboutOpen,
    isPromptOpen,
    isPrivacyOpen,
    focusedTileIndex,
    devMode,
    isSearchOpen,
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
        return (
          <DocsView
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenAbout={openAbout}
            tiles={tiles}
          />
        );
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
      case "animals":
        return (
          <GenericGenerator
            categoryKey="animals"
            title="Animaux"
            pickItem={pickItem}
            itemsPool={(reservoirPool as any).animals || []}
          />
        );
      case "objects":
        return (
          <GenericGenerator
            categoryKey="objects"
            title="Objets"
            pickItem={pickItem}
            itemsPool={(reservoirPool as any).objects || []}
          />
        );
      case "feedback":
        return <FeedbackView showToast={showToast} onOpenPrivacy={() => setIsPrivacyOpen(true)} />;
      default:
        return null;
    }
  };

  // Determine dynamic Hero section header text based on submenu state
  const getHeroText = () => {
    if (searchQuery.trim() !== "") {
      return {
        title: "Recherche",
        subtitle: `Résultats pour "${searchQuery}"`
      };
    }
    switch (currentMenuId) {
      case "incarnate":
        return {
          title: "Incarner",
          subtitle: "Donnez vie à vos personnages, émotions, animaux ou objets."
        };
      case "inspiration":
        return {
          title: "Inspiration",
          subtitle: "Explorez des thèmes, des lieux, des époques ou des scénarios."
        };
      case "warmup":
        return {
          title: "S'échauffer",
          subtitle: "Échauffements physiques, contraintes de jeu et règles collectives."
        };
      default:
        return {
          title: "Prêt pour l'impro ?",
          subtitle: "Choisissez un outil pour propulser votre prochaine scène théâtrale."
        };
    }
  };

  const heroText = getHeroText();

  return (
    <main className="relative h-full w-full overflow-hidden bg-black flex flex-col justify-between">

      {/* Toast Alert */}
      <ToastAlert message={toastMessage} />

      {/* 1. Main Dashboard Mode */}
      <div
        className={`dashboard-container transition-all duration-500 ease-out z-10 flex flex-col h-full overflow-y-auto ${
          activeTileId !== null ? "opacity-0 scale-95 pointer-events-none translate-y-4 invisible" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <header className="dashboard-header shrink-0">
          <div className="flex items-center gap-3 min-h-[32px]">
            {currentMenuId ? (
              <button
                onClick={() => handleSelectTile({ id: "back_to_root" } as any)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-all text-xs z-30 shrink-0 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-irised-gradient irised-glow animate-pulse-slow flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <h1 suppressHydrationWarning className="font-bold tracking-[0.15em] text-lg uppercase bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                  Houba Houba<span style={{ display: 'inline-block', marginLeft: '-0.15em' }}>!</span>
                </h1>
              </>
            )}
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
            {/* Search Button */}
            <button
              onClick={() => {
                setIsSearchOpen(prev => !prev);
                if (!isSearchOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                } else {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all ${
                isSearchOpen ? "text-purple-400 border-purple-500/30" : "text-zinc-400 hover:text-white"
              }`}
              title="Rechercher un outil"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => triggerRegen(true)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="Générer 500 suggestions neuves via l'IA (Gemini) dans le réservoir local"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={openAbout}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="À propos"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="dashboard-hero shrink-0">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            {heroText.title}
          </h2>
          <p className="text-zinc-500 text-sm">
            {heroText.subtitle}
          </p>
        </section>

        {/* Spotlight-style Search Bar (Only visible when toggled open) */}
        {isSearchOpen && (
          <div className="relative max-w-md w-full mx-auto mb-5 px-6 shrink-0 animate-fade-in">
            <div className="relative flex items-center bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-xl focus-within:border-zinc-700 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-300">
              <Search className="w-4 h-4 text-zinc-500 ml-3 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher un outil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-zinc-100 text-sm py-2.5 pl-2 pr-10 placeholder-zinc-500 focus:ring-0"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Vider la recherche"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <kbd className="absolute right-3 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono text-zinc-500 bg-zinc-950/60 select-none">
                  /
                </kbd>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Tile Grid */}
        <section className="grid grid-cols-2 gap-3 w-full max-w-md md:max-w-sm mx-auto px-6 pb-6 landscape:my-4">
          {renderedTiles.map((tile, index) => {
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
              else if (tile.id === "animals") suggestionCount = buffer.animals?.length ?? 0;
              else if (tile.id === "objects") suggestionCount = buffer.objects?.length ?? 0;
            }

            const isFeedback = tile.id === "feedback";
            const isBack = tile.id === "back_to_root";

            return (
              <button
                key={tile.id}
                onClick={() => handleSelectTile(tile)}
                onMouseEnter={() => setFocusedTileIndex(index)}
                className={`dashboard-tile relative ${isFeedback ? "col-span-2 min-h-[96px]" : "aspect-square"} ${focusedTileIndex === index ? "focused" : ""} ${isBack ? "back-tile" : ""}`}
              >
                {suggestionCount !== null && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-mono text-zinc-500/80 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-800/30 select-none z-10 animate-fade-in" title="Suggestions restantes">
                    {suggestionCount}
                  </span>
                )}
                {tile.isDir && (
                  <span className="absolute top-2.5 right-2.5 text-[8px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/30 select-none z-10 flex items-center gap-1">
                    <Folder className="w-2.5 h-2.5" />
                    <span>Dossier</span>
                  </span>
                )}
                <div className={`dashboard-tile-inner ${isFeedback ? "flex-row items-center gap-4 text-left" : "flex-col"} ${isBack ? "back-tile-inner" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 ${isFeedback ? "mb-0" : "mb-2.5"} ${isBack ? "bg-zinc-800/60" : ""}`}>
                    <Icon className={`w-5 h-5 text-white/90 shrink-0 ${isBack ? "text-zinc-300" : ""}`} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`text-lg md:text-base font-semibold text-zinc-100 tracking-wide leading-snug ${isBack ? "text-zinc-300" : ""}`}>
                      <span className="break-words line-clamp-2 hyphens-auto">
                        {tile.title}
                      </span>
                    </h3>
                    <p className={`text-sm md:text-xs text-zinc-400 font-light mt-1 ${isBack ? "text-zinc-500" : ""}`}>
                      {tile.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          {renderedTiles.length === 0 && (
            <div className="col-span-2 py-8 text-center text-zinc-500 text-sm">
              Aucun outil ne correspond à votre recherche.
            </div>
          )}
        </section>

        {/* Dev Prompt Inspector Button */}
        {devMode && (
          <button
            onClick={openPrompt}
            className="mx-auto my-4 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-semibold active:scale-95 transition-all hover:text-white flex items-center gap-1.5 animate-fade-in shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Consulter le Prompt Système
          </button>
        )}

        {/* Footer */}
        <footer className="dashboard-footer shrink-0">
          <div>Houba Houba!</div>
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
              onClick={() => triggerRegen(true, activeTileId || undefined)}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="Générer 50 suggestions neuves via l'IA (Gemini) pour cette catégorie"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={openAbout}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition-all hover:text-white"
              title="À propos"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Central Dynamic Content Area */}
        <div className={`flex-1 min-h-0 flex flex-col items-center my-6 max-w-md mx-auto w-full relative overflow-y-auto px-1 ${
          activeTileId === "timer" ? "justify-start" : "justify-center"
        }`}>
          {renderActiveComponent()}
        </div>

        {/* Detail Footer */}
        <footer className="text-center py-4 border-t border-zinc-900/60 w-full flex flex-col items-center justify-center gap-1 select-none shrink-0">
          <div suppressHydrationWarning className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-zinc-300">
            Houba Houba<span style={{ display: 'inline-block', marginLeft: '-0.2em' }}>!</span>
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

      {/* Toast Alert */}
      <ToastAlert message={toastMessage} />

      {/* Feedback Toast Banner */}
      {showFeedbackToast && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50 p-[1.5px] rounded-2xl bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 shadow-2xl animate-toast-up select-none">
          <div className="bg-zinc-950/95 backdrop-blur-md p-4 rounded-[14px] flex items-start justify-between gap-3 text-zinc-100">
            <div className="flex-1">
              <h4 className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-widest mb-1.5">
                Votre avis compte ! 🌟
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                Vous utilisez l'application depuis un moment. Avez-vous des suggestions pour l'améliorer ?
              </p>
              <button
                onClick={handleFeedbackClick}
                className="mt-3 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md shadow-cyan-950/30"
              >
                Donner mon avis
              </button>
            </div>
            <button
              onClick={dismissFeedbackToast}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
