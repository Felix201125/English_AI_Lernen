import { decideAIRoute } from "@/lib/ai/roles";
import { qestraAI } from "@/lib/ai/qestra-ai";
import type {
  ActivityAnalysis,
  ActivityProposal,
  AIComparison,
  LearningState,
  StudentMessage,
} from "@/lib/types";

export type AIAnalysisResult = {
  studentAnalysis: string;
  teacherAnalysis: string;
  comparison: AIComparison;
  proposal: ActivityProposal;
  learningState: LearningState;
};

export type StudentRequestResult = {
  interpretation: string;
  teacherReview: string;
  comparison: AIComparison;
  proposal: ActivityProposal;
  autoReply?: string;
};

/** Eine KI: Analyse + Empfehlung in einem Pfad */
export async function runActivityAnalysis(input: {
  analysis: ActivityAnalysis;
  state: LearningState;
  liveLesson: boolean;
}): Promise<AIAnalysisResult> {
  const studentAnalysis = await qestraAI.analyzeActivity(
    input.analysis,
    input.state
  );
  const teacherAnalysis = await qestraAI.recommendLesson(
    input.state,
    input.state.currentFocus[0] ?? "practice"
  );
  const comparison = await qestraAI.compareAnalyses({
    studentAnalysis,
    teacherAnalysis,
    state: input.state,
    requiresTeacherApproval: input.liveLesson,
  });
  const proposal = await qestraAI.recommendNextActivity(
    input.state,
    comparison
  );
  const learningState = await qestraAI.updateLearningState(
    input.state,
    input.analysis
  );
  return {
    studentAnalysis,
    teacherAnalysis,
    comparison,
    proposal,
    learningState: {
      ...learningState,
      currentRecommendation: proposal,
    },
  };
}

export async function processStudentRequest(input: {
  text: string;
  state: LearningState;
  liveLesson: boolean;
  replyPolicy: "ai-may-reply" | "always-ask-teacher";
}): Promise<StudentRequestResult> {
  const route = decideAIRoute({
    conversationOnly: true,
    deliversLearningContent: false,
    requiresExactFacts: false,
  });
  void route;

  const interpretation = await qestraAI.interpretRequest(
    input.text,
    input.state
  );
  const teacherReview = await qestraAI.recommendLesson(
    input.state,
    input.state.currentFocus[0] ?? "practice"
  );
  const requiresApproval =
    input.liveLesson || input.replyPolicy === "always-ask-teacher";
  const comparison = await qestraAI.compareAnalyses({
    studentAnalysis: interpretation,
    teacherAnalysis: teacherReview,
    state: input.state,
    requiresTeacherApproval: requiresApproval,
  });
  const proposal = await qestraAI.recommendNextActivity(
    input.state,
    comparison
  );
  const autoReply = !requiresApproval
    ? `Hier ist ein Vorschlag für dich: ${proposal.title} (${proposal.durationMinutes} Min). Viel Spaß — Pause machen ist auch ok!`
    : undefined;
  return {
    interpretation,
    teacherReview,
    comparison,
    proposal,
    autoReply,
  };
}

export function messageFromRequest(
  result: StudentRequestResult,
  base: Omit<
    StudentMessage,
    | "aiInterpretation"
    | "teacherAiReview"
    | "mainProposal"
    | "aiReply"
    | "status"
  > & {
    status?: StudentMessage["status"];
  }
): StudentMessage {
  return {
    ...base,
    status: base.status ?? (result.autoReply ? "ai-replied" : "pending"),
    aiInterpretation: result.interpretation,
    teacherAiReview: result.teacherReview,
    mainProposal: result.proposal,
    aiReply: result.autoReply,
  };
}
