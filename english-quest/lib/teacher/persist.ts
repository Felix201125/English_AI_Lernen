import type { LessonDraft, LessonPermissions } from "@/lib/types";

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

export type TeacherBundle = {
  lessons: LessonDraft[];
  permissions: Record<string, LessonPermissions>;
  updatedAt?: string | null;
};

const localKey = (teacherId: string) => `qestra.teacher.${teacherId}`;

export function loadLocalTeacherBundle(teacherId: string): TeacherBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(localKey(teacherId));
    return raw ? (JSON.parse(raw) as TeacherBundle) : null;
  } catch {
    return null;
  }
}

export function saveLocalTeacherBundle(
  teacherId: string,
  bundle: TeacherBundle
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(localKey(teacherId), JSON.stringify(bundle));
}

export async function fetchTeacherBundle(
  teacherId: string
): Promise<TeacherBundle | null> {
  const base = apiBase();
  if (!base || typeof window === "undefined") {
    return loadLocalTeacherBundle(teacherId);
  }
  try {
    const res = await fetch(
      `${base}/teacher.php?teacherId=${encodeURIComponent(teacherId)}`
    );
    const data = (await res.json()) as { ok?: boolean; bundle?: TeacherBundle };
    if (data.ok && data.bundle) {
      saveLocalTeacherBundle(teacherId, data.bundle);
      return data.bundle;
    }
  } catch {
    /* local */
  }
  return loadLocalTeacherBundle(teacherId);
}

export async function saveTeacherLesson(
  teacherId: string,
  lesson: LessonDraft
): Promise<boolean> {
  const local = loadLocalTeacherBundle(teacherId) ?? {
    lessons: [],
    permissions: {},
  };
  const lessons = [...local.lessons];
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  if (idx >= 0) lessons[idx] = lesson;
  else lessons.unshift(lesson);
  const bundle = { ...local, lessons };
  saveLocalTeacherBundle(teacherId, bundle);

  const base = apiBase();
  if (!base || typeof window === "undefined") return true;
  try {
    const res = await fetch(`${base}/teacher.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveLesson", teacherId, lesson }),
    });
    const data = (await res.json()) as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return true;
  }
}

export async function deleteTeacherLesson(
  teacherId: string,
  lessonId: string
): Promise<void> {
  const local = loadLocalTeacherBundle(teacherId);
  if (local) {
    saveLocalTeacherBundle(teacherId, {
      ...local,
      lessons: local.lessons.filter((l) => l.id !== lessonId),
    });
  }
  const base = apiBase();
  if (!base) return;
  try {
    await fetch(`${base}/teacher.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteLesson", teacherId, lessonId }),
    });
  } catch {
    /* ignore */
  }
}

export async function saveTeacherPermissionsRemote(
  teacherId: string,
  studentId: string,
  permissions: LessonPermissions
): Promise<void> {
  const local = loadLocalTeacherBundle(teacherId) ?? {
    lessons: [],
    permissions: {},
  };
  saveLocalTeacherBundle(teacherId, {
    ...local,
    permissions: { ...local.permissions, [studentId]: permissions },
  });
  const base = apiBase();
  if (!base) return;
  try {
    await fetch(`${base}/teacher.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "savePermissions",
        teacherId,
        studentId,
        permissions,
      }),
    });
  } catch {
    /* ignore */
  }
}
