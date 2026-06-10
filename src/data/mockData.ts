import { Emotion, Location, Era } from "@/types";

export const EMOTIONS: Emotion[] = [
  { text: "Joie exubérante", category: "Positive" },
  { text: "Colère froide", category: "Négative" },
  { text: "Tristesse infinie", category: "Négative" },
  { text: "Peur panique", category: "Négative" },
  { text: "Amour inconditionnel", category: "Positive" },
  { text: "Jalousie maladive", category: "Négative" },
  { text: "Fierté orgueilleuse", category: "Positive" },
  { text: "Dégoût viscéral", category: "Négative" },
  { text: "Excitation enfantine", category: "Positive" },
  { text: "Indifférence totale", category: "Neutre" },
  { text: "Cynisme mordant", category: "Neutre" },
  { text: "Nostalgie mélancolique", category: "Neutre" },
  { text: "Hystérie joyeuse", category: "Positive" },
  { text: "Sérénité absolue", category: "Positive" }
];

export const LOCATIONS: Location[] = [
  { text: "Un sous-marin en panne à 4000m", category: "Huis clos" },
  { text: "Une file d'attente chez le boulanger", category: "Quotidien" },
  { text: "La surface hostile de Mars", category: "Insolite" },
  { text: "Une cabane arboricole en pleine tempête", category: "Aventure" },
  { text: "Le sommet brumeux du Mont Blanc", category: "Aventure" },
  { text: "Un ascenseur bloqué au 80ème étage", category: "Huis clos" },
  { text: "Un musée de cire au milieu de la nuit", category: "Insolite" },
  { text: "Les coulisses d'un défilé de haute couture", category: "Quotidien" },
  { text: "Une île déserte recouverte de brume", category: "Aventure" },
  { text: "La salle d'attente des urgences vétérinaires", category: "Quotidien" },
  { text: "Un bunker anti-atomique ultra-luxueux", category: "Huis clos" }
];

export const ERAS: Era[] = [
  { text: "La Préhistoire (-10 000)", era: "Passé" },
  { text: "L'Antiquité romaine (Ier siècle)", era: "Passé" },
  { text: "Le Moyen Âge féodal (XIIe siècle)", era: "Passé" },
  { text: "La Renaissance italienne (XVe siècle)", era: "Passé" },
  { text: "L'Époque victorienne (XIXe siècle)", era: "Passé" },
  { text: "Les Années folles (1920)", era: "Passé" },
  { text: "L'âge d'or du Disco (1970)", era: "Passé" },
  { text: "L'ère Cyberpunk (2080)", era: "Futur" },
  { text: "Le présent (2026)", era: "Présent" },
  { text: "Le futur lointain (3050)", era: "Futur" }
];

export const PRESET_COLORS: string[] = [
  "rgba(6, 182, 212, 0.8)", // Cyan
  "rgba(234, 179, 8, 0.8)",  // Yellow
  "rgba(236, 72, 153, 0.8)", // Pink/Magenta
  "rgba(168, 85, 247, 0.8)", // Purple
  "rgba(249, 115, 22, 0.8)", // Orange
];
