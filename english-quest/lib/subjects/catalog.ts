/**
 * Qestra Fächerkatalog — Seed/Produktkatalog (kein Laufzeit-Fake in UI-Komponenten).
 */

export type SubjectCategoryId =
  | "languages"
  | "stem"
  | "society"
  | "creative"
  | "learning";

export type SubjectStatus = "active" | "preparing";

export type SubjectGradeBand =
  | "primary"
  | "lower-secondary"
  | "upper-secondary"
  | "all";

export type SubjectSkillAxis =
  | "speaking"
  | "listening"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar"
  | "calculation"
  | "reasoning"
  | "facts"
  | "methods"
  | "practice";

/** Fach-ID als string — erweiterbar ohne Union-Explosion */
export type SubjectId = string;

export type SubjectDefinition = {
  id: SubjectId;
  labelDe: string;
  labelEn: string;
  category: SubjectCategoryId;
  icon: string;
  color: string;
  status: SubjectStatus;
  /** Buchbar für Live auch ohne Spiele-Inhalte */
  bookable: boolean;
  gradeBands: SubjectGradeBand[];
  skillAxes: SubjectSkillAxis[];
  exactness: "tolerant" | "strict";
  notes: string;
};

export const SUBJECT_CATEGORIES: Record<
  SubjectCategoryId,
  { id: SubjectCategoryId; labelDe: string }
> = {
  languages: { id: "languages", labelDe: "Sprachen" },
  stem: { id: "stem", labelDe: "MINT" },
  society: { id: "society", labelDe: "Gesellschaft" },
  creative: { id: "creative", labelDe: "Kreativ & Bewegung" },
  learning: { id: "learning", labelDe: "Lernen & Prüfungen" },
};

function lang(
  id: SubjectId,
  labelDe: string,
  labelEn: string,
  status: SubjectStatus = "preparing"
): SubjectDefinition {
  return {
    id,
    labelDe,
    labelEn,
    category: "languages",
    icon: "🗣️",
    color: "from-sky-600/40 to-indigo-800/40",
    status,
    bookable: true,
    gradeBands: ["all"],
    skillAxes: [
      "speaking",
      "listening",
      "reading",
      "writing",
      "vocabulary",
      "grammar",
    ],
    exactness: "tolerant",
    notes: labelDe,
  };
}

function stem(
  id: SubjectId,
  labelDe: string,
  labelEn: string,
  icon: string,
  status: SubjectStatus = "preparing"
): SubjectDefinition {
  return {
    id,
    labelDe,
    labelEn,
    category: "stem",
    icon,
    color: "from-emerald-700/40 to-teal-900/40",
    status,
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["calculation", "reasoning", "methods", "facts"],
    exactness: "strict",
    notes: labelDe,
  };
}

function society(
  id: SubjectId,
  labelDe: string,
  labelEn: string,
  icon: string
): SubjectDefinition {
  return {
    id,
    labelDe,
    labelEn,
    category: "society",
    icon,
    color: "from-amber-700/30 to-orange-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["facts", "reading", "writing", "reasoning"],
    exactness: "strict",
    notes: labelDe,
  };
}

/** Vollständiger Katalog Auftrag 2 */
export const SUBJECT_CATALOG: SubjectDefinition[] = [
  // Sprachen — Englisch aktiv mit Inhalten
  { ...lang("english", "Englisch", "English", "active"), icon: "🇬🇧" },
  { ...lang("german", "Deutsch", "German"), icon: "🇩🇪" },
  { ...lang("french", "Französisch", "French"), icon: "🇫🇷" },
  { ...lang("spanish", "Spanisch", "Spanish"), icon: "🇪🇸" },
  { ...lang("italian", "Italienisch", "Italian"), icon: "🇮🇹" },
  { ...lang("latin", "Latein", "Latin"), icon: "📜" },
  { ...lang("russian", "Russisch", "Russian"), icon: "🇷🇺" },
  { ...lang("turkish", "Türkisch", "Turkish"), icon: "🇹🇷" },
  { ...lang("polish", "Polnisch", "Polish"), icon: "🇵🇱" },
  { ...lang("arabic", "Arabisch", "Arabic"), icon: "🇸🇦" },
  { ...lang("chinese", "Chinesisch", "Chinese"), icon: "🇨🇳" },
  { ...lang("japanese", "Japanisch", "Japanese"), icon: "🇯🇵" },
  {
    ...lang("daz", "Deutsch als Zweitsprache (DaZ)", "German as second language"),
    icon: "📘",
  },

  // MINT
  stem("math", "Mathematik", "Math", "➗"),
  stem("physics", "Physik", "Physics", "⚛️"),
  stem("chemistry", "Chemie", "Chemistry", "🧪"),
  stem("biology", "Biologie", "Biology", "🧬"),
  stem("informatics", "Informatik", "Computer Science", "💻"),
  stem("technology", "Technik", "Technology", "🔧"),
  stem("science-primary", "Naturwissenschaften (Grundschule)", "Primary Science", "🌱"),

  // Gesellschaft
  society("history", "Geschichte", "History", "🏛️"),
  society("geography", "Erdkunde / Geografie", "Geography", "🌍"),
  society("politics", "Politik / Sozialkunde", "Politics", "⚖️"),
  society("economics", "Wirtschaft", "Economics", "📈"),
  society("ethics", "Ethik", "Ethics", "🕊️"),
  society("philosophy", "Philosophie", "Philosophy", "🤔"),
  society("religion", "Religion", "Religion", "🙏"),
  society("sachunterricht", "Sachunterricht (Grundschule)", "General studies", "🎒"),

  // Kreativ
  {
    id: "art",
    labelDe: "Kunst",
    labelEn: "Art",
    category: "creative",
    icon: "🎨",
    color: "from-fuchsia-700/30 to-pink-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["practice", "methods"],
    exactness: "tolerant",
    notes: "Kunst",
  },
  {
    id: "music",
    labelDe: "Musik",
    labelEn: "Music",
    category: "creative",
    icon: "🎵",
    color: "from-violet-700/30 to-purple-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["practice", "listening"],
    exactness: "tolerant",
    notes: "Musik",
  },
  {
    id: "sports",
    labelDe: "Sport / Theorie",
    labelEn: "Sports theory",
    category: "creative",
    icon: "⚽",
    color: "from-lime-700/30 to-green-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["facts", "practice"],
    exactness: "tolerant",
    notes: "Sport",
  },

  // Lernen & Prüfungen
  {
    id: "study-skills",
    labelDe: "Lerntechniken",
    labelEn: "Study skills",
    category: "learning",
    icon: "🧠",
    color: "from-cyan-700/30 to-slate-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["methods", "practice"],
    exactness: "tolerant",
    notes: "Lerntechniken",
  },
  {
    id: "homework-help",
    labelDe: "Hausaufgabenhilfe",
    labelEn: "Homework help",
    category: "learning",
    icon: "📝",
    color: "from-cyan-700/30 to-slate-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["practice", "methods"],
    exactness: "tolerant",
    notes: "Hausaufgaben",
  },
  {
    id: "exam-prep",
    labelDe: "Prüfungsvorbereitung",
    labelEn: "Exam prep",
    category: "learning",
    icon: "🎯",
    color: "from-rose-700/30 to-red-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["lower-secondary", "upper-secondary"],
    skillAxes: ["methods", "practice", "facts"],
    exactness: "strict",
    notes: "Abitur, Mittlere Reife, Quali, Vergleichsarbeiten",
  },
  {
    id: "literacy-support",
    labelDe: "Lese-Rechtschreib-Förderung",
    labelEn: "Literacy support",
    category: "learning",
    icon: "📖",
    color: "from-cyan-700/30 to-slate-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["reading", "writing"],
    exactness: "tolerant",
    notes: "LRS",
  },
  {
    id: "numeracy-support",
    labelDe: "Rechenförderung",
    labelEn: "Numeracy support",
    category: "learning",
    icon: "🔢",
    color: "from-cyan-700/30 to-slate-900/40",
    status: "preparing",
    bookable: true,
    gradeBands: ["all"],
    skillAxes: ["calculation", "methods"],
    exactness: "strict",
    notes: "Rechenförderung",
  },
];

export const DEFAULT_SUBJECT_ID: SubjectId = "english";

export function getSubjectCatalog(): SubjectDefinition[] {
  return SUBJECT_CATALOG;
}

export function getSubject(id: SubjectId = DEFAULT_SUBJECT_ID): SubjectDefinition {
  return (
    SUBJECT_CATALOG.find((s) => s.id === id) ??
    SUBJECT_CATALOG.find((s) => s.id === DEFAULT_SUBJECT_ID)!
  );
}

export function selectableSubjects(): SubjectDefinition[] {
  return SUBJECT_CATALOG.filter((s) => s.status === "active");
}

export function bookableSubjects(): SubjectDefinition[] {
  return SUBJECT_CATALOG.filter((s) => s.bookable);
}
