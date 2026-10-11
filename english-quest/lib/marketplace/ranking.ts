import type { StudentSetupProfile, TeacherPublicProfile } from "./types";

/** „Passend für dich“ — Fach, Ziel, Niveau, Zeiten, Interessen */
export function scoreTeacherMatch(
  teacher: TeacherPublicProfile,
  setup: Partial<StudentSetupProfile> | null | undefined,
  filters: { subjectId?: string; goal?: string }
): number {
  if (!teacher.approved) return -1;
  let score = 0;

  const subjectId = filters.subjectId;
  if (subjectId && teacher.subjects.includes(subjectId)) score += 40;
  else if (
    setup?.subjectIds?.some((id) => teacher.subjects.includes(id))
  ) {
    score += 25;
  }

  const goals = subjectId
    ? setup?.goalsBySubject?.[subjectId] ?? []
    : Object.values(setup?.goalsBySubject ?? {}).flat();
  if (filters.goal && teacher.focusTags.includes(filters.goal)) score += 20;
  else if (goals.some((g) => teacher.focusTags.includes(g))) score += 15;

  if (setup?.gradeLevel && teacher.gradeLevels.includes(setup.gradeLevel)) {
    score += 15;
  }

  if (setup?.preferredWeekdays?.length) {
    // nextFreeSlot wird clientseitig gesetzt; hier Bonus über rating
    score += 5;
  }

  score += teacher.ratingAvg * 4;
  score += Math.min(10, teacher.lessonsTaught / 30);
  if (teacher.verified) score += 8;

  return score;
}

export function sortTeachers(
  teachers: TeacherPublicProfile[],
  sort: "match" | "rating" | "price" | "nextSlot",
  setup: Partial<StudentSetupProfile> | null | undefined,
  filters: { subjectId?: string; goal?: string }
): TeacherPublicProfile[] {
  const copy = [...teachers];
  if (sort === "rating") {
    return copy.sort(
      (a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount
    );
  }
  if (sort === "price") {
    return copy.sort((a, b) => {
      const pa = a.priceCreditsPerHour ?? Number.POSITIVE_INFINITY;
      const pb = b.priceCreditsPerHour ?? Number.POSITIVE_INFINITY;
      return pa - pb;
    });
  }
  if (sort === "nextSlot") {
    return copy.sort((a, b) => {
      const ta = a.nextFreeSlotIso
        ? new Date(a.nextFreeSlotIso).getTime()
        : Number.POSITIVE_INFINITY;
      const tb = b.nextFreeSlotIso
        ? new Date(b.nextFreeSlotIso).getTime()
        : Number.POSITIVE_INFINITY;
      return ta - tb;
    });
  }
  return copy.sort(
    (a, b) =>
      scoreTeacherMatch(b, setup, filters) - scoreTeacherMatch(a, setup, filters)
  );
}
