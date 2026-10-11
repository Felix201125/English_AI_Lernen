import type { ActivityAnalysis } from "@/lib/types";

const evidence: ActivityAnalysis[] = [];

export function recordLearningEvidence(item: ActivityAnalysis) {
  evidence.unshift(item);
  return item;
}

export function getLearningEvidence(studentId?: string) {
  return studentId
    ? evidence.filter((e) => e.studentId === studentId)
    : [...evidence];
}
