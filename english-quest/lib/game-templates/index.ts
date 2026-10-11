/** Fachneutrale Spiel-Templates — Inhalt kommt von der einen Qestra-KI */

export type GameTemplateId =
  | "quiz"
  | "memory"
  | "cloze"
  | "match"
  | "timeline"
  | "drag_drop";

export type GameTemplate = {
  id: GameTemplateId;
  labelDe: string;
  description: string;
  interaction: string;
};

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: "quiz",
    labelDe: "Quiz",
    description: "Multiple-Choice Fragen zum Fachinhalt",
    interaction: "mcq",
  },
  {
    id: "memory",
    labelDe: "Memory",
    description: "Paare finden (Begriff ↔ Erklärung)",
    interaction: "memory",
  },
  {
    id: "cloze",
    labelDe: "Lückentext",
    description: "Sätze mit Lücken ergänzen",
    interaction: "cloze",
  },
  {
    id: "match",
    labelDe: "Zuordnung",
    description: "Elemente per Drag zuordnen",
    interaction: "match",
  },
  {
    id: "timeline",
    labelDe: "Zeitstrahl",
    description: "Ereignisse in Reihenfolge bringen",
    interaction: "timeline",
  },
  {
    id: "drag_drop",
    labelDe: "Drag & Drop",
    description: "Bausteine an die richtige Stelle",
    interaction: "drag_drop",
  },
];

export function getGameTemplate(id: GameTemplateId): GameTemplate {
  return GAME_TEMPLATES.find((t) => t.id === id) ?? GAME_TEMPLATES[0];
}
