"use client";

import React, { useState, useRef } from "react";
import { Send, CheckCircle2, MessageSquare, AlertCircle, Star } from "lucide-react";

interface FeedbackViewProps {
  showToast: (msg: string) => void;
  onOpenPrivacy: () => void;
}

export default function FeedbackView({ showToast, onOpenPrivacy }: FeedbackViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<"Demande" | "Suggestion" | "Observation">("Suggestion");
  const [comment, setComment] = useState("");
  const [score, setScore] = useState<number>(5);
  const [isDragging, setIsDragging] = useState(false);
  const [consent, setConsent] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calculateScore = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = x / rect.width;
    const newScore = Math.max(1, Math.min(5, Math.ceil(pct * 5)));
    setScore(newScore);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    calculateScore(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      calculateScore(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const getScoreLabel = (s: number) => {
    switch (s) {
      case 1: return "Mauvais 😢";
      case 2: return "Bof 😕";
      case 3: return "Moyen 🙂";
      case 4: return "Très bon ! 👍";
      case 5:
      default:
        return "Excellent ! 🐸";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      showToast("Veuillez remplir les champs obligatoires.");
      return;
    }
    if (!consent) {
      showToast("Veuillez accepter la politique de confidentialité.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const apiUrl = "/api/feedback";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          type: feedbackType,
          comment: comment.trim(),
          score
        })
      });

      if (!response.ok) {
        let errorMsg = `Erreur HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }

      setIsSuccess(true);
      showToast("Feedback envoyé avec succès ! Merci 🐸");
      // Reset form
      setName("");
      setEmail("");
      setFeedbackType("Suggestion");
      setComment("");
      setScore(5);
      setConsent(false);
    } catch (err) {
      console.error("[Feedback Submit Error]:", err);
      setErrorMessage(err instanceof Error ? err.message : "Impossible d'envoyer le feedback pour le moment.");
      showToast("Erreur de transmission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md flex flex-col items-center text-center gap-4 animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] animate-pulse" />
        <h3 className="text-xl font-bold text-zinc-100">Merci beaucoup !</h3>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
          Votre retour a bien été envoyé. Vos observations et suggestions nous aident à améliorer Houba Houba !
        </p>
        <a
          href="index.html"
          className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-100 text-black hover:bg-white active:scale-95 transition-all text-xs font-semibold"
        >
          Je retourne improviser
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex flex-col gap-4 animate-fade-in overflow-y-auto max-h-[calc(100vh-200px)]"
    >
      <div className="flex items-center gap-2 text-zinc-300 border-b border-zinc-800/80 pb-2">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Formulaire de Retour</span>
      </div>

      {/* Name (Required) */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
          <span>Nom / Pseudo</span>
          <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Votre nom ou troupe..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
        />
      </div>

      {/* Email (Optional) */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-xs font-semibold text-zinc-400">
          Email <span className="text-zinc-600">(optionnel)</span>
        </label>
        <input
          type="email"
          placeholder="nom@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
        />
      </div>

      {/* Type of feedback */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-xs font-semibold text-zinc-400">
          Type de retour
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["Demande", "Suggestion", "Observation"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFeedbackType(type)}
              className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                feedbackType === type
                  ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/50 shadow-md shadow-cyan-950/20 font-semibold"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Star Rating (Swipeable) */}
      <div className="flex flex-col gap-1.5 text-left select-none">
        <label className="text-xs font-semibold text-zinc-400 flex justify-between items-center">
          <span>Note d'évaluation</span>
          <span className="text-zinc-500 text-[10px] font-normal italic">Glissez pour ajuster</span>
        </label>
        <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setIsDragging(false)}
          className={`flex flex-col items-center gap-2 py-3 px-4 bg-zinc-950 border rounded-xl cursor-ew-resize touch-none select-none transition-all duration-200 ${
            isDragging 
              ? "border-amber-500/50 shadow-md shadow-amber-950/20 bg-zinc-950/80" 
              : "border-zinc-800 bg-zinc-950/60"
          }`}
        >
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((index) => {
              const active = index <= score;
              return (
                <Star
                  key={index}
                  className={`w-7 h-7 transition-all duration-150 pointer-events-none ${
                    active
                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110"
                      : "text-zinc-750 fill-transparent"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 tracking-wide uppercase transition-all duration-300">
            {getScoreLabel(score)}
          </span>
        </div>
      </div>

      {/* Comment (Required) */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
          <span>Votre Message</span>
          <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Décrivez votre idée, observation ou besoin..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors h-24 resize-none"
        />
      </div>

      {/* GDPR Consent Explicit Checkbox */}
      <div className="flex items-start gap-2.5 text-left py-1">
        <input
          id="consent-checkbox"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="w-4 h-4 accent-cyan-500 rounded border-zinc-800 bg-zinc-950 mt-0.5 cursor-pointer shrink-0"
        />
        <label htmlFor="consent-checkbox" className="text-[10px] text-zinc-400 leading-snug cursor-pointer select-none">
          J'accepte que mes données soient traitées conformément à la{" "}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-cyan-400 underline hover:text-cyan-300 font-semibold inline"
          >
            Politique de Confidentialité
          </button>
          . <span className="text-red-400">*</span>
        </label>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2 text-xs text-red-400 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl bg-zinc-100 text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white text-sm mt-1"
      >
        <Send className="w-4 h-4" />
        <span>{isSubmitting ? "Transmission..." : "Envoyer le retour"}</span>
      </button>
    </form>
  );
}
