"use client";

/**
 * @file HiHaRules.tsx
 * @description View showing the complete collective rules, voice commands, and gestures of EFIT® "Hi Ha" warming and reflex game.
 * Incorporates detailed rules transcribed from audio guidance.
 */

import React from "react";
import { ChevronLeft, Volume2, ShieldAlert, Sparkles } from "lucide-react";

interface HiHaRulesProps {
  onBack: () => void;
}

export default function HiHaRules({ onBack }: HiHaRulesProps) {
  const rules = [
    {
      name: "Hi Ha (Hia)",
      command: "Hia !",
      action: "Lancement de la boule d'énergie à un voisin direct (gauche ou droite) avec un geste de la main opposée.",
      note: "Le joueur qui envoie doit dire 'Hia'."
    },
    {
      name: "Hold-On",
      command: "Hold on !",
      action: "Mettre les bras au-dessus de la tête et tirer vers le bas comme pour actionner une corde.",
      note: "Cette action inverse le sens de rotation du cercle."
    },
    {
      name: "Ha HI (Ai)",
      command: "Ai !",
      action: "Placer les mains devant les yeux en formant des cercles (comme des lunettes) pour voir à travers.",
      note: "Fait sauter la boule d'énergie directement au deuxième joueur après soi dans le sens en cours."
    },
    {
      name: "Peter Pan",
      command: "Peter... (Tous : Pan !)",
      action: "[joueur] Main gauche formant une plume sur la tête, [tous] bras droit tendu comme un pistolet directionnel.",
      note: "Le joueur crie 'Peter' et tout le groupe doit crier 'Pan !' instantanément en même temps."
    },
    {
      name: "Hip Hip Hourra",
      command: "Hip Hip... (Tous : Hourra !)",
      action: "[joueur] Main droite levée bien haut avec deux doigts en l'air, puis [tous] rabaissement rapide vers le pied droit avancé.",
      note: "Le joueur dit 'Hip Hip' et l'ensemble du groupe doit crier 'Hourra !' en même temps."
    },
    {
      name: "Pop Corn",
      command: "Pop ! (Tous : Corn !)",
      action: "Le joueur qui reçoit la boule dit 'Pop'. Tout le groupe répond 'Corn'. Les joueurs font 'tut-tut-tut' et changent tous de place dans le cercle.",
      note: "Le jeu régulier reprend quand un joueur crie 'J'éclate'. Si personne ne le dit au bout de 5 minutes, le lanceur doit relancer le popcorn."
    },
    {
      name: "Zap",
      command: "Zap !",
      action: "Frottement des mains et mime d'envoi rapide vers n'importe quel joueur du cercle. Le destinataire doit dire 'Je prends' pour continuer.",
      note: "Interdiction formelle de renvoyer ('zapper') à son 'père' (celui qui vient de nous zapper), sous peine d'élimination."
    },
    {
      name: "Je laisse / Je prends",
      command: "Je laisse... (Tous : Je prends !)",
      action: "Un joueur refuse la boule en disant 'Je laisse'. Un autre joueur doit la récupérer au vol en criant 'Je prends'.",
      note: "Celui qui prend doit impérativement indiquer de la main le sens d'origine de la boule, sous peine d'élimination."
    },
    {
      name: "Vade Retro",
      command: "Vade Retro !",
      action: "Bras tendus croisés en forme de croix devant soi. Les 3 joueurs suivants disent successivement 'Sa', 'Ta', puis 'Nas' (Satanas).",
      note: "Le joueur 'Ta' doit désigner un joueur sans hésiter (pas de 'euh...') ni se tromper (éliminatoire). L'appelé doit répondre 'Je brûle' pour continuer."
    },
    {
      name: "Honki Tonk",
      command: "Honki Tonk !",
      action: "Mouvement d'avant-arrière avec les mains jointes l'une contre l'autre. Les 2 joueurs précédents pointent leurs bras vers lui en criant 'Ouba Ouba'.",
      note: "Le joueur -2 (deux places avant) doit appeler une personne du cercle sans se tromper (éliminatoire), qui doit répondre 'Dring' pour continuer."
    }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between items-center gap-4 overflow-y-auto px-1 pb-4 max-h-[78vh] w-full">

      {/* Intro Header */}
      <div className="w-full text-center flex flex-col items-center gap-1.5 mb-2">
        <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
          Règles du Hia (EFIT)
        </h3>
        <p className="text-[10px] text-zinc-500 leading-normal max-w-xs">
          Warming-up et jeu de réflexes collectifs. Élimination en cas d'erreur de commande ou d'hésitation.
        </p>
      </div>

      {/* Rules Checklist */}
      <div className="w-full flex flex-col gap-3">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="flex flex-col p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md shadow-lg hover:border-zinc-700/80 transition-all duration-300"
          >
            {/* Rule Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold font-mono">
                  {idx + 1}
                </span>
                <span className="font-bold text-xs text-zinc-200 tracking-wide">
                  {rule.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10 text-[9px] font-semibold text-amber-400">
                <Volume2 className="w-3 h-3 text-amber-500" />
                <span>{rule.command}</span>
              </div>
            </div>

            {/* Gesture description */}
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light mb-2 pl-7">
              {rule.action}
            </p>

            {/* Rule Note / Penalties */}
            <div className="flex items-start gap-1.5 pl-7 text-[9px] text-zinc-500 font-light italic">
              <ShieldAlert className="w-3 h-3 text-zinc-600 mt-0.5 shrink-0" />
              <span>{rule.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-3 mb-2 flex flex-col gap-0.5">
        <p className="text-[9px] text-zinc-600 font-light">
          EFIT® est une marque déposée de l'École Française d'Improvisation Théâtrale.
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-2 hover:text-white hover:bg-zinc-800/40 mt-4 shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au menu
      </button>
    </div>
  );
}
