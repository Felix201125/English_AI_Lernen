import {
  emptyGuestPayload,
  GUEST_LS_KEY,
  type GuestPayload,
  type GuestSessionPublic,
} from "./types";
import { pickGuestQuest, getGuestQuest } from "./quests";
import {
  applyAnswerXp,
  finalizeGuestCompletion,
  mergeGuestIntoStudent,
  type MergeableStudent,
} from "./merge";

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

const LOCAL_KEY = "qestra.guest.session";

function loadLocal(): GuestSessionPublic | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestSessionPublic;
  } catch {
    return null;
  }
}

function saveLocal(session: GuestSessionPublic): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(session));
  localStorage.setItem(GUEST_LS_KEY, session.token);
}

async function postGuest(
  action: string,
  body: Record<string, unknown> = {}
): Promise<GuestSessionPublic | null> {
  const base = apiBase();
  if (!base || typeof window === "undefined") return null;
  try {
    const res = await fetch(`${base}/guest.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action, ...body }),
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    const data = (await res.json()) as {
      ok?: boolean;
      session?: GuestSessionPublic;
      error?: string;
    };
    if (!data.ok || !data.session) return null;
    saveLocal(data.session);
    return data.session;
  } catch {
    return null;
  }
}

function localStart(): GuestSessionPublic {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const session: GuestSessionPublic = {
    token,
    expiresAt: expires,
    payload: emptyGuestPayload(),
  };
  saveLocal(session);
  return session;
}

export async function guestStart(): Promise<GuestSessionPublic> {
  const remote = await postGuest("start");
  if (remote) return remote;
  return loadLocal() ?? localStart();
}

export async function guestQuestStart(
  interest: string,
  grade: number
): Promise<GuestSessionPublic> {
  const quest = pickGuestQuest(interest, grade);
  const remote = await postGuest("quest_start", { interest, grade });
  if (remote) return remote;

  const cur = loadLocal() ?? localStart();
  const next: GuestSessionPublic = {
    ...cur,
    payload: {
      ...cur.payload,
      interestIds: [interest],
      grade,
      questId: quest.id,
      subject: quest.subject,
      questStatus: "active",
      answers: [],
    },
  };
  saveLocal(next);
  return next;
}

export async function guestAnswer(
  questionId: string,
  optionIndex: number
): Promise<{ session: GuestSessionPublic; correct: boolean; xpGain: number }> {
  const cur = loadLocal();
  if (!cur?.payload.questId) {
    throw new Error("Keine aktive Quest.");
  }
  const quest = getGuestQuest(cur.payload.questId);
  if (!quest) throw new Error("Quest nicht gefunden.");
  const q = quest.questions.find((x) => x.id === questionId);
  if (!q) throw new Error("Frage nicht gefunden.");
  const correct = optionIndex === q.correctIndex;
  const xpGain = correct ? q.xp : 0;

  const remote = await postGuest("quest_answer", {
    questionId,
    optionIndex,
  });
  if (remote) {
    return { session: remote, correct, xpGain };
  }

  const payload = applyAnswerXp(cur.payload, questionId, correct, xpGain);
  const session = { ...cur, payload };
  saveLocal(session);
  return { session, correct, xpGain };
}

export async function guestAi(
  message: string
): Promise<{ reply: string; session: GuestSessionPublic }> {
  const cur = loadLocal();
  if (!cur) throw new Error("Keine Gast-Session.");
  if (cur.payload.aiMessagesUsed >= 3) {
    throw new Error(
      "In der Probe sind 3 Nachrichten drin. Mit kostenlosem Konto geht’s weiter."
    );
  }

  const remoteBase = apiBase();
  if (remoteBase) {
    try {
      const res = await fetch(`${remoteBase}/guest.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "ai",
          message,
          token: cur.token,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        session?: GuestSessionPublic;
        error?: string;
      };
      if (res.status === 429 || data.error) {
        throw new Error(
          data.error ||
            "Zu viele Anfragen. Bitte später erneut versuchen oder Konto anlegen."
        );
      }
      if (data.ok && data.reply && data.session) {
        saveLocal(data.session);
        return { reply: data.reply, session: data.session };
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Konto")) throw e;
      if (e instanceof Error && e.message.includes("Anfragen")) throw e;
    }
  }

  // Offline-Fallback: kurze Hilfestellung ohne Server
  const payload: GuestPayload = {
    ...cur.payload,
    aiMessagesUsed: cur.payload.aiMessagesUsed + 1,
  };
  const session = { ...cur, payload };
  saveLocal(session);
  const reply =
    "Gute Frage! Schau nochmal auf die Angaben in der Aufgabe und rechne Schritt für Schritt. " +
    "Mit einem kostenlosen Konto helfe ich dir ausführlicher.";
  return { reply, session };
}

export async function guestComplete(): Promise<GuestSessionPublic> {
  const remote = await postGuest("complete");
  if (remote) return remote;
  const cur = loadLocal();
  if (!cur) throw new Error("Keine Gast-Session.");
  const session = {
    ...cur,
    payload: finalizeGuestCompletion(cur.payload),
  };
  saveLocal(session);
  return session;
}

export function getLocalGuest(): GuestSessionPublic | null {
  return loadLocal();
}

export function getGuestTokenHint(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_LS_KEY);
}

export function applyGuestMergeToStudent(
  student: MergeableStudent,
  guest: GuestPayload | null,
  tokenId: string
): ReturnType<typeof mergeGuestIntoStudent> {
  return mergeGuestIntoStudent(student, guest, { tokenId });
}

export function clearLocalGuest(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_KEY);
  localStorage.removeItem(GUEST_LS_KEY);
}
