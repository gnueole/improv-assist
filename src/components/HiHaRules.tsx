"use client";

import React from "react";

export default function HiHaRules() {
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
      note: "Interdiction formelle de renvoyer ('zapper') à son 'parent' (celui qui vient de nous zapper), sous peine d'élimination."
    },
    {
      name: "Je laisse / Je prends",
      command: "Je laisse... (N'importe qui peut dire : Je prends !)",
      action: "Un joueur refuse la boule en disant 'Je laisse'. Un autre joueur doit la récupérer au vol en criant 'Je prends'.",
      note: "Celui qui prend doit impérativement indiquer de la main le sens d'origine de la boule, sous peine d'élimination."
    },
    {
      name: "Vade Retro",
      command: "Vade Retro !",
      action: "Bras tendus croisés en forme de croix devant soi. Les 3 joueurs suivants passent successivement par 'Sa', 'Ta', puis 'Nas' (Satanas).",
      note: "Le joueur 'Ta' (+2) doit désigner un joueur sans hésiter (pas de 'euh...') ni se tromper (éliminatoire). L'appelé doit répondre 'Je brûle' pour continuer."
    },
    {
      name: "Honki Tonk",
      command: "Honki Tonk !",
      action: "Mouvement d'avant-arrière avec les mains jointes l'une contre l'autre. Les 2 joueurs précédents pointent leurs bras vers lui en criant 'Ouba Ouba'.",
      note: "Le joueur -2 (deux places avant) doit appeler une personne du cercle sans se tromper (éliminatoire), qui doit répondre 'Dring' pour continuer."
    }
  ];

  return (
    <div className="w-full flex flex-col h-[calc(100vh-180px)] max-w-md mx-auto relative px-2">
      {/* Liste des Signes */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 w-full">
        {rules.map((rule, index) => (
          <div
            key={index}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-xl transition-all active:scale-[0.99]"
          >
            {/* Titre et Commande */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-bold text-base text-white">{rule.name}</h2>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-1 bg-amber-950/40 text-amber-400 border border-amber-900/50 rounded-lg">
                {rule.command}
              </span>
            </div>

            {/* Corps */}
            <div className="text-sm text-neutral-300 leading-relaxed">
              <span className="text-neutral-500 font-medium block text-xs uppercase tracking-wider mb-0.5">Geste / Action</span>
              {rule.action}
            </div>

            {/* Note / Piège évitant l'élimination */}
            <div className="text-xs bg-neutral-950/60 text-neutral-400 p-2.5 rounded-lg border border-neutral-800/60 flex gap-2">
              <span className="text-amber-500 select-none">⚠️</span>
              <p className="italic">{rule.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}