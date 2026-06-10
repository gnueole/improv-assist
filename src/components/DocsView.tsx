"use client";

/**
 * @file DocsView.tsx
 * @description View showing documentation details, PWA installation instructions for iOS and Android,
 * and a summary list of all features included in the application.
 */

import React from "react";
import { SlidersHorizontal, Info, Download } from "lucide-react";

export default function DocsView() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-180px)] max-w-md mx-auto relative px-2">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="space-y-4 animate-fade-in text-zinc-300 text-sm sm:text-base">
          
          {/* Install PWA section */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Mode Hors-ligne / PWA</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Cette application est conçue pour fonctionner <strong>100% hors-ligne</strong> (sans réseau) dans les théâtres et les salles de répétition.
            </p>
            <div className="mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/50 text-xs sm:text-sm space-y-1.5 text-zinc-400">
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

          {/* Concept du Réservoir & IA */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
              <span className="text-amber-400">⚡</span>
              <span>Concept de Réservoir & IA</span>
            </div>
            <div className="space-y-2 text-zinc-400 leading-relaxed text-xs sm:text-sm">
              <p>
                Pour garantir des tirages uniques, chaque outil pioche dans un <strong>réservoir local (Data Pool)</strong>. Chaque suggestion obtenue est temporairement retirée de la liste afin d'<strong>éviter les doublons</strong>.
              </p>
              <p>
                Le bouton de <strong>régénération par l'IA</strong> (flèches rotatives en haut à droite) permet de recharger ce réservoir avec de nouvelles idées fraîches générées par Gemini.
              </p>
              <div className="mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/50 text-[11px] space-y-1 text-zinc-400">
                <span className="text-red-400 font-bold block mb-1">⚠️ Limite de jetons (Tokens) :</span>
                <p>
                  Ne rechargez pas le réservoir trop souvent ! Une utilisation excessive consommera l'intégralité des jetons gratuits de l'API, bloquant la génération (indiqué par le voyant de connexion <strong>rouge</strong>).
                </p>
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
              <p className="text-xs sm:text-sm text-zinc-400 pl-3.5 leading-normal">
                Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de <strong>1 à 10</strong>. Ce niveau de performance pousse les acteurs à nuancer ou à exagérer leur état psychologique.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                Qui Commence ? (Multi-touch)
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 pl-3.5 leading-normal">
                Idéal pour désigner l'initiateur d'une scène. Posez jusqu'à 5 doigts sur l'écran. Après 3 secondes de décompte, le gagnant s'affiche en vert vif avec un effet haptique.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                Suggestions de Lieu & Époque
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 pl-3.5 leading-normal">
                Des idées créatives instantanées pour planter le décor physique (salon de coiffure, sous-marin) et temporel (Moyen Âge, an 3000, années 80) de vos histoires.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Timer de Scène
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 pl-3.5 leading-normal">
                Un chronomètre préréglé sur 2 minutes 30 secondes (durée standard d'improvisation). Lorsque le temps est écoulé, le message dynamique <strong>« Hey ! Impro ! »</strong> signale la fin.
              </p>
            </div>
          </div>

          {/* About / Credits */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md flex items-start gap-3 text-zinc-400 text-xs sm:text-sm leading-relaxed">
            <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              Conçu et optimisé par <strong>Éole</strong> pour les troupes de théâtre d'improvisation. Version active : Beta 1. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
