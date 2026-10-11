import type { SubjectId } from "@/lib/subjects";

export type SchoolType =
  | "grundschule"
  | "mittelschule"
  | "realschule"
  | "gymnasium"
  | "gesamtschule"
  | "berufsschule"
  | "other";

export type LearningGoal =
  | "better-grade"
  | "exam"
  | "homework"
  | "gaps"
  | "fun"
  | "speaking";

export type LearningMode = "solo" | "live-teacher" | "both";

export type DayPart = "afternoon" | "evening";

export type Weekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type SubjectProgress = {
  subjectId: SubjectId;
  xp: number;
  levelLabel: string;
  goals: LearningGoal[];
  interests: string[];
};

export type StudentSetupProfile = {
  subjectIds: SubjectId[];
  gradeLevel: number;
  schoolType: SchoolType;
  federalState: string;
  goalsBySubject: Record<string, LearningGoal[]>;
  levelsBySubject: Record<string, string>;
  interests: string[];
  learningMode: LearningMode;
  preferredWeekdays: Weekday[];
  preferredDayParts: DayPart[];
  timezone: string;
};

export type TeacherPublicProfile = {
  id: string;
  firstName: string;
  lastInitial: string;
  photoUrl: string | null;
  bioShort: string;
  bioLong: string;
  videoUrl: string | null;
  subjects: SubjectId[];
  gradeLevels: number[];
  languagesSpoken: string[];
  focusTags: string[];
  style: string;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  lessonsTaught: number;
  /** Preis in Credits/Stunde — Zahlung später anbindbar */
  priceCreditsPerHour: number | null;
  currencyNote: "credits-placeholder";
  trialMinutes: number;
  nextFreeSlotIso: string | null;
  approved: boolean;
};

export type AvailabilitySlot = {
  id: string;
  teacherId: string;
  weekday: Weekday;
  startMinutes: number; // 0–1440 local teacher TZ
  endMinutes: number;
  timezone: string;
};

export type AvailabilityException = {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  blocked: boolean;
  note?: string;
};

export type LessonStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";

export type LessonBooking = {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: SubjectId;
  topic: string;
  startsAt: string; // ISO UTC
  durationMinutes: 25 | 45 | 60;
  status: LessonStatus;
  isTrial: boolean;
  recurringRule: string | null; // RRULE-ish simple
  dailyRoomUrl: string | null;
  dailyRoomName: string | null;
  summary: string | null;
  homework: string | null;
  unlockedGameIds: string[];
  createdAt: string;
  updatedAt: string;
  cancelReason: string | null;
};

export type ChatMessage = {
  id: string;
  lessonId: string | null;
  teacherId: string;
  studentId: string;
  fromRole: "student" | "teacher";
  text: string;
  createdAt: string;
  reported: boolean;
};

export type TeacherReview = {
  id: string;
  teacherId: string;
  studentId: string;
  lessonId: string;
  stars: number;
  text: string;
  createdAt: string;
};
