/** Deutsche Datums-/Zeitformatierung in Nutzer-Zeitzone */

export function userTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin";
  } catch {
    return "Europe/Berlin";
  }
}

/** ISO oder legacy "10:04:12" → gültiges Date oder null */
export function parseLogTimestamp(raw: string): Date | null {
  if (!raw) return null;
  // ISO / RFC
  const iso = Date.parse(raw);
  if (!Number.isNaN(iso)) return new Date(iso);
  // Nur Uhrzeit (Seed) → heute + Zeit
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const d = new Date();
    d.setHours(Number(m[1]), Number(m[2]), Number(m[3] ?? 0), 0);
    return d;
  }
  return null;
}

export function formatDateTimeDe(
  input: string | Date | null | undefined,
  timeZone = userTimeZone()
): string {
  const d =
    input instanceof Date
      ? input
      : typeof input === "string"
        ? parseLogTimestamp(input)
        : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeDe(
  input: string | Date,
  timeZone = userTimeZone()
): string {
  const d = input instanceof Date ? input : parseLogTimestamp(input);
  if (!d) return "—";
  const now = new Date();
  const sameDay =
    formatDayKey(d, timeZone) === formatDayKey(now, timeZone);
  const time = new Intl.DateTimeFormat("de-DE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  if (sameDay) return `heute, ${time}`;
  return formatDateTimeDe(d, timeZone);
}

function formatDayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
