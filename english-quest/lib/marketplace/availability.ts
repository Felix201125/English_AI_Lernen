import type {
  AvailabilityException,
  AvailabilitySlot,
  LessonBooking,
  Weekday,
} from "./types";

const WEEKDAYS: Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export function weekdayFromDate(d: Date, timeZone: string): Weekday {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  });
  const short = fmt.format(d).toLowerCase().slice(0, 3);
  const map: Record<string, Weekday> = {
    sun: "sun",
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
  };
  return map[short] ?? "mon";
}

export function minutesInZone(d: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

export function dateKeyInZone(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

/** Konflikterkennung: überlappende Intervalle (UTC ISO) */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function bookingConflicts(
  candidateStart: Date,
  durationMinutes: number,
  existing: LessonBooking[],
  ignoreId?: string
): boolean {
  const candidateEnd = new Date(
    candidateStart.getTime() + durationMinutes * 60_000
  );
  return existing.some((b) => {
    if (ignoreId && b.id === ignoreId) return false;
    if (b.status === "cancelled") return false;
    const s = new Date(b.startsAt);
    const e = new Date(s.getTime() + b.durationMinutes * 60_000);
    return intervalsOverlap(candidateStart, candidateEnd, s, e);
  });
}

export type FreeSlot = {
  startsAt: string;
  endsAt: string;
  teacherId: string;
};

/** Nächste freie Slots aus Wochenvorlage + Ausnahmen + bestehende Buchungen */
export function computeFreeSlots(input: {
  teacherId: string;
  slots: AvailabilitySlot[];
  exceptions: AvailabilityException[];
  bookings: LessonBooking[];
  from: Date;
  daysAhead: number;
  durationMinutes: number;
  studentTimeZone: string;
}): FreeSlot[] {
  const result: FreeSlot[] = [];
  const { teacherId, slots, exceptions, bookings, from, daysAhead, durationMinutes } =
    input;
  const teacherSlots = slots.filter((s) => s.teacherId === teacherId);
  if (!teacherSlots.length) return result;

  const tz = teacherSlots[0].timezone || "Europe/Berlin";

  for (let day = 0; day < daysAhead; day++) {
    const cursor = new Date(from.getTime() + day * 86_400_000);
    const key = dateKeyInZone(cursor, tz);
    const blocked = exceptions.some(
      (ex) => ex.teacherId === teacherId && ex.date === key && ex.blocked
    );
    if (blocked) continue;

    const wd = weekdayFromDate(cursor, tz);
    const daySlots = teacherSlots.filter((s) => s.weekday === wd);

    for (const slot of daySlots) {
      for (
        let startMin = slot.startMinutes;
        startMin + durationMinutes <= slot.endMinutes;
        startMin += durationMinutes
      ) {
        const startsAt = wallTimeToUtc(key, startMin, tz);
        if (!startsAt || startsAt < from) continue;
        if (
          bookingConflicts(
            startsAt,
            durationMinutes,
            bookings.filter((b) => b.teacherId === teacherId)
          )
        ) {
          continue;
        }
        const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
        result.push({
          teacherId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        });
      }
    }
  }

  return result.slice(0, 40);
}

/** Baut UTC-Date aus lokalem Kalendertag + Minuten in Zeitzone (näherungsweise) */
export function wallTimeToUtc(
  dateKey: string,
  minutes: number,
  timeZone: string
): Date | null {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return null;
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  // Probe: interpret as Europe-like offset via format roundtrip
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  const asZoneMin = minutesInZone(guess, timeZone);
  const delta = minutes - asZoneMin;
  return new Date(guess.getTime() + delta * 60_000);
}

export function formatSlotDe(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export { WEEKDAYS };
