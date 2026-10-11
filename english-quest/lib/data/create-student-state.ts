import { soloPermissions } from "@/lib/data/mock-students";
import { DEFAULT_SUBJECT_ID } from "@/lib/subjects";
import type { LearningState, LessonPermissions } from "@/lib/types";

export function createStudentLearningState(
  studentId: string,
  name: string
): LearningState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    studentId,
    name,
    age: 12,
    ageGroup: "child",
    subjectId: DEFAULT_SUBJECT_ID,
    cefrLevel: "A2",
    readingLevel: "A2",
    speakingLevel: "A2",
    listeningLevel: "A2",
    writingLevel: "A2",
    vocabularyLevel: "A2",
    grammarLevel: "A2",
    skills: {
      speaking: 0,
      listening: 0,
      reading: 0,
      writing: 0,
      vocabulary: 0,
      grammar: 0,
    },
    interests: [],
    goals: [],
    strengths: [],
    weaknesses: [],
    commonMistakes: [],
    activityHistory: [],
    behaviorSignals: [],
    currentFocus: [],
    recommendedDifficulty: "A2",
    teacherInstructions: [],
    xp: 0,
    lastActive: today,
    lastUpdated: new Date().toISOString(),
  };
}

export function createStudentPermissions(): LessonPermissions {
  return soloPermissions();
}

export function slugStudentId(name: string, fallback: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return base || fallback.replace(/[^a-z0-9\-]/gi, "").toLowerCase() || "student";
}
