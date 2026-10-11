import type { LessonPermissions, PermissionMode } from "@/lib/types";

export const PERMISSION_META: Record<
  keyof LessonPermissions,
  { label: string; help: string }
> = {
  activityAccess: {
    label: "Aktivitäten öffnen",
    help: "Darf der Schüler freigegebene Übungen starten?",
  },
  aiActivities: {
    label: "KI-Aktivitäten",
    help: "Darf die KI Übungen vorschlagen, die du freigibst?",
  },
  studentAIChat: {
    label: "Chat mit der KI",
    help: "Darf der Schüler die Qestra-KI fragen?",
  },
  translator: {
    label: "Übersetzer",
    help: "Wörter nachschlagen / übersetzen.",
  },
  hints: {
    label: "Hinweise",
    help: "Hilfetexte während einer Aufgabe.",
  },
  answers: {
    label: "Lösungen anzeigen",
    help: "Lösungen einsehen (meist gesperrt).",
  },
  skipActivity: {
    label: "Aktivität überspringen",
    help: "Aufgabe ohne Abschluss verlassen.",
  },
  externalLinks: {
    label: "Externe Links",
    help: "Links außerhalb von Qestra öffnen.",
  },
  speechAnalysis: {
    label: "Sprachauswertung",
    help: "Auswertung von Sprechübungen.",
  },
  audioRecording: {
    label: "Audioaufnahme",
    help: "Mikrofon für Sprechaufgaben.",
  },
  aiProfileUpdates: {
    label: "KI darf Lernprofil aktualisieren",
    help: "Niveau/Fokus aus Ergebnissen anpassen.",
  },
  studentRequests: {
    label: "Anfragen an Lehrkraft",
    help: "Hilfe- oder Inhaltsanfragen senden.",
  },
};

export function modeLabelDe(mode: PermissionMode): string {
  switch (mode) {
    case "allowed":
      return "Erlaubt";
    case "disabled":
      return "Gesperrt";
    case "teacher-approval":
      return "Nach Freigabe";
    case "available-after-request":
      return "Nach Anfrage";
  }
}
