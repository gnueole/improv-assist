"use client";

/**
 * @file DocsView.tsx
 * @description View showing documentation details, PWA installation instructions for iOS and Android,
 * and a summary list of all features included in the application.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Info, Download, Type, ShieldCheck } from "lucide-react";

interface DocsViewProps {
  onOpenPrivacy: () => void;
}

export default function DocsView({ onOpenPrivacy }: DocsViewProps) {
  const [textScale, setTextScale] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("docs-text-scale");
    if (saved) {
      setTextScale(parseInt(saved, 10));
    }
  }, []);

  const changeScale = (newScale: number) => {
    setTextScale(newScale);
    localStorage.setItem("docs-text-scale", newScale.toString());
  };

  const getFontSizeClasses = (scale: number) => {
    switch (scale) {
      case 1:
        return {
          base: "text-base sm:text-lg",
          small: "text-sm sm:text-base",
        };
      case 2:
        return {
          base: "text-lg sm:text-xl",
          small: "text-base sm:text-lg",
        };
      case 3:
        return {
          base: "text-xl sm:text-2xl",
          small: "text-lg sm:text-xl",
        };
      case 4:
        return {
          base: "text-2xl sm:text-3xl",
          small: "text-xl sm:text-2xl",
        };
      case 0:
      default:
        return {
          base: "text-sm sm:text-base",
          small: "text-xs sm:text-sm",
        };
    }
  };

  const fonts = getFontSizeClasses(textScale);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-180px)] max-w-md mx-auto relative px-2">
      {/* Font Size Adjuster Control Bar */}
      <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 mb-3 backdrop-blur-md shrink-0 w-full">
        <div className="flex items-center gap-2 text-zinc-400">
          <Type className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Taille du texte</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changeScale(Math.max(0, textScale - 1))}
            disabled={textScale === 0}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center justify-center font-bold text-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
            title="Diminuer la taille"
          >
            A-
          </button>
          <button
            onClick={() => changeScale(Math.min(4, textScale + 1))}
            disabled={textScale === 4}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center justify-center font-bold text-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
            title="Augmenter la taille"
          >
            A+
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className={`space-y-4 animate-fade-in text-zinc-200 ${fonts.base}`}>

          {/* Install PWA section */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Mode Hors-ligne / PWA</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Cette application est conçue pour fonctionner <strong>100% hors-ligne</strong> (sans réseau) dans les théâtres et les salles de répétition.
            </p>
            <div className={`mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/50 space-y-1.5 text-zinc-300 ${fonts.small}`}>
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

          {/* Raccourcis Clavier PC */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
              <span className="text-cyan-400">⌨️</span>
              <span>Raccourcis Clavier (PC)</span>
            </div>
            <p className="text-zinc-300 leading-relaxed mb-3">
              Utilisez les raccourcis suivants sur ordinateur pour naviguer rapidement :
            </p>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/50 ${fonts.small} font-mono`}>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">← / → / ↑ / ↓</span>
                <span className="text-right text-zinc-300">Naviguer</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">Espace / Entrée</span>
                <span className="text-right text-zinc-300">Valider / Tirer</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">Échap / ←</span>
                <span className="text-right text-zinc-300">Retour / Fermer</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">A / I</span>
                <span className="text-right text-zinc-300">À propos</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">G</span>
                <span className="text-right text-zinc-300">Régénérer</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">M</span>
                <span className="text-right text-zinc-300">Formulaire retour</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">H</span>
                <span className="text-right text-zinc-300">Règles Hi Ha</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">?</span>
                <span className="text-right text-zinc-300">Aide & Guide</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">D</span>
                <span className="text-right text-zinc-300">Mode DEV</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span className="text-cyan-400">P</span>
                <span className="text-right text-zinc-300">Consulter Prompt</span>
              </div>
            </div>
          </div>

          {/* Concept du Réservoir & IA */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
              <span className="text-amber-400">⚡</span>
              <span>Concept de Réservoir & IA</span>
            </div>
            <div className="space-y-2 text-zinc-300 leading-relaxed">
              <p>
                Pour garantir des tirages uniques, chaque outil pioche dans un <strong>réservoir local (Data Pool)</strong>. Chaque suggestion obtenue est temporairement retirée de la liste afin d'<strong>éviter les doublons</strong>.
              </p>
              <p>
                Le bouton de <strong>régénération par l'IA</strong> (flèches rotatives en haut à droite) permet de recharger ce réservoir avec de nouvelles idées fraîches générées par Gemini.
              </p>
              <div className={`mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/50 space-y-1.5 text-zinc-300 ${fonts.small}`}>
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
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Suggère une émotion de jeu aléatoire accompagnée d'un curseur d'intensité de <strong>1 à 10</strong>. Ce niveau de performance pousse les acteurs à nuancer ou à exagérer leur état psychologique.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                Qui Commence ? (Multi-touch)
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Idéal pour désigner l'initiateur d'une scène. Posez jusqu'à 5 doigts sur l'écran. Après 3 secondes de décompte, le gagnant s'affiche en vert vif avec un effet haptique.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                Suggestions de Lieu & Époque
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Des idées créatives instantanées pour planter le décor physique (salon de coiffure, sous-marin) et temporel (Moyen Âge, an 3000, années 80) de vos histoires.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Timer de Scène
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Un chronomètre préréglé sur 2 minutes 30 secondes (durée standard d'improvisation). Lorsque le temps est écoulé, le message dynamique <strong>« Hey ! Impro ! »</strong> signale la fin.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Thèmes d'Impro
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Une sélection de sujets courts poétiques ou comiques pour servir de fil conducteur ou d'inspiration pour vos improvisations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                Scénarios
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Des situations de départ et intrigues dramatiques ou comiques pour amorcer les scènes avec un enjeu immédiat.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Échauffements
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Des exercices de préparation physique, mentale et vocale pour se mettre en condition de jeu individuellement ou collectivement.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="space-y-1">
              <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Retour & Idées
              </h4>
              <p className={`text-zinc-300 pl-3.5 leading-normal ${fonts.base}`}>
                Un formulaire de feedback direct permettant aux utilisateurs d'envoyer des demandes, suggestions ou observations pour améliorer l'application.
              </p>
            </div>
          </div>

          {/* GDPR / Privacy card */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-100 font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protection des Données & RGPD</span>
            </div>
            <p className="text-zinc-355 text-sm leading-relaxed">
              Vos données personnelles (nom, email, commentaires, score) sont traitées avec soin et en stricte conformité avec la réglementation européenne RGPD.
            </p>
            <button
              onClick={onOpenPrivacy}
              className="mt-3 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 active:scale-95 transition-all text-xs font-semibold"
            >
              Consulter la Politique de Confidentialité
            </button>
          </div>

          {/* About / Credits */}
          <div className={`p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md flex items-start gap-3 text-zinc-300 leading-relaxed ${fonts.base}`}>
            <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              Conçu et optimisé par <strong>Éole</strong> pour les troupes de théâtre d'improvisation. Version active : 0.4 BETA. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
