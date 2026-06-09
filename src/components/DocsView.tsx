"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, Search, SlidersHorizontal, Layers, CheckCircle, Info, Download, HelpCircle } from "lucide-react";
import notionConstraints from "@/data/notionConstraints.json";

interface Constraint {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function DocsView() {
  const [activeTab, setActiveTab] = useState<"docs" | "constraints">("docs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");

  const categories = useMemo(() => {
    const cats = new Set(notionConstraints.map((c) => c.category));
    return ["Toutes", ...Array.from(cats)];
  }, []);

  const filteredConstraints = useMemo(() => {
    return notionConstraints.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Toutes" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-180px)] max-w-md mx-auto relative px-2">
      
      {/* Navigation Tabs */}
      <div className="flex w-full gap-2 p-1 bg-zinc-900 border border-zinc-800/80 rounded-2xl text-xs mb-4">
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex-1 py-2 rounded-xl transition-all font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === "docs"
              ? "bg-zinc-800 text-white shadow-md shadow-black/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Aide & Guide
        </button>
        <button
          onClick={() => setActiveTab("constraints")}
          className={`flex-1 py-2 rounded-xl transition-all font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === "constraints"
              ? "bg-zinc-800 text-white shadow-md shadow-black/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Contraintes ({notionConstraints.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* Tab 1: App Documentation */}
        {activeTab === "docs" && (
          <div className="space-y-4 animate-fade-in text-zinc-300 text-xs sm:text-sm">
            
            {/* Install PWA section */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Mode Hors-ligne / PWA</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Cette application est conçue pour fonctionner <strong>100% hors-ligne</strong> (sans réseau) dans les théâtres et les salles de répétition.
              </p>
              <div className="mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/50 text-[11px] space-y-1.5 text-zinc-400">
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400">iOS:</span>
                  <span>Ouvrez dans Safari &rarr; bouton Partager &rarr; <strong>Sur l'écran d'accueil</strong>.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400">Android:</span>
                  <span>Ouvrez dans Chrome &rarr; bouton Menu (3 points) &rarr; <strong>Installer l'application</strong>.</span>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 text-zinc-100 font-bold border-b border-zinc-800 pb-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>Fonctionnalités incluses</span>
              </div>

              {/* Feature 1 */}
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  Générateur d'Émotions
                </h4>
                <p className="text-[11px] text-zinc-400 pl-3.5 leading-normal">
                  Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de <strong>1 à 10</strong>. Ce niveau de performance pousse les acteurs à nuancer ou à exagérer leur état psychologique.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                  Qui Commence ? (Multi-touch)
                </h4>
                <p className="text-[11px] text-zinc-400 pl-3.5 leading-normal">
                  Idéal pour désigner l'initiateur d'une scène. Posez jusqu'à 5 doigts sur l'écran. Après 3 secondes de décompte, le gagnant s'affiche en vert vif avec un effet haptique.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                  Suggestions de Lieu & Époque
                </h4>
                <p className="text-[11px] text-zinc-400 pl-3.5 leading-normal">
                  Des idées créatives instantanées pour planter le décor physique (salon de coiffure, sous-marin) et temporel (Moyen Âge, an 3000, années 80) de vos histoires.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Timer de Scène
                </h4>
                <p className="text-[11px] text-zinc-400 pl-3.5 leading-normal">
                  Un chronomètre préréglé sur 2 minutes 30 secondes (durée standard d'improvisation). Lorsque le temps est écoulé, le message dynamique <strong>« Et Iiiiiiimpro ! »</strong> signale la fin.
                </p>
              </div>
            </div>

            {/* About / Credits */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md flex items-start gap-3 text-zinc-400 text-[11px] leading-relaxed">
              <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                Conçu et optimisé par <strong>Éole Labs</strong> pour les troupes de théâtre d'improvisation. Version active : Alpha 1. Tous droits réservés.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Improv Constraints Explorer */}
        {activeTab === "constraints" && (
          <div className="space-y-4 animate-fade-in flex flex-col h-full">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher une contrainte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all shrink-0 border ${
                    selectedCategory === cat
                      ? "bg-zinc-100 text-black border-zinc-100 font-bold"
                      : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Constraints List */}
            <div className="space-y-2.5">
              {filteredConstraints.length > 0 ? (
                filteredConstraints.map((constraint) => (
                  <div
                    key={constraint.id}
                    className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-zinc-100">{constraint.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-zinc-850 border border-zinc-800 text-[9px] uppercase tracking-wider text-zinc-400 font-medium">
                        {constraint.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      {constraint.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  Aucune contrainte trouvée pour votre recherche.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
