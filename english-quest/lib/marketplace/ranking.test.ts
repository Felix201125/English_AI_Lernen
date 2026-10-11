import { describe, expect, it } from "vitest";
import { scoreTeacherMatch, sortTeachers } from "./ranking";
import { SEED_TEACHERS } from "./seed";
import type { StudentSetupProfile } from "./types";

const setup: StudentSetupProfile = {
  subjectIds: ["english", "math"],
  gradeLevel: 8,
  schoolType: "gymnasium",
  federalState: "Bayern",
  goalsBySubject: { english: ["speaking", "exam"] },
  levelsBySubject: { english: "A2" },
  interests: ["football"],
  learningMode: "both",
  preferredWeekdays: ["tue", "thu"],
  preferredDayParts: ["afternoon"],
  timezone: "Europe/Berlin",
};

describe("scoreTeacherMatch", () => {
  it("prefers subject + grade overlap", () => {
    const lena = SEED_TEACHERS.find((t) => t.id === "seed-teacher-lena")!;
    const jonas = SEED_TEACHERS.find((t) => t.id === "seed-teacher-jonas")!;
    const sLena = scoreTeacherMatch(lena, setup, { subjectId: "english" });
    const sJonas = scoreTeacherMatch(jonas, setup, { subjectId: "english" });
    expect(sLena).toBeGreaterThan(sJonas);
  });
});

describe("sortTeachers", () => {
  it("sorts by match by default", () => {
    const sorted = sortTeachers(SEED_TEACHERS, "match", setup, {
      subjectId: "english",
    });
    expect(sorted[0].subjects).toContain("english");
  });
});
