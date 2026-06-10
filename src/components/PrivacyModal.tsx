"use client";

/**
 * @file PrivacyModal.tsx
 * @description Modal dialog overlay showing the GDPR compliant Privacy Policy for Houba Houba !
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React from "react";
import { ShieldCheck, Mail, ShieldAlert, KeyRound, CalendarDays, ClipboardList } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fade-in">
      <div className="irised-border-wrapper w-full max-w-lg">
        <div className="irised-border-inner p-6 flex flex-col justify-between max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-4 shrink-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-wide uppercase">
                Politique de Confidentialité
              </h3>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
                Conformité RGPD • Houba Houba !
              </p>
            </div>
          </div>

          {/* Scrollable Policy Body */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-left text-xs text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
            <p>
              Bienvenue sur <strong>Houba Houba !</strong> (Impro Assist). Nous accordons une importance primordiale à la protection de vos données personnelles et au respect du Règlement Général sur la Protection des Données (RGPD).
            </p>

            {/* Section 1: Collecte */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                1. Données collectées
              </h4>
              <p>
                Lorsque vous utilisez notre formulaire de retour, nous collectons :
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-400">
                <li><strong className="text-zinc-350">Nom / Pseudo</strong> (obligatoire) : pour identifier l'auteur du retour.</li>
                <li><strong className="text-zinc-350">Adresse e-mail</strong> (facultative) : uniquement si vous souhaitez être recontacté.</li>
                <li><strong className="text-zinc-350">Type de retour</strong> (obligatoire) : Demande, Suggestion ou Observation.</li>
                <li><strong className="text-zinc-350">Note d'évaluation</strong> (obligatoire, de 1 à 5 étoiles) : pour mesurer la satisfaction globale.</li>
                <li><strong className="text-zinc-350">Message / Commentaire</strong> (obligatoire) : la description de votre suggestion ou bug.</li>
              </ul>
              <p className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span>🛡️</span>
                <span>Aucune de ces données n'est partagée ou transmise à des tiers.</span>
              </p>
            </div>

            {/* Section 2: Finalités */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                2. Pourquoi ces données ? (Finalités)
              </h4>
              <p>
                Le traitement de ces informations a pour but exclusif de :
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-400">
                <li>Analyser les retours utilisateurs afin d'améliorer l'application.</li>
                <li>Résoudre les bugs ou incidents signalés.</li>
                <li>Échanger avec vous sur vos suggestions (si l'adresse e-mail est fournie).</li>
              </ul>
            </div>

            {/* Section 3: Base légale */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                3. Base légale du traitement
              </h4>
              <p>
                La base légale de ce traitement est votre <strong>consentement explicite</strong>, matérialisé par la case à cocher obligatoire avant l'envoi du formulaire. Vous pouvez retirer votre consentement à tout moment.
              </p>
            </div>

            {/* Section 4: Conservation */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                <CalendarDays className="w-3.5 h-3.5 text-pink-400" />
                4. Durée de conservation
              </h4>
              <p>
                Les données de retour sont conservées pour une durée maximale de <strong>12 mois</strong> après leur réception. Au-delà, elles sont définitivement supprimées ou anonymisées de nos bases.
              </p>
            </div>

            {/* Section 5: Sécurité et Destinataires */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                5. Sécurité et transmission
              </h4>
              <p>
                Vos données sont transmises de manière sécurisée en transit (chiffrement <strong>HTTPS</strong>). Elles transitent via notre passerelle sécurisée <strong>n8n</strong> et sont stockées dans une base de données privée et sécurisée sur <strong>Notion</strong>. Seul le développeur principal de l'application y a accès. Aucune donnée n'est cédée ou vendue à des tiers.
              </p>
            </div>

            {/* Section 6: Vos Droits */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                6. Vos Droits
              </h4>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de limitation et d'effacement de vos données personnelles.
              </p>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/30 text-cyan-400">
              <Mail className="w-4 h-4 shrink-0" />
              <span>
                Pour exercer vos droits, contactez Éole à : <a href="mailto:hi@eole.me" className="underline font-bold hover:text-cyan-300">hi@eole.me</a>
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 mt-4 rounded-xl bg-zinc-100 hover:bg-white text-black text-sm font-semibold active:scale-95 transition-all shrink-0"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
