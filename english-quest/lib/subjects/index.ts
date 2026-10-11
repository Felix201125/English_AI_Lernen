/**
 * Fachstruktur Qestra — fachneutrales Kernmodell.
 * Phase 1: Englisch vollständig. Weitere Fächer als Instanzen desselben Modells.
 */

export type SubjectId =
  | "english"
  | "math"
  | "science"
  | "history"
  | "language"; // weitere Fremdsprachen (generisch)

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
  | "methods";

export type SubjectDefinition = {
  id: SubjectId;
  labelDe: string;
  labelEn: string;
  /** Phase-1-Referenzfach vs. später */
  status: "active" | "planned";
  /** Skill-Achsen für Learning State / UI */
  skillAxes: SubjectSkillAxis[];
  /** z. B. Mathe: keine Toleranz für Rechenfehler */
  exactness: "tolerant" | "strict";
  notes: string;
};

export const SUBJECTS: Record<SubjectId, SubjectDefinition> = {
  english: {
    id: "english",
    labelDe: "Englisch",
    labelEn: "English",
    status: "active",
    skillAxes: [
      "speaking",
      "listening",
      "reading",
      "writing",
      "vocabulary",
      "grammar",
    ],
    exactness: "tolerant",
    notes: "Referenzfach Phase 1 — Aussprache, Grammatik, Vokabular, Konversation.",
  },
  math: {
    id: "math",
    labelDe: "Mathematik",
    labelEn: "Math",
    status: "planned",
    skillAxes: ["calculation", "reasoning", "methods"],
    exactness: "strict",
    notes: "Exakte Berechnungen, Schritt-für-Schritt — AI-3-Pipeline Pflicht.",
  },
  science: {
    id: "science",
    labelDe: "Naturwissenschaften",
    labelEn: "Science",
    status: "planned",
    skillAxes: ["facts", "reasoning", "methods"],
    exactness: "strict",
    notes: "Faktentreue (Formeln, Gesetze); Sicherheitshinweise bei Experimenten.",
  },
  history: {
    id: "history",
    labelDe: "Geschichte",
    labelEn: "History",
    status: "planned",
    skillAxes: ["facts", "reading", "writing", "reasoning"],
    exactness: "strict",
    notes: "Chronologie, Quellen, Zusammenhänge.",
  },
  language: {
    id: "language",
    labelDe: "Weitere Sprachen",
    labelEn: "Other languages",
    status: "planned",
    skillAxes: [
      "speaking",
      "listening",
      "reading",
      "writing",
      "vocabulary",
      "grammar",
    ],
    exactness: "tolerant",
    notes: "Gleiches Sprachmodell wie Englisch, andere Prompt-Bibliothek.",
  },
};

export const DEFAULT_SUBJECT_ID: SubjectId = "english";

export function getSubject(id: SubjectId = DEFAULT_SUBJECT_ID): SubjectDefinition {
  return SUBJECTS[id] ?? SUBJECTS.english;
}

export function activeSubjects(): SubjectDefinition[] {
  return Object.values(SUBJECTS).filter((s) => s.status === "active");
}

export function plannedSubjects(): SubjectDefinition[] {
  return Object.values(SUBJECTS).filter((s) => s.status === "planned");
}
