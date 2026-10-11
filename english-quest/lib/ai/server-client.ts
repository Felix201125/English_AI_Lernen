/**
 * Client for PHP APIs on Hetzner (Mistral AI + Daily.co).
 */

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

export async function callServerAI(payload: {
  action: string;
  question?: string;
  student?: Record<string, unknown>;
  text?: string;
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
};

async function dailyPost(body: Record<string, unknown>) {
  const base = apiBase();
  if (!base || typeof window === "undefined") {
    throw new Error(
      "API nicht erreichbar. Nach dem Upload auf Hetzner Daily-Key in api/config.php eintragen."
    );
  }

  const res = await fetch(`${base}/daily.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    error?: string;
    room?: DailyRoom | null;
  };

  if (!res.ok || !data.ok) {
    throw new Error(
      data.error ||
        "Daily-Anfrage fehlgeschlagen. Prüfe daily_api_key in api/config.php."
    );
  }

  return data.room ?? null;
}

export async function createDailyMeeting(studentId: string): Promise<DailyRoom> {
  const room = await dailyPost({ action: "create", studentId });
  if (!room?.url) {
    throw new Error("Meeting konnte nicht erstellt werden.");
  }
  return room;
}

export async function fetchDailyMeeting(
  studentId?: string
): Promise<DailyRoom | null> {
  const base = apiBase();
  if (!base || typeof window === "undefined") return null;
  try {
    const q = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
    const res = await fetch(`${base}/daily.php${q}`, { method: "GET" });
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

export async function endDailyMeetingRemote(): Promise<void> {
  try {
    await dailyPost({ action: "end" });
  } catch {
    // ignore — local UI still clears
  }
}
