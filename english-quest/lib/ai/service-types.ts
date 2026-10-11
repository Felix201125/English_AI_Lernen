import type {
  ActivityAnalysis,
  ActivityProposal,
  AIComparison,
  LearningState,
  LessonDraft,
} from "@/lib/types";

export interface StudentAIService {
  analyzeStudent(state: LearningState): Promise<string>;
  interpretStudentRequest(
    text: string,
    state: LearningState
  ): Promise<string>;
  analyzeActivity(
    input: ActivityAnalysis,
    state: LearningState
  ): Promise<string>;
}

export interface TeacherAIService {
  analyzeTeachingNeeds(
    input: ActivityAnalysis,
    state: LearningState
  ): Promise<string>;
  recommendLesson(state: LearningState, goal: string): Promise<string>;
  analyzeClass(states: LearningState[]): Promise<string[]>;
}

export interface MainAIService {
  compareAnalyses(input: {
    studentAnalysis: string;
    teacherAnalysis: string;
    state: LearningState;
    requiresTeacherApproval: boolean;
  }): Promise<AIComparison>;
  recommendNextActivity(
    state: LearningState,
    comparison: AIComparison
  ): Promise<ActivityProposal>;
  generateLesson(input: {
    state: LearningState;
    goal: string;
    duration: number;
    instruction?: string;
  }): Promise<LessonDraft>;
  updateLearningState(
    state: LearningState,
    analysis: ActivityAnalysis
  ): Promise<LearningState>;
}
