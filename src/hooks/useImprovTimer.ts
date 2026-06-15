"use client";

/**
 * @file useImprovTimer.ts
 * @description Custom React hook managing all states, refs, timers, and Web Audio/Speech API synthesizers
 * for the theatrical improvisation timer.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-15
 * @license MIT
 */

import { useState, useEffect, useRef, useContext } from "react";
import { ImprovBufferContext } from "@/context/ImprovBufferContext";

export const BASE_DEFAULT = 150; // 2m30s

export const BUZZER_TYPES = [
  { id: "arpeggio", name: "Arpège" },
  { id: "classic_buzzer", name: "Buzzer" },
  { id: "boxing_bell", name: "Cloche" },
  { id: "siren", name: "Sirène" },
  { id: "gong", name: "Gong" },
];

export function useImprovTimer() {
  const context = useContext(ImprovBufferContext);
  const devMode = context?.devMode ?? false;

  const [targetDuration, setTargetDuration] = useState(BASE_DEFAULT);
  const [timeLeft, setTimeLeft] = useState(BASE_DEFAULT);
  const [isRunning, setIsRunning] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [buzzerType, setBuzzerType] = useState<string>("arpeggio");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Voice announcement preferences
  const [announcementTimes, setAnnouncementTimes] = useState<number[]>([60, 30, 10]);
  const [newAnnouncementInput, setNewAnnouncementInput] = useState<string>("");
  const [finalAnnouncementText, setFinalAnnouncementText] = useState<string>("Hey ! Impro !");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

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

      const storedSaveAsDefault = localStorage.getItem("improv_save_as_default");
      if (storedSaveAsDefault !== null) {
        setSaveAsDefault(storedSaveAsDefault === "true");
      }

      const storedBuzzer = localStorage.getItem("improv_buzzer_type");
      if (storedBuzzer && BUZZER_TYPES.some(b => b.id === storedBuzzer)) {
        setBuzzerType(storedBuzzer);
      }

      const storedAnnouncements = localStorage.getItem("improv_announcement_times");
      if (storedAnnouncements) {
        try {
          const parsed = JSON.parse(storedAnnouncements);
          if (Array.isArray(parsed)) {
            setAnnouncementTimes(parsed);
          }
        } catch (e) {
          // ignore
        }
      }

      const storedFinalText = localStorage.getItem("improv_final_announcement_text");
      if (storedFinalText) {
        setFinalAnnouncementText(storedFinalText);
      }

      const storedVoiceGender = localStorage.getItem("improv_voice_gender");
      if (storedVoiceGender === "female" || storedVoiceGender === "male") {
        setVoiceGender(storedVoiceGender);
      }

      // Warm up SpeechSynthesis voices list
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    }
  }, []);

  // Web Speech API French Synthesis Helper (Robust against Garbage Collection in Chrome)
  const speak = (text: string, isFinal: boolean = false) => {
    if (!soundEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      utterancesRef.current = []; // clear old references

      const voices = window.speechSynthesis.getVoices();
      const frenchVoices = voices.filter(v => v.lang.startsWith("fr-FR") || v.lang.startsWith("fr"));

      // Filter based on gender preference
      let selectedVoice = null;
      const maleNames = ["paul", "thomas", "nicolas", "daniel", "sylvain", "male", "homme", "david", "jean", "pierre", "michel"];

      if (voiceGender === "female") {
        const femaleNames = ["hortense", "audrey", "aurelie", "aurélie", "amelie", "amélie", "chloe", "chloé", "julie", "celia", "célia", "harmonie", "sylvie", "charlotte", "female", "femme"];
        selectedVoice = frenchVoices.find(v => femaleNames.some(name => v.name.toLowerCase().includes(name)));
      } else if (voiceGender === "male") {
        selectedVoice = frenchVoices.find(v => maleNames.some(name => v.name.toLowerCase().includes(name)));

        // Fallback: If no native male voice is found, prefer a local French voice (supporting pitch modulation)
        // over Google remote voices which ignore pitch adjustments in Chrome.
        if (!selectedVoice) {
          selectedVoice = frenchVoices.find(v => v.localService === true && !v.name.toLowerCase().includes("google"));
        }
      }

      // Fallback if no matching voice found
      if (!selectedVoice) {
        selectedVoice = frenchVoices.find(v => v.lang.startsWith("fr-FR")) || frenchVoices[0];
      }

      // Check if selected voice is a native male voice
      const isNativeMaleVoice = selectedVoice && maleNames.some(name => selectedVoice.name.toLowerCase().includes(name));

      const addUtterance = (utt: SpeechSynthesisUtterance) => {
        utterancesRef.current.push(utt);
        utt.onend = () => {
          utterancesRef.current = utterancesRef.current.filter(u => u !== utt);
        };
        utt.onerror = () => {
          utterancesRef.current = utterancesRef.current.filter(u => u !== utt);
        };
        window.speechSynthesis.speak(utt);
      };

      const isMale = voiceGender === "male";
      const baseRate = isMale ? 0.85 : 0.90;
      const basePitch = isMale ? (isNativeMaleVoice ? 0.85 : 0.80) : 1.05;

      const createUtterance = (txt: string, rateOffset: number, pitchOverride?: number) => {
        const utt = new SpeechSynthesisUtterance(txt);
        utt.lang = "fr-FR";
        if (selectedVoice) utt.voice = selectedVoice;
        utt.rate = baseRate + rateOffset;
        utt.pitch = pitchOverride !== undefined ? pitchOverride : basePitch;
        utt.volume = 1.0;
        return utt;
      };

      if (isFinal) {
        if (text.trim().toLowerCase() === "hey ! impro !") {
          const utterance1 = createUtterance("Hey !", -0.05, isMale ? basePitch : 1.25);
          const utterance2 = createUtterance("Impro !", -0.10, isMale ? 0.75 : basePitch);

          addUtterance(utterance1);
          addUtterance(utterance2);
        } else {
          const utterance = createUtterance(text, 0);
          addUtterance(utterance);
        }
      } else {
        // Non-final: sound clear and projected
        const utterance = createUtterance(text, 0.05, isMale ? basePitch : 1.00);
        addUtterance(utterance);
      }
    } catch (e) {
      console.warn("Speech Synthesis failed to speak.", e);
    }
  };

  const playBuzzerSound = (type: string = buzzerType) => {
    try {
      let ctx = audioContextRef.current;
      if (!ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioContextClass();
        audioContextRef.current = ctx;
      }
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const playTone = (freqStart: number, freqEnd: number, oscType: OscillatorType, delay: number, duration: number = 0.8) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = oscType;
        osc.frequency.setValueAtTime(freqStart, ctx.currentTime + delay);
        if (freqEnd !== freqStart) {
          osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);
        }

        gain.gain.setValueAtTime(0.01, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.05); // quick attack
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration); // decay

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      if (type === "arpeggio") {
        playTone(261.63, 523.25, "sine", 0, 0.8);      // C4 -> C5
        playTone(329.63, 659.25, "triangle", 0.1, 0.8); // E4 -> E5 (delayed 100ms)
        playTone(392.00, 784.00, "sine", 0.2, 0.8);     // G4 -> G5 (delayed 200ms)
        playTone(523.25, 1046.50, "triangle", 0.3, 0.8); // C5 -> C6 (delayed 300ms)
      } else if (type === "classic_buzzer") {
        const playBuzzer = (freq: number, oscType: OscillatorType, delay: number, duration: number) => {
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = oscType;
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

          gain.gain.setValueAtTime(0.01, ctx.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.05); // quick attack
          gain.gain.setValueAtTime(0.25, ctx.currentTime + delay + duration - 0.1); // hold
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + delay + duration); // quick release

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + duration);
        };
        playBuzzer(100, "sawtooth", 0, 1.2);
        playBuzzer(100.5, "sawtooth", 0, 1.2);
        playBuzzer(150, "triangle", 0.1, 1.0);
      } else if (type === "boxing_bell") {
        const playBell = (freq: number, delay: number) => {
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime + delay);

          gain.gain.setValueAtTime(0.01, ctx.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01); // ultra-fast attack
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6); // ring decay

          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.6);
          osc2.start(ctx.currentTime + delay);
          osc2.stop(ctx.currentTime + delay + 0.6);
        };
        playBell(587.33, 0);
        playBell(587.33, 0.25);
        playBell(587.33, 0.5);
      } else if (type === "siren") {
        const playSiren = (delay: number) => {
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          const tStart = ctx.currentTime + delay;
          osc.frequency.setValueAtTime(400, tStart);
          osc.frequency.linearRampToValueAtTime(900, tStart + 0.4);
          osc.frequency.linearRampToValueAtTime(400, tStart + 0.8);
          osc.frequency.linearRampToValueAtTime(900, tStart + 1.2);
          osc.frequency.linearRampToValueAtTime(400, tStart + 1.6);

          gain.gain.setValueAtTime(0.01, tStart);
          gain.gain.linearRampToValueAtTime(0.2, tStart + 0.1);
          gain.gain.setValueAtTime(0.2, tStart + 1.4);
          gain.gain.exponentialRampToValueAtTime(0.01, tStart + 1.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(tStart);
          osc.stop(tStart + 1.6);
        };
        playSiren(0);
      } else if (type === "gong") {
        const playGong = (delay: number) => {
          if (!ctx) return;
          const freqs = [110, 165, 220, 275, 330, 440, 550, 660, 880, 1100, 1320, 1760];
          const types: OscillatorType[] = [
            "sine", "sine", "triangle", "triangle", "sawtooth", "triangle",
            "sawtooth", "triangle", "sine", "triangle", "sine", "triangle"
          ];
          const gains = [0.4, 0.3, 0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.06, 0.05, 0.04, 0.03];

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.01, ctx.currentTime + delay);
          masterGain.gain.linearRampToValueAtTime(0.95, ctx.currentTime + delay + 0.04);
          masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 4.5);
          masterGain.connect(ctx.destination);

          freqs.forEach((freq, idx) => {
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            oscGain.gain.value = gains[idx];

            osc.type = types[idx];
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            osc.frequency.linearRampToValueAtTime(freq + (idx % 2 === 0 ? 1.5 : -1.5) * 4, ctx.currentTime + delay + 2.0);

            osc.connect(oscGain);
            oscGain.connect(masterGain);

            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 4.5);
          });
        };
        playGong(0);
      }
    } catch (e) {
      console.warn("AudioContext blocked or unsupported.", e);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (soundEnabled && typeof window !== "undefined") {
              playBuzzerSound(buzzerType);
              speak(finalAnnouncementText, true);
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
  }, [isRunning, timeLeft, soundEnabled, buzzerType, finalAnnouncementText, voiceGender]);

  // Clear flash message immediately when timer is paused
  useEffect(() => {
    if (!isRunning) {
      setFlashMessage(null);
    }
  }, [isRunning]);

  // Flash notifications and Speech announcements logic
  useEffect(() => {
    if (!isRunning) return;

    if (announcementTimes.includes(timeLeft)) {
      let msg = "";
      let speakMsg = "";
      if (timeLeft >= 60) {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        if (secs === 0) {
          msg = `${mins} minute${mins > 1 ? "s" : ""} restante${mins > 1 ? "s" : ""} !`;
          speakMsg = `Il vous reste ${mins} minute${mins > 1 ? "s" : ""} !`;
        } else {
          msg = `${mins}m ${secs}s restantes !`;
          speakMsg = `Il vous reste ${mins} minute${mins > 1 ? "s" : ""} et ${secs} seconde${secs > 1 ? "s" : ""} !`;
        }
      } else {
        msg = `${timeLeft} secondes restantes !`;
        speakMsg = `Il vous reste ${timeLeft} seconde${timeLeft > 1 ? "s" : ""} !`;
      }

      setFlashMessage(msg);
      speak(speakMsg);
      const t = setTimeout(() => setFlashMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [timeLeft, isRunning, announcementTimes, voiceGender]);

  const selectBuzzer = (type: string) => {
    setBuzzerType(type);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_buzzer_type", type);
    }
  };

  const testBuzzerSound = (type: string) => {
    if (typeof window !== "undefined") {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
        playBuzzerSound(type);
      } catch (e) {
        console.warn("Failed to test buzzer sound:", e);
      }
    }
  };

  const handleSaveAsDefaultChange = (val: boolean) => {
    setSaveAsDefault(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_save_as_default", val.toString());
    }
  };

  const addCustomAnnouncement = () => {
    const secs = parseInt(newAnnouncementInput.trim(), 10);
    if (isNaN(secs) || secs <= 0) return;
    if (announcementTimes.includes(secs)) {
      setNewAnnouncementInput("");
      return;
    }
    const newTimes = [...announcementTimes, secs].sort((a, b) => b - a);
    setAnnouncementTimes(newTimes);
    setNewAnnouncementInput("");
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_announcement_times", JSON.stringify(newTimes));
    }
  };

  const removeAnnouncementTime = (time: number) => {
    const newTimes = announcementTimes.filter((t) => t !== time);
    setAnnouncementTimes(newTimes);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_announcement_times", JSON.stringify(newTimes));
    }
  };

  const toggleAnnouncementTime = (time: number) => {
    let newTimes = [...announcementTimes];
    if (newTimes.includes(time)) {
      newTimes = newTimes.filter((t) => t !== time);
    } else {
      newTimes.push(time);
      newTimes.sort((a, b) => b - a);
    }
    setAnnouncementTimes(newTimes);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_announcement_times", JSON.stringify(newTimes));
    }
  };

  const handleFinalAnnouncementTextChange = (val: string) => {
    setFinalAnnouncementText(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_final_announcement_text", val);
    }
  };

  const handleVoiceGenderChange = (val: "female" | "male") => {
    setVoiceGender(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("improv_voice_gender", val);
    }
  };

  const toggleTimer = () => {
    // Resume or create AudioContext on user interaction to bypass autoplay block
    if (typeof window !== "undefined" && soundEnabled) {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
      } catch (e) {
        console.warn("Failed to initialize or resume AudioContext", e);
      }
    }
    if (!isRunning) {
      setIsSessionActive(true);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(targetDuration);
    setIsSessionActive(false);
  };

  const adjustMinutes = (amount: number) => {
    setTargetDuration((prev) => {
      const currentSecs = prev % 60;
      const currentMins = Math.floor(prev / 60);
      const newMins = Math.max(0, currentMins + amount);
      const newVal = Math.max(10, newMins * 60 + currentSecs);
      if (saveAsDefault && typeof window !== "undefined") {
        localStorage.setItem("improv_default_duration", newVal.toString());
      }
      setTimeLeft(newVal);
      setIsSessionActive(false);
      return newVal;
    });
  };

  const adjustSeconds = (amount: number) => {
    setTargetDuration((prev) => {
      const currentSecs = prev % 60;
      const currentMins = Math.floor(prev / 60);
      let newSecs = currentSecs + amount;
      let newMins = currentMins;

      if (newSecs >= 60) {
        newSecs = newSecs - 60;
        newMins += 1;
      } else if (newSecs < 0) {
        if (newMins > 0) {
          newSecs = 60 + newSecs;
          newMins -= 1;
        } else {
          newSecs = 0;
        }
      }

      const newVal = Math.max(10, newMins * 60 + newSecs);
      if (saveAsDefault && typeof window !== "undefined") {
        localStorage.setItem("improv_default_duration", newVal.toString());
      }
      setTimeLeft(newVal);
      setIsSessionActive(false);
      return newVal;
    });
  };

  const adjustTimeLeft = (amount: number) => {
    setTimeLeft((prev) => {
      if (prev <= 0 && amount < 0) return 0;
      const newVal = prev + amount;
      if (newVal <= 0) {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (prev > 0 && soundEnabled && typeof window !== "undefined") {
          playBuzzerSound(buzzerType);
          speak(finalAnnouncementText, true);
        }
        return 0;
      }
      return newVal;
    });
  };

  const adjustTime = (amount: number) => {
    if (isSessionActive) {
      adjustTimeLeft(amount);
    } else {
      adjustSeconds(amount);
    }
  };

  const resetToStandard = () => {
    setTargetDuration(BASE_DEFAULT);
    setTimeLeft(BASE_DEFAULT);
    setIsSessionActive(false);
    if (saveAsDefault && typeof window !== "undefined") {
      localStorage.setItem("improv_default_duration", BASE_DEFAULT.toString());
    }
  };

  const selectPreset = (seconds: number) => {
    setTargetDuration(seconds);
    setTimeLeft(seconds);
    setIsSessionActive(false);
    if (saveAsDefault && typeof window !== "undefined") {
      localStorage.setItem("improv_default_duration", seconds.toString());
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft > 0 && timeLeft <= 30;
  const isUrgentTime = timeLeft > 0 && timeLeft <= 10;
  const isPanicTime = timeLeft > 0 && timeLeft <= 5;
  const isFinished = timeLeft === 0;
  const isAdvancedOpen = showAdvanced && !isRunning && !isFinished;

  return {
    // States
    targetDuration,
    setTargetDuration,
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    isSessionActive,
    setIsSessionActive,
    saveAsDefault,
    setSaveAsDefault,
    soundEnabled,
    setSoundEnabled,
    buzzerType,
    setBuzzerType,
    showAdvanced,
    setShowAdvanced,
    flashMessage,
    setFlashMessage,
    isMounted,
    announcementTimes,
    setAnnouncementTimes,
    newAnnouncementInput,
    setNewAnnouncementInput,
    finalAnnouncementText,
    setFinalAnnouncementText,
    voiceGender,
    setVoiceGender,
    devMode,

    // Actions
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

    // Derived properties
    isLowTime,
    isUrgentTime,
    isPanicTime,
    isFinished,
    isAdvancedOpen,
  };
}
