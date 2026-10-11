import type { SubjectId } from "@/lib/subjects";

export type AgeGroup = "child" | "teenager" | "adult";
export type UiMode = AgeGroup;
export type { SubjectId };

export type PermissionMode =
  | "allowed"
  | "disabled"
  | "teacher-approval"
  | "available-after-request";

export type ActivityStatus =
  | "locked"
  | "pending"
  | "approved"
  | "released"
  | "active"
  | "paused"
  | "completed"
  | "revoked"
  | "draft";

export type TeacherReplyPolicy = "ai-may-reply" | "always-ask-teacher";

export type LessonPermissions = {
  activityAccess: PermissionMode;
  aiActivities: PermissionMode;
  studentAIChat: PermissionMode;
  translator: PermissionMode;
  hints: PermissionMode;
  answers: PermissionMode;
  skipActivity: PermissionMode;
  externalLinks: PermissionMode;
  speechAnalysis: PermissionMode;
  audioRecording: PermissionMode;
  aiProfileUpdates: PermissionMode;
  studentRequests: PermissionMode;
};

export type LearningMistake = {
  id: string;
  pattern: string;
  count: number;
  lastSeen: string;
};

export type ActivityPerformance = {
  activityId: string;
  title: string;
  completedAt: string;
  score?: number;
  xpEarned: number;
  status: ActivityStatus;
};

export type BehaviorSignal = {
  id: string;
  label: string;
  strength: number;
};

export type ActivityProposal = {
  id: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  skill: string;
  focus: string[];
  support: string[];
  personalization: string[];
  status: ActivityStatus;
  aiReasoning: string[];
  topic: string;
};

export type LearningState = {
  studentId: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  /** Aktives Fach — Learning State ist pro Fach gedacht */
  subjectId: SubjectId;
  cefrLevel: string;
  readingLevel: string;
  speakingLevel: string;
  listeningLevel: string;
  writingLevel: string;
  vocabularyLevel: string;
  grammarLevel: string;
  skills: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    vocabulary: number;
    grammar: number;
  };
  interests: string[];
  goals: string[];
  strengths: string[];
  weaknesses: string[];
  commonMistakes: LearningMistake[];
  activityHistory: ActivityPerformance[];
  behaviorSignals: BehaviorSignal[];
  currentFocus: string[];
  recommendedDifficulty: string;
  currentRecommendation?: ActivityProposal;
  teacherInstructions: string[];
  xp: number;
  lastActive: string;
  lastUpdated: string;
};

export type GameStep = {
  id: string;
  prompt: string;
  type: "mcq" | "speaking" | "image-choice" | "listen";
  options?: string[];
  imageOptions?: { id: string; label: string; emoji: string }[];
  correctId?: string;
  audioHint?: string;
};

export type Game = {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  durationMinutes: number;
  type:
    | "mystery"
    | "word-battle"
    | "story"
    | "escape-room"
    | "speaking"
    | "quiz"
    | "boss-battle";
  xpReward: number;
  status: ActivityStatus;
  personalization?: {
    interests: string[];
    targetSkills: string[];
    targetWeaknesses: string[];
    reason: string;
  };
  aiReasoning?: string[];
  steps: GameStep[];
  studentId?: string;
};

export type LessonPermissionsMap = Record<string, LessonPermissions>;

export type TranslationRequest = {
  id: string;
  studentId: string;
  studentName: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText?: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
  shown: boolean;
};

export type StudentMessage = {
  id: string;
  studentId: string;
  studentName: string;
  kind: "text" | "voice";
  text?: string;
  transcriptDe?: string;
  translationEn?: string;
  createdAt: string;
  status: "pending" | "ai-replied" | "approved" | "denied" | "answered";
  aiInterpretation?: string;
  teacherAiReview?: string;
  mainProposal?: ActivityProposal;
  aiReply?: string;
};

export type TeacherNotification = {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: "completion" | "request" | "translation" | "ai";
};

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  studentId?: string;
  category:
    | "Qestra KI"
    | "Student AI"
    | "Teacher AI"
    | "Main AI"
    | "Translator"
    | "Activities"
    | "Hints"
    | "Permissions"
    | "Navigation"
    | "Warnings"
    | "Learning State"
    | "All";
  message: string;
};

export type AIComparison = {
  studentRecommendation: string;
  teacherRecommendation: string;
  agreementScore: number;
  disagreements: string[];
  mainDecision: string;
  reasoning: string[];
  confidence: number;
  requiresTeacherApproval: boolean;
};

export type LessonDraft = {
  id: string;
  studentId: string;
  title: string;
  durationMinutes: number;
  level: string;
  status: ActivityStatus;
  studentAiNote: string;
  teacherAiNote: string;
  mainAiNote: string;
  activities: {
    id: string;
    order: number;
    title: string;
    durationMinutes: number;
    status: ActivityStatus;
  }[];
};

export type LiveLessonState = {
  active: boolean;
  studentId: string;
  currentActivityId?: string;
  studentScreenLocked: boolean;
  dailyRoomUrl?: string | null;
  dailyRoomName?: string | null;
};

export type ActivityAnalysis = {
  activityId: string;
  studentId: string;
  completed: boolean;
  score?: number;
  timeSpentSeconds?: number;
  hintsUsed: number;
  retries: number;
  strengthsObserved: string[];
  weaknessesObserved: string[];
  grammarMistakes: string[];
  vocabularyMistakes: string[];
  speakingSignals?: {
    confidence?: number;
    answerLength?: number;
    pronunciationNotes?: string[];
  };
  readingSignals?: {
    difficulty?: number;
    supportUsed?: string[];
  };
  engagementSignals?: {
    requestedActivity: boolean;
    completedVoluntarily: boolean;
    topicEngagement?: number;
  };
};
