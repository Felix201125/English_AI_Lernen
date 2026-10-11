import type { LearningState, SubjectId } from "@/lib/types";
import { DEFAULT_SUBJECT_ID } from "@/lib/subjects";

/** Key: studentId::subjectId — Learning State ist fachübergreifend, pro Fach getrennt */
const store: Record<string, LearningState> = {};

function key(studentId: string, subjectId: SubjectId = DEFAULT_SUBJECT_ID) {
  return `${studentId}::${subjectId}`;
}

export function getLearningState(
  studentId: string,
  fallback: LearningState,
  subjectId?: SubjectId
): LearningState {
  const sid = subjectId ?? fallback.subjectId ?? DEFAULT_SUBJECT_ID;
  return store[key(studentId, sid)] ?? fallback;
}

export function updateLearningState(state: LearningState): LearningState {
  const sid = state.subjectId ?? DEFAULT_SUBJECT_ID;
  const next = {
    ...state,
    subjectId: sid,
    lastUpdated: new Date().toISOString(),
  };
  store[key(state.studentId, sid)] = next;
  return next;
}

export function setLearningStates(states: Record<string, LearningState>) {
  for (const state of Object.values(states)) {
    const sid = state.subjectId ?? DEFAULT_SUBJECT_ID;
    store[key(state.studentId, sid)] = { ...state, subjectId: sid };
  }
}

export function learningStateStoreKey(
  studentId: string,
  subjectId: SubjectId = DEFAULT_SUBJECT_ID
) {
  return key(studentId, subjectId);
}
