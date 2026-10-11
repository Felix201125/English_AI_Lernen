import type { CreditAccount } from "@/lib/credits";
import type { StudentSetupProfile } from "@/lib/marketplace/types";
import type { Game, LearningState } from "@/lib/types";

export type SubjectProgressSlice = {
  xp: number;
  levelLabel: string;
  goals: string[];
};

export type StudentPersistBundle = {
  studentId: string;
  userId?: string;
  learningState: LearningState;
  credits: CreditAccount;
  completedActivityIds: string[];
  gameProgress: Record<string, { step: number; status: string }>;
  onboardingDone: boolean;
  helpRequest?: { id: string; status: "open" | "accepted"; at: string } | null;
  setupProfile?: StudentSetupProfile | null;
  /** XP/Niveau pro Fach (zusätzlich zum aktiven LearningState) */
  progressBySubject?: Record<string, SubjectProgressSlice>;
};

const keyFor = (studentId: string) => `qestra.student.${studentId}`;

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

export function loadLocalBundle(studentId: string): StudentPersistBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (!raw) return null;
    return JSON.parse(raw) as StudentPersistBundle;
  } catch {
    return null;
  }
}

export function saveLocalBundle(bundle: StudentPersistBundle): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(bundle.studentId), JSON.stringify(bundle));
}

export async function fetchRemoteBundle(
  studentId: string,
  token?: string | null
): Promise<StudentPersistBundle | null> {
  const base = apiBase();
  if (!base || typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${base}/student.php?studentId=${encodeURIComponent(studentId)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json") || !res.ok) return null;
    const data = (await res.json()) as {
      ok?: boolean;
      bundle?: StudentPersistBundle | null;
    };
    return data.ok ? data.bundle ?? null : null;
  } catch {
    return null;
  }
}

export async function saveRemoteBundle(
  bundle: StudentPersistBundle,
  token?: string | null
): Promise<boolean> {
  saveLocalBundle(bundle);
  const base = apiBase();
  if (!base || typeof window === "undefined") return true;
  try {
    const res = await fetch(`${base}/student.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action: "save", bundle }),
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return true;
    const data = (await res.json()) as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return true;
  }
}

export function mergeGamesForStudent(
  catalog: Game[],
  studentId: string,
  completedIds: string[]
): Game[] {
  return catalog.map((g) => {
    const forAll = !g.studentId;
    const forMe = g.studentId === studentId;
    if (!forAll && !forMe && g.studentId) {
      // Demo-Schüler-Spiele für alle freigeben, wenn Status released
      if (g.status === "released" || g.status === "active") {
        return {
          ...g,
          studentId: undefined,
          status: completedIds.includes(g.id) ? "completed" : g.status,
        };
      }
    }
    return {
      ...g,
      status: completedIds.includes(g.id) ? "completed" : g.status,
    };
  });
}
