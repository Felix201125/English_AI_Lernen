export const FUNNEL_EVENTS = [
  "landing_view",
  "probe_start",
  "probe_quest_complete",
  "register_start",
  "register_complete",
  "first_lesson_next_day",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export type FunnelRecord = {
  event: FunnelEvent;
  at: string;
  day: string;
  source?: string;
  utm?: Record<string, string>;
  abVariant?: "A" | "B";
};

export function recordEvent(
  list: FunnelRecord[],
  event: FunnelEvent,
  extra: Partial<FunnelRecord> = {}
): FunnelRecord[] {
  const at = new Date().toISOString();
  return [
    ...list,
    {
      event,
      at,
      day: at.slice(0, 10),
      ...extra,
    },
  ];
}

export function persistUtm(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = params.get(key);
    if (v) utm[key] = v;
  }
  if (typeof window !== "undefined" && Object.keys(utm).length) {
    localStorage.setItem("qestra.utm", JSON.stringify(utm));
  }
  return utm;
}

export function loadUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("qestra.utm") || "{}");
  } catch {
    return {};
  }
}

export function abBucket(cookieValue?: string | null): "A" | "B" {
  if (cookieValue === "A" || cookieValue === "B") return cookieValue;
  return Math.random() < 0.5 ? "A" : "B";
}
