import type { ActivityLogEntry } from "@/lib/types";
import { formatDateTimeDe, parseLogTimestamp } from "@/lib/format/datetime";

const CATEGORY_DE: Record<string, string> = {
  "Qestra KI": "Qestra KI",
  "Student AI": "Schüler-KI",
  "Teacher AI": "Lehrer-KI",
  "Main AI": "Qestra KI",
  Translator: "Übersetzer",
  Activities: "Aktivitäten",
  Hints: "Hinweise",
  Permissions: "Freigaben",
  Navigation: "Navigation",
  Warnings: "Hinweise",
  "Learning State": "Lernstand",
  All: "Alle",
};

export function createLog(
  partial: Omit<ActivityLogEntry, "id" | "timestamp"> & {
    timestamp?: string;
  }
): ActivityLogEntry {
  const timestamp = partial.timestamp ?? new Date().toISOString();
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...partial,
    timestamp,
  };
}

export function filterLogs(
  logs: ActivityLogEntry[],
  category: ActivityLogEntry["category"] | "All"
) {
  if (category === "All") return logs;
  return logs.filter((l) => l.category === category);
}

export function formatLogTimestamp(raw: string): string {
  const d = parseLogTimestamp(raw);
  if (!d) return "—";
  return formatDateTimeDe(d);
}

export function categoryLabelDe(category: string): string {
  return CATEGORY_DE[category] ?? category;
}

/** Menschliche Protokollzeile */
export function formatLogMessageDe(entry: ActivityLogEntry): string {
  let msg = entry.message
    .replace(/\bNavigation\b/gi, "Navigation")
    .replace(/\bMain AI\b/gi, "Qestra KI")
    .replace(/\bStudent AI\b/gi, "Schüler-KI")
    .replace(/\bTeacher AI\b/gi, "Lehrer-KI");
  // Interne Keys in Klammern entfernen wenn wie "· alex" am Ende nach Navigation
  msg = msg.replace(/\s*·\s*[a-z0-9\-]{2,20}\s*$/i, (m) => {
    // behalte wenn es ein Name mit Großbuchstabe wäre — Roh-IDs klein
    return /^[\s·]+[a-z][a-z0-9\-]*$/.test(m) ? "" : m;
  });
  return msg.trim();
}

export function logsToCsv(logs: ActivityLogEntry[]): string {
  const header = "Zeit;Schüler;Kategorie;Nachricht";
  const rows = logs.map((l) => {
    const cells = [
      formatLogTimestamp(l.timestamp),
      l.studentId ?? "",
      categoryLabelDe(l.category),
      formatLogMessageDe(l).replace(/;/g, ","),
    ];
    return cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(";");
  });
  return [header, ...rows].join("\n");
}
