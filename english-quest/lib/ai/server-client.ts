/**
 * Client for PHP APIs on Hetzner (Mistral AI + Daily.co).
 */

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

const VIDEO_UNAVAILABLE =
  "Video gerade nicht verfügbar, bitte später erneut versuchen.";

export async function callServerAI(payload: {
  action: string;
  question?: string;
  student?: Record<string, unknown>;
  text?: string;
  schema?: string;
}): Promise<string | null> {
  const base = apiBase();
  if (!base || typeof window === "undefined") return null;

  try {
    const res = await fetch(`${base}/ai.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; text?: string };
    if (!data.ok || !data.text) return null;
    return data.text;
  } catch {
    return null;
  }
}

export type DailyRoom = {
  id?: string | null;
  name: string;
  url: string;
  studentId?: string;
  lessonId?: string | null;
  ownerToken?: string | null;
  participantToken?: string | null;
  expiresAt?: string;
};

async function dailyPost(body: Record<string, unknown>) {
  const base = apiBase();
  if (!base || typeof window === "undefined") {
    throw new Error(VIDEO_UNAVAILABLE);
  }

  const res = await fetch(`${base}/daily.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: { ok?: boolean; error?: string; room?: DailyRoom | null } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    throw new Error(VIDEO_UNAVAILABLE);
  }

  if (!res.ok || !data.ok) {
    throw new Error(data.error || VIDEO_UNAVAILABLE);
  }

  return data.room ?? null;
}

export async function createDailyMeeting(
  studentId: string,
  opts?: {
    lessonId?: string;
    durationMinutes?: number;
    displayName?: string;
    role?: "teacher" | "student";
  }
): Promise<DailyRoom> {
  const room = await dailyPost({
    action: "create",
    studentId,
    lessonId: opts?.lessonId,
    durationMinutes: opts?.durationMinutes,
    displayName: opts?.displayName,
    role: opts?.role ?? "teacher",
  });
  if (!room?.url) {
    throw new Error(VIDEO_UNAVAILABLE);
  }
  return room;
}

export async function fetchDailyMeeting(
  studentId?: string,
  lessonId?: string
): Promise<DailyRoom | null> {
  const base = apiBase();
  if (!base || typeof window === "undefined") return null;
  try {
    const q = new URLSearchParams();
    if (studentId) q.set("studentId", studentId);
    if (lessonId) q.set("lessonId", lessonId);
    const qs = q.toString() ? `?${q}` : "";
    const res = await fetch(`${base}/daily.php${qs}`, { method: "GET" });
    const data = (await res.json()) as {
      ok?: boolean;
      room?: DailyRoom | null;
    };
    if (!res.ok || !data.ok || !data.room?.url) return null;
    return data.room;
  } catch {
    return null;
  }
}

export async function endDailyMeetingRemote(
  lessonId?: string
): Promise<void> {
  try {
    await dailyPost({ action: "end", lessonId });
  } catch {
    /* ignore */
  }
}
