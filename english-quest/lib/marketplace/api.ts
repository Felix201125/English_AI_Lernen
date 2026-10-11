import type {
  ChatMessage,
  LessonBooking,
  TeacherPublicProfile,
  TeacherReview,
} from "./types";
import type { FreeSlot } from "./availability";

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error("API antwortet nicht mit JSON");
  }
  const data = (await res.json()) as T & { ok?: boolean; error?: string };
  if ((data as { ok?: boolean }).ok === false) {
    throw new Error((data as { error?: string }).error || "Fehler");
  }
  return data;
}

async function postJson<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${apiBase()}/marketplace.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error("API antwortet nicht mit JSON");
  }
  const data = (await res.json()) as T & { ok?: boolean; error?: string };
  if (!res.ok || (data as { ok?: boolean }).ok === false) {
    throw new Error((data as { error?: string }).error || "Fehler");
  }
  return data;
}

export type TeacherListFilters = {
  subject?: string;
  grade?: number;
  lang?: string;
  minRating?: number;
  duration?: number;
};

export async function fetchTeachers(
  filters: TeacherListFilters = {}
): Promise<TeacherPublicProfile[]> {
  const q = new URLSearchParams({ action: "teachers" });
  if (filters.subject) q.set("subject", filters.subject);
  if (filters.grade) q.set("grade", String(filters.grade));
  if (filters.lang) q.set("lang", filters.lang);
  if (filters.minRating) q.set("minRating", String(filters.minRating));
  if (filters.duration) q.set("duration", String(filters.duration));
  const data = await getJson<{ teachers: TeacherPublicProfile[] }>(
    `${apiBase()}/marketplace.php?${q}`
  );
  return data.teachers;
}

export async function fetchTeacher(
  id: string,
  duration = 45
): Promise<{
  teacher: TeacherPublicProfile;
  slots: FreeSlot[];
  reviews: TeacherReview[];
}> {
  const q = new URLSearchParams({
    action: "teacher",
    id,
    duration: String(duration),
  });
  return getJson(`${apiBase()}/marketplace.php?${q}`);
}

export async function bookLesson(input: {
  studentId: string;
  teacherId: string;
  subjectId: string;
  topic?: string;
  startsAt: string;
  durationMinutes: 25 | 45 | 60;
  isTrial?: boolean;
  autoConfirm?: boolean;
  recurringRule?: string | null;
}): Promise<LessonBooking> {
  const data = await postJson<{ lesson: LessonBooking }>({
    action: "book",
    ...input,
  });
  return data.lesson;
}

export async function fetchLessons(opts: {
  studentId?: string;
  teacherId?: string;
}): Promise<LessonBooking[]> {
  const q = new URLSearchParams({ action: "lessons" });
  if (opts.studentId) q.set("studentId", opts.studentId);
  if (opts.teacherId) q.set("teacherId", opts.teacherId);
  const data = await getJson<{ lessons: LessonBooking[] }>(
    `${apiBase()}/marketplace.php?${q}`
  );
  return data.lessons;
}

export async function confirmLesson(lessonId: string): Promise<LessonBooking> {
  const data = await postJson<{ lesson: LessonBooking }>({
    action: "confirm",
    lessonId,
  });
  return data.lesson;
}

export async function cancelLesson(
  lessonId: string,
  reason?: string
): Promise<LessonBooking> {
  const data = await postJson<{ lesson: LessonBooking }>({
    action: "cancel",
    lessonId,
    reason,
  });
  return data.lesson;
}

export async function completeLesson(input: {
  lessonId: string;
  summary: string;
  homework: string;
  unlockedGameIds?: string[];
}): Promise<LessonBooking> {
  const data = await postJson<{ lesson: LessonBooking }>({
    action: "complete",
    ...input,
  });
  return data.lesson;
}

export async function attachLessonRoom(input: {
  lessonId: string;
  dailyRoomUrl: string;
  dailyRoomName: string;
}): Promise<LessonBooking> {
  const data = await postJson<{ lesson: LessonBooking }>({
    action: "attachRoom",
    ...input,
  });
  return data.lesson;
}

export async function sendMarketplaceMessage(input: {
  teacherId: string;
  studentId: string;
  text: string;
  fromRole: "student" | "teacher";
  lessonId?: string | null;
}): Promise<ChatMessage> {
  const data = await postJson<{ message: ChatMessage }>({
    action: "message",
    ...input,
  });
  return data.message;
}

export async function fetchMessages(opts: {
  studentId?: string;
  teacherId?: string;
}): Promise<ChatMessage[]> {
  const q = new URLSearchParams({ action: "messages" });
  if (opts.studentId) q.set("studentId", opts.studentId);
  if (opts.teacherId) q.set("teacherId", opts.teacherId);
  const data = await getJson<{ messages: ChatMessage[] }>(
    `${apiBase()}/marketplace.php?${q}`
  );
  return data.messages;
}

export async function reportMessage(messageId: string): Promise<void> {
  await postJson({ action: "reportMessage", messageId });
}

export async function submitReview(input: {
  teacherId: string;
  studentId: string;
  lessonId: string;
  stars: number;
  text: string;
}): Promise<TeacherReview> {
  const data = await postJson<{ review: TeacherReview }>({
    action: "review",
    ...input,
  });
  return data.review;
}

export async function saveTeacherProfile(
  teacherId: string,
  profile: Partial<TeacherPublicProfile>
): Promise<TeacherPublicProfile> {
  const data = await postJson<{ teacher: TeacherPublicProfile }>({
    action: "saveTeacherProfile",
    teacherId,
    profile,
  });
  return data.teacher;
}

export async function saveTeacherAvailability(
  teacherId: string,
  slots: Array<{
    id?: string;
    weekday: string;
    startMinutes: number;
    endMinutes: number;
    timezone?: string;
  }>
) {
  return postJson({ action: "saveAvailability", teacherId, slots });
}

export function icalUrl(studentId: string, token: string): string {
  const q = new URLSearchParams({
    action: "ical",
    studentId,
    token,
  });
  return `${apiBase()}/marketplace.php?${q}`;
}

export async function fetchIcalToken(studentId: string): Promise<string> {
  const q = new URLSearchParams({ action: "icalToken", studentId });
  const data = await getJson<{ token: string }>(
    `${apiBase()}/marketplace.php?${q}`
  );
  return data.token;
}
