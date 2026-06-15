"use client";

/**
 * @file ImprovTimer.tsx
 * @description Standard theatrical improvisation timer. Features visual feedback,
 * configurable audible bells (using Web Audio API synthesized tones: Arpège, Buzzer, Cloche, Sirène, Gong),
 * speech synthesis, custom duration adjustments (temps libre), and high-urgency animation transitions as time runs out.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import React from "react";
import { Play, Pause, RotateCcw, Plus, Minus, Bell, BellOff, Volume2, Sliders } from "lucide-react";
import { useImprovTimer, BUZZER_TYPES, BASE_DEFAULT } from "@/hooks/useImprovTimer";

export default function ImprovTimer() {
  const {
    targetDuration,
    timeLeft,
    isRunning,
    isSessionActive,
    saveAsDefault,
    soundEnabled,
    setSoundEnabled,
    buzzerType,
    showAdvanced,
    setShowAdvanced,
    flashMessage,
    isMounted,
    announcementTimes,
    newAnnouncementInput,
    setNewAnnouncementInput,
    finalAnnouncementText,
    voiceGender,
    devMode,
    toggleTimer,
    resetTimer,
    adjustMinutes,
    adjustSeconds,
    adjustTime,
    resetToStandard,
    selectPreset,
    selectBuzzer,
    testBuzzerSound,
    addCustomAnnouncement,
    removeAnnouncementTime,
    toggleAnnouncementTime,
    handleSaveAsDefaultChange,
    handleFinalAnnouncementTextChange,
    handleVoiceGenderChange,
    speak,
    formatTime,
    isLowTime,
    isUrgentTime,
    isPanicTime,
    isFinished,
    isAdvancedOpen,
  } = useImprovTimer();

  if (!isMounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <div className="text-zinc-500 text-sm tracking-widest animate-pulse uppercase">Initialisation...</div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center gap-6 relative ${isAdvancedOpen ? "pb-12" : ""}`}>

      {/* Big Toaster Flash Notification Overlay (Moved to top-14 and made more compact to avoid overlapping the card) */}
      {flashMessage && (
        <div className="fixed top-14 left-4 right-4 max-w-xs mx-auto z-50 p-[1px] rounded-xl bg-gradient-to-r from-cyan-500 via-magenta-500 to-purple-500 animate-toast shadow-xl">
          <div className="bg-zinc-950/95 backdrop-blur-md rounded-[11px] py-2.5 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-sm shadow-inner shrink-0">
                ⏱️
              </div>
              <div className="text-left min-w-0">
                <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none mb-0.5">Temps</p>
                <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">
                  {flashMessage}
                </h4>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
          </div>
        </div>
      )}

      {/* Sound Toggle */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-1.5 active:scale-95 transition-all hover:text-white"
        >
          {soundEnabled ? (
            <>
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Son et voix</span>
            </>
          ) : (
            <>
              <BellOff className="w-3.5 h-3.5" />
              <span>Silencieux</span>
            </>
          )}
        </button>

        {!isRunning && !isFinished && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1.5 rounded-full border text-xs flex items-center gap-1.5 active:scale-95 transition-all ${showAdvanced
                ? "bg-zinc-850 border-zinc-800 text-white font-medium shadow-md shadow-black/50"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Options avancées</span>
          </button>
        )}
      </div>

      {/* Main Display Ring */}
      <div
        className={`generator-card transition-all duration-300 ${isPanicTime ? "animate-pulse shadow-[0_0_40px_rgba(255,50,50,0.6)]" : isUrgentTime ? "animate-pulse" : ""
          }`}
      >
        <div className={`generator-card-inner transition-colors duration-300 ${isUrgentTime ? "urgent" : isLowTime ? "low-time" : isFinished ? "finished" : ""
          }`}>

          <div className="flex flex-col items-center select-none">
            {isFinished ? (
              <div className="animate-bounce">
                <span className="text-xs uppercase tracking-[0.25em] text-purple-400 font-bold block mb-1">
                  Improvisation
                </span>
                <h3 className="text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(112,0,255,0.6)]">
                  {finalAnnouncementText}
                </h3>
              </div>
            ) : (
              <>
                <span className={`text-xs uppercase tracking-[0.2em] block mb-2 transition-colors duration-300 ${isLowTime ? "text-red-400 font-bold" : "text-zinc-400"
                  }`}>
                  {isRunning ? "Scène en cours..." : "Temps de scène cible"}
                </span>

                {/* Big Time Display */}
                <h3 className={`text-6xl sm:text-7xl tracking-tight mb-2 transition-all duration-300 tabular-nums ${isPanicTime
                    ? "text-red-100 font-black filter drop-shadow-[0_0_30px_rgba(255,50,50,1)] drop-shadow-[0_0_15px_rgba(255,255,255,0.95)] animate-scale-panic"
                    : isUrgentTime
                      ? "text-red-100 font-black filter drop-shadow-[0_0_25px_rgba(255,50,50,1)] drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-scale-urgent"
                      : isLowTime
                        ? "text-red-100 font-black scale-105 filter drop-shadow-[0_0_20px_rgba(255,50,50,0.9)]"
                        : "text-white font-medium filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  }`}>
                  {formatTime(timeLeft)}
                </h3>

                <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
                  {formatTime(targetDuration)} réglé
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings configuration panel */}
      {isAdvancedOpen && (
        <div className="w-full max-w-sm flex flex-col gap-3 p-4 bg-zinc-950/45 border border-zinc-900 rounded-2xl backdrop-blur-md">

          {/* 1. Custom Time adjustments (réglage personnalisé) - PLACED FIRST */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-bold">
              Réglage personnalisé
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Choix de la durée par défaut
            </span>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <div className="flex-1 flex flex-col gap-1 items-center bg-zinc-950/20 border border-zinc-900 rounded-xl p-2">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Minutes</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustMinutes(-1)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-300 flex items-center justify-center font-bold active:scale-90 hover:text-white"
                >
                  -
                </button>
                <span className="text-sm font-bold text-white min-w-[20px] text-center">
                  {Math.floor(targetDuration / 60)}
                </span>
                <button
                  onClick={() => adjustMinutes(1)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-300 flex items-center justify-center font-bold active:scale-90 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 items-center bg-zinc-950/20 border border-zinc-900 rounded-xl p-2">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Secondes</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustSeconds(-10)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-300 flex items-center justify-center font-bold active:scale-90 hover:text-white"
                >
                  -
                </button>
                <span className="text-sm font-bold text-white min-w-[20px] text-center">
                  {targetDuration % 60}
                </span>
                <button
                  onClick={() => adjustSeconds(10)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-300 flex items-center justify-center font-bold active:scale-90 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Restoring defaults */}
          {targetDuration !== BASE_DEFAULT && (
            <button
              onClick={resetToStandard}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-all focus:outline-none py-1 text-center animate-fade-in"
            >
              Rétablir 2m30 standard
            </button>
          )}

          <div className="h-px bg-zinc-900/60 my-1" />

          {/* 2. Time Presets (durées prédéfinies) */}
          <span className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-bold">
            Durées prédéfinies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[30, 60, 120, 150, 180, 300].map((seconds) => (
              <button
                key={seconds}
                onClick={() => selectPreset(seconds)}
                className={`py-1 px-2.5 rounded-full text-xs transition-all border ${targetDuration === seconds
                    ? "bg-zinc-900 text-white border-zinc-800 font-semibold"
                    : "bg-zinc-950/30 border-zinc-900 text-zinc-400 hover:border-zinc-850 hover:text-zinc-300"
                  }`}
              >
                {seconds === 30 ? "Caucus (30s)" : seconds === 150 ? "2m30s" : formatTime(seconds)}
              </button>
            ))}
          </div>

          <div className="h-px bg-zinc-900/60 my-1" />

          {/* 3. Voice announcements configuration (Annonces vocales) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-bold">
              Annonces vocales
            </span>
            <span className="text-[10px] text-zinc-500 font-medium -mt-1">
              Moments où le temps restant sera annoncé
            </span>

            {/* List of active announcement times (Chips) */}
            {announcementTimes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/20 border border-zinc-900/65 rounded-xl max-h-[120px] overflow-y-auto">
                {announcementTimes.map((time) => {
                  const label = time >= 60
                    ? `${Math.floor(time / 60)}m${time % 60 > 0 ? (time % 60) : ""}`
                    : `${time}s`;
                  return (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 py-0.5 px-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-medium animate-fade-in"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => removeAnnouncementTime(time)}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none ml-0.5 font-bold"
                        title="Supprimer cette annonce"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-2.5 px-3 bg-zinc-950/20 border border-zinc-900/40 border-dashed rounded-xl text-[11px] text-zinc-500 italic">
                Aucune annonce programmée
              </div>
            )}

            {/* Form to add custom announcement */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 flex items-center bg-zinc-950/30 border border-zinc-900 rounded-xl focus-within:border-zinc-800 transition-all">
                <input
                  type="number"
                  min="1"
                  max={targetDuration - 1}
                  value={newAnnouncementInput}
                  onChange={(e) => setNewAnnouncementInput(e.target.value)}
                  placeholder="Ajouter secondes (ex: 45)"
                  className="w-full bg-transparent border-none outline-none text-xs py-2 px-3 text-zinc-200 placeholder-zinc-650 focus:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAnnouncement();
                    }
                  }}
                />
                <span className="text-[10px] text-zinc-500 font-medium pr-3 select-none">s</span>
              </div>
              <button
                type="button"
                onClick={addCustomAnnouncement}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95 shrink-0"
              >
                Ajouter
              </button>
            </div>

            {/* Quick Add / shortcuts */}
            <div className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="text-[9px] text-zinc-600 font-medium mr-1">Raccourcis :</span>
              {[120, 90, 60, 30, 15, 10, 5].map((s) => {
                const isActive = announcementTimes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleAnnouncementTime(s)}
                    className={`py-0.5 px-2 rounded-full text-[10px] border transition-all active:scale-95 ${isActive
                        ? "bg-cyan-950/20 border-cyan-800/50 text-cyan-400 font-medium"
                        : "bg-zinc-950/20 border-zinc-900 text-zinc-500 hover:text-cyan-400"
                      }`}
                  >
                    {s >= 60
                      ? `${Math.floor(s / 60)}m${s % 60 > 0 ? (s % 60) : ""}`
                      : `${s}s`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-zinc-900/60 my-1" />

          {/* 3.5. Final Speech announcement text */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-bold">
                Annonce de fin (voix)
              </span>
              {soundEnabled && (
                <button
                  type="button"
                  onClick={() => speak(finalAnnouncementText, true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-0.5 rounded border border-cyan-800/40 bg-cyan-950/20 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  Tester
                </button>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-medium -mt-1">
              Texte prononcé à la fin du compte à rebours
            </span>
            <input
              type="text"
              value={finalAnnouncementText}
              onChange={(e) => handleFinalAnnouncementTextChange(e.target.value)}
              placeholder="Ex: Hey ! Impro !"
              className="w-full bg-zinc-950/30 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-800 transition-all"
            />
          </div>

          <div className="h-px bg-zinc-900/60 my-1" />

          {/* 3.6. Voice Gender Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-bold">
              Genre de la voix
            </span>
            <span className="text-[10px] text-zinc-500 font-medium -mt-1">
              Préférer une voix féminine ou masculine pour les annonces
            </span>
            <div className="grid grid-cols-2 gap-1.5 mt-0.5">
              {[
                { id: "female", name: "Féminine" },
                { id: "male", name: "Masculine" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleVoiceGenderChange(g.id as any)}
                  className={`py-1.5 px-0.5 text-xs rounded-xl font-medium border text-center transition-all truncate ${voiceGender === g.id
                      ? "bg-zinc-900 text-white border-zinc-800 font-semibold shadow-md"
                      : "bg-zinc-950/30 border-transparent text-zinc-500 hover:border-zinc-900 hover:text-zinc-400"
                    }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-900/60 my-1" />

          {/* 4. Buzzer selection (Buzzer de fin) */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-bold">
              Buzzer de fin
            </span>
            {soundEnabled && (
              <button
                type="button"
                onClick={() => testBuzzerSound(buzzerType)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-0.5 rounded border border-cyan-800/40 bg-cyan-950/20 active:scale-95 transition-all flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                Tester
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {BUZZER_TYPES.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBuzzer(b.id)}
                disabled={!soundEnabled}
                className={`py-1.5 px-0.5 text-[10px] sm:text-xs rounded-xl font-medium border text-center transition-all truncate ${!soundEnabled
                    ? "opacity-30 cursor-not-allowed border-zinc-900 text-zinc-600"
                    : buzzerType === b.id
                      ? "bg-zinc-900 text-white border-zinc-800 font-semibold shadow-md"
                      : "bg-zinc-950/30 border-transparent text-zinc-500 hover:border-zinc-900 hover:text-zinc-400"
                  }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* 5. Dev Mode Audio Testing Sandbox (🛠️ Outils Audio) */}
          {devMode && (
            <>
              <div className="h-px bg-zinc-900/60 my-1" />
              <span className="text-xs uppercase tracking-[0.15em] text-cyan-400 font-bold">
                🛠️ Outils Audio (Dev Mode)
              </span>

              {/* Test Voices */}
              <div className="flex flex-col gap-1.5 mt-1.5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider text-left">
                  Tester les voix
                </span>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => speak("Il vous reste une minute !")}
                    className="py-1 px-1 text-[9px] rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:text-white active:scale-95 transition-all"
                  >
                    1 min
                  </button>
                  <button
                    onClick={() => speak("Il vous reste trente secondes !")}
                    className="py-1 px-1 text-[9px] rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:text-white active:scale-95 transition-all"
                  >
                    30s
                  </button>
                  <button
                    onClick={() => speak("Il vous reste dix secondes !")}
                    className="py-1 px-1 text-[9px] rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:text-white active:scale-95 transition-all"
                  >
                    10s
                  </button>
                  <button
                    onClick={() => speak(finalAnnouncementText, true)}
                    className="py-1 px-1 text-[9px] rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:text-white active:scale-95 transition-all"
                  >
                    Annonce de fin
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* 4 Quick adjustment buttons (shown all the time except when advanced options are open) */}
      {!isAdvancedOpen && (
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          <div className="flex gap-2">
            {[-30, -10, 10, 30].map((amount) => (
              <button
                key={amount}
                onClick={() => adjustTime(amount)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-950/45 border border-zinc-900 text-xs font-semibold text-zinc-300 active:scale-95 transition-all hover:text-white"
              >
                {amount > 0 ? `+${amount}` : `${amount}`}
              </button>
            ))}
          </div>

          {/* Checkbox for saving default duration (only shown at initial state when session is not active) */}
          {!isSessionActive && (
            <label className="flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-400 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => handleSaveAsDefaultChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-cyan-500 focus:ring-0 focus:ring-offset-0 transition-colors"
              />
              <span>Sauvegarder pour plus tard également</span>
            </label>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="w-full max-w-sm flex flex-col gap-4">

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
