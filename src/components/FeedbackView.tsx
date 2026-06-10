"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

interface FeedbackViewProps {
  showToast: (msg: string) => void;
}

export default function FeedbackView({ showToast }: FeedbackViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<"Demande" | "Suggestion" | "Observation">("Suggestion");
  const [comment, setComment] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      showToast("Veuillez remplir les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const webhookUrl = "https://n8n.eole.me/webhook/improv-feedback";
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          type: feedbackType,
          comment: comment.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setIsSuccess(true);
      showToast("Feedback envoyé avec succès ! Merci 🐸");
      // Reset form
      setName("");
      setEmail("");
      setFeedbackType("Suggestion");
      setComment("");
    } catch (err) {
      console.error("[Feedback Submit Error]:", err);
      setErrorMessage("Impossible d'envoyer le feedback pour le moment. Veuillez réessayer.");
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
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all text-xs font-semibold"
        >
          Envoyer un autre retour
        </button>
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
