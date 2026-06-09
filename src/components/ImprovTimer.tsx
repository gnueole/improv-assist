"use client";

/**
 * @file ImprovTimer.tsx
 * @description Standard theatrical improvisation timer (preset to 2m30s). Features visual feedback,
 * audible bells (using Web Audio API synthesized tones), speech synthesis, custom duration adjustments,
 * and high-urgency animation transitions as time runs out.
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Minus, Bell, BellOff } from "lucide-react";

export default function ImprovTimer() {
  const BASE_DEFAULT = 150; // 2m30s
  const [targetDuration, setTargetDuration] = useState(BASE_DEFAULT);
  const [timeLeft, setTimeLeft] = useState(BASE_DEFAULT);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from LocalStorage after hydration
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("improv_default_duration");
      if (stored) {
        const val = parseInt(stored, 10);
        setTargetDuration(val);
        setTimeLeft(val);
      }

      // Warm up SpeechSynthesis voices list
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    }
  }, []);

  // Timer Tick Interval
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (soundEnabled && typeof window !== "undefined") {
              playBuzzerSound();
              speak("Hey ! Impro !", true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  // Web Speech API French Synthesis Helper
  const speak = (text: string, isFinal: boolean = false) => {
    if (!soundEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // cancel any ongoing speech

      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith("fr-FR")) || voices.find(v => v.lang.startsWith("fr"));

      if (isFinal) {
        // Split utterance to create prosody/vowel duration modification
        const utterance1 = new SpeechSynthesisUtterance("Hey !");
        utterance1.lang = "fr-FR";
        if (frenchVoice) utterance1.voice = frenchVoice;
        utterance1.rate = 0.9;    // Energetic, standard speed
        utterance1.pitch = 1.35;  // High pitch for excitement
        utterance1.volume = 1.0;

        const utterance2 = new SpeechSynthesisUtterance("Impro !");
        utterance2.lang = "fr-FR";
        if (frenchVoice) utterance2.voice = frenchVoice;
        utterance2.rate = 0.65;   // Slow down significantly to stretch the vowels naturally
        utterance2.pitch = 1.1;   // Confident final tone
        utterance2.volume = 1.0;

        window.speechSynthesis.speak(utterance1);
        window.speechSynthesis.speak(utterance2);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        if (frenchVoice) utterance.voice = frenchVoice;

        // Make it sound clear and projected ("douce qui porte fort")
        utterance.rate = 0.95; // clear, not too fast
        utterance.pitch = 1.0; // standard pitch
        utterance.volume = 1.0; // max volume

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech Synthesis failed to speak.", e);
    }
  };

  // Flash notifications and Speech announcements logic
  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 60) {
      setFlashMessage("1 minute restante !");
      speak("Il vous reste une minute !");
      const t = setTimeout(() => setFlashMessage(null), 2500);
      return () => clearTimeout(t);
    } else if (timeLeft === 30) {
      setFlashMessage("30 secondes restantes !");
      speak("Il vous reste trente secondes !");
      const t = setTimeout(() => setFlashMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [timeLeft, isRunning]);

  const playBuzzerSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("AudioContext blocked or unsupported.", e);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(targetDuration);
  };

  const adjustTargetDuration = (amount: number) => {
    setTargetDuration((prev) => {
      const newVal = Math.max(10, prev + amount);
      if (typeof window !== "undefined") {
        localStorage.setItem("improv_default_duration", newVal.toString());
      }
      setTimeLeft(newVal);
      return newVal;
    });
  };

  const resetToStandard = () => {
    setTargetDuration(BASE_DEFAULT);
    setTimeLeft(BASE_DEFAULT);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_default_duration", BASE_DEFAULT.toString());
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft > 0 && timeLeft <= 30;
  const isUrgentTime = timeLeft > 0 && timeLeft <= 10;
  const isFinished = timeLeft === 0;

  if (!isMounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <div className="text-zinc-500 text-xs tracking-widest animate-pulse uppercase">Initialisation...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 relative">

      {/* Big Toaster Flash Notification Overlay */}
      {flashMessage && (
        <div className="fixed top-16 left-4 right-4 max-w-sm mx-auto z-50 p-[1.5px] rounded-2xl bg-gradient-to-r from-cyan-500 via-magenta-500 to-purple-500 animate-toast shadow-2xl">
          <div className="bg-zinc-950/95 backdrop-blur-md rounded-[14.5px] py-4 px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-lg shadow-inner">
                {timeLeft === 60 ? "⏱️" : "⚠️"}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Attention</p>
                <h4 className="text-sm font-black text-white uppercase tracking-wide">
                  {flashMessage}
                </h4>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
        </div>
      )}

      {/* Sound Toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2 active:scale-95 transition-all hover:text-white"
      >
        {soundEnabled ? (
          <>
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sonnerie et voix activées</span>
          </>
        ) : (
          <>
            <BellOff className="w-3.5 h-3.5" />
            <span>Silencieux</span>
          </>
        )}
      </button>

      {/* Main Display Ring */}
      <div
        className={`generator-card transition-all duration-300 ${isUrgentTime ? "animate-pulse" : ""}`}
      >
        <div className={`generator-card-inner transition-colors duration-300 ${
          isUrgentTime ? "urgent" : isLowTime ? "low-time" : isFinished ? "finished" : ""
        }`}>

          <div className="flex flex-col items-center select-none">
            {isFinished ? (
              <div className="animate-bounce">
                <span className="text-[10px] uppercase tracking-[0.25em] text-purple-400 font-bold block mb-1">
                  Improvisation
                </span>
                <h3 className="text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(112,0,255,0.6)]">
                  Hey ! Impro !
                </h3>
              </div>
            ) : (
              <>
                <span className={`text-[10px] uppercase tracking-[0.2em] block mb-2 transition-colors duration-300 ${isLowTime ? "text-red-400 font-bold" : "text-zinc-400"
                  }`}>
                  {isRunning ? "Scène en cours..." : "Temps de scène cible"}
                </span>

                {/* Big Time Display (Changes style at 30s remaining and animates at 10s) */}
                <h3 className={`text-6xl sm:text-7xl tracking-tight mb-2 transition-all duration-300 tabular-nums ${isUrgentTime
                  ? "text-red-500 font-black filter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scale-urgent"
                  : isLowTime
                  ? "text-red-500 font-black scale-105 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]"
                  : "text-white font-medium"
                  }`}>
                  {formatTime(timeLeft)}
                </h3>

                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                  {formatTime(targetDuration)} réglé
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Adjustments & Discreet Reset */}
        {!isRunning && !isFinished && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-4 w-full">
              <button
                onClick={() => adjustTargetDuration(-30)}
                className="flex-1 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Minus className="w-3 h-3" /> 30s
              </button>
              <button
                onClick={() => adjustTargetDuration(30)}
                className="flex-1 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3" /> 30s
              </button>
            </div>

            {/* Discreet Reset Button to 2m30s */}
            {targetDuration !== BASE_DEFAULT && (
              <button
                onClick={resetToStandard}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 underline transition-all focus:outline-none py-1"
              >
                Rétablir 2m30
              </button>
            )}
          </div>
        )}

        {/* Action Toggles */}
        <div className="flex gap-3">
          {isFinished ? (
            <button
              onClick={resetTimer}
              className="w-full py-4 rounded-2xl bg-zinc-100 hover:bg-white text-black active:scale-95 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer
            </button>
          ) : (
            <>
              <button
                onClick={resetTimer}
                disabled={timeLeft === targetDuration && !isRunning}
                className="flex-1 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>

              <button
                onClick={toggleTimer}
                className={`flex-[1.5] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all ${isRunning
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white hover:bg-zinc-100 text-black"
                  }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Suspendre
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Lancer l'impro
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
