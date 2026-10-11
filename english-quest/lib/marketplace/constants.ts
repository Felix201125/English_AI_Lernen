import type {
  DayPart,
  LearningGoal,
  LearningMode,
  SchoolType,
  Weekday,
} from "./types";

export const SCHOOL_TYPES: { id: SchoolType; labelDe: string }[] = [
  { id: "grundschule", labelDe: "Grundschule" },
  { id: "mittelschule", labelDe: "Mittelschule" },
  { id: "realschule", labelDe: "Realschule" },
  { id: "gymnasium", labelDe: "Gymnasium" },
  { id: "gesamtschule", labelDe: "Gesamtschule" },
  { id: "berufsschule", labelDe: "Berufsschule" },
  { id: "other", labelDe: "Andere" },
];

export const FEDERAL_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export const LEARNING_GOALS: { id: LearningGoal; labelDe: string }[] = [
  { id: "better-grade", labelDe: "Bessere Note" },
  { id: "exam", labelDe: "Prüfung vorbereiten" },
  { id: "homework", labelDe: "Hausaufgaben" },
  { id: "gaps", labelDe: "Lücken schließen" },
  { id: "fun", labelDe: "Aus Spaß" },
  { id: "speaking", labelDe: "Sprechen üben" },
];

export const LEARNING_MODES: { id: LearningMode; labelDe: string }[] = [
  { id: "solo", labelDe: "Alleine mit Spielen und KI" },
  { id: "live-teacher", labelDe: "Mit Lehrkraft live" },
  { id: "both", labelDe: "Beides" },
];

export const WEEKDAYS_DE: { id: Weekday; labelDe: string }[] = [
  { id: "mon", labelDe: "Mo" },
  { id: "tue", labelDe: "Di" },
  { id: "wed", labelDe: "Mi" },
  { id: "thu", labelDe: "Do" },
  { id: "fri", labelDe: "Fr" },
  { id: "sat", labelDe: "Sa" },
  { id: "sun", labelDe: "So" },
];

export const DAY_PARTS: { id: DayPart; labelDe: string }[] = [
  { id: "afternoon", labelDe: "Nachmittag" },
  { id: "evening", labelDe: "Abend" },
];

export const INTEREST_CHIPS = [
  { id: "football", labelDe: "Fußball", emoji: "⚽" },
  { id: "gaming", labelDe: "Gaming", emoji: "🎮" },
  { id: "music", labelDe: "Musik", emoji: "🎵" },
  { id: "animals", labelDe: "Tiere", emoji: "🐾" },
  { id: "space", labelDe: "Weltraum", emoji: "🚀" },
  { id: "art", labelDe: "Kunst", emoji: "🎨" },
  { id: "cooking", labelDe: "Kochen", emoji: "🍳" },
  { id: "nature", labelDe: "Natur", emoji: "🌿" },
  { id: "movies", labelDe: "Filme", emoji: "🎬" },
  { id: "sports", labelDe: "Sport", emoji: "🏃" },
];

/** Spielerische Einstufung — 3 Fragen, kein Test-Gefühl */
export const LEVEL_PROBES: Record<
  string,
  { id: string; prompt: string; options: { id: string; label: string; level: string }[] }[]
> = {
  english: [
    {
      id: "e1",
      prompt: "Which sentence feels easiest?",
      options: [
        { id: "a", label: "I like football.", level: "A1" },
        { id: "b", label: "Yesterday I played with my friends.", level: "A2" },
        { id: "c", label: "I've been playing since I was little.", level: "B1" },
      ],
    },
    {
      id: "e2",
      prompt: "Pick a fun reply:",
      options: [
        { id: "a", label: "Yes!", level: "A1" },
        { id: "b", label: "That sounds cool!", level: "A2" },
        { id: "c", label: "I'd love to join if I finish my homework.", level: "B1" },
      ],
    },
    {
      id: "e3",
      prompt: "Reading a short story feels…",
      options: [
        { id: "a", label: "Hard — I need pictures", level: "A1" },
        { id: "b", label: "Okay with some help", level: "A2" },
        { id: "c", label: "Fine, I get most of it", level: "B1" },
      ],
    },
  ],
  default: [
    {
      id: "d1",
      prompt: "Wie sicher fühlst du dich in diesem Fach?",
      options: [
        { id: "a", label: "Ich fange gerade an", level: "Einsteiger" },
        { id: "b", label: "Ganz okay", level: "Mittel" },
        { id: "c", label: "Ziemlich sicher", level: "Fortgeschritten" },
      ],
    },
    {
      id: "d2",
      prompt: "Hausaufgaben dazu…",
      options: [
        { id: "a", label: "Brauche oft Hilfe", level: "Einsteiger" },
        { id: "b", label: "Schaffe ich meistens", level: "Mittel" },
        { id: "c", label: "Laufen gut", level: "Fortgeschritten" },
      ],
    },
    {
      id: "d3",
      prompt: "Eine kleine Challenge wäre…",
      options: [
        { id: "a", label: "Lieber ganz leicht", level: "Einsteiger" },
        { id: "b", label: "Ein bisschen knifflig", level: "Mittel" },
        { id: "c", label: "Gerne etwas schwerer", level: "Fortgeschritten" },
      ],
    },
  ],
};

export function majorityLevel(
  levels: string[]
): string {
  const counts = new Map<string, number>();
  for (const l of levels) counts.set(l, (counts.get(l) ?? 0) + 1);
  let best = levels[0] ?? "A2";
  let n = 0;
  for (const [k, v] of counts) {
    if (v > n) {
      best = k;
      n = v;
    }
  }
  return best;
}
