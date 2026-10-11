/**
 * Eine Qestra-KI — alle ehemaligen student/teacher/main-Mock-Pfade hier gebündelt.
 */
import type {
  ActivityAnalysis,
  ActivityProposal,
  AIComparison,
  LearningState,
  LessonDraft,
} from "@/lib/types";
import { getSubject } from "@/lib/subjects";
import { delay } from "@/lib/utils";
import { decideAIRoute, type AIMode } from "@/lib/ai/roles";

function subjectLabel(state: LearningState) {
  return getSubject(state.subjectId).labelDe;
}

export const qestraAI = {
  mode: "chat" as AIMode,

  async chat(state: LearningState, question: string): Promise<string> {
    await delay();
    void decideAIRoute({
      conversationOnly: true,
      deliversLearningContent: false,
      requiresExactFacts: false,
    });
    return (
      `Qestra KI (${subjectLabel(state)}): Für ${state.name} (${state.cefrLevel}) — ` +
      `${question.trim() || "Was als Nächstes?"}\n` +
      `Fokus: ${state.currentFocus[0] ?? "Übung"}. Interessen: ${state.interests[0] ?? "—"}. ` +
      `Kein Druck — Pause ist ok. Lehrer entscheidet bei Live-Lessons.`
    );
  },

  async interpretRequest(text: string, state: LearningState): Promise<string> {
    await delay();
    return `${state.name} möchte: „${text}“. Passend: kurze ${state.interests[0] ?? "Thema"}-Übung auf ${state.cefrLevel} (${subjectLabel(state)}).`;
  },

  async analyzeActivity(
    input: ActivityAnalysis,
    state: LearningState
  ): Promise<string> {
    await delay();
    return `${state.name} war bei ${state.interests[0] ?? "der Aktivität"} engagiert${
      input.speakingSignals?.answerLength
        ? "; Speaking-Antworten länger als üblich"
        : ""
    }. Weiter üben: ${state.weaknesses[0] ?? "Kernskills"}.`;
  },

  async recommendLesson(state: LearningState, goal: string): Promise<string> {
    await delay();
    return `Empfehlung (${subjectLabel(state)}): ${state.cefrLevel}-Einheit für ${state.name} zu „${goal}“, mit ${state.interests[0] ?? "Interessen"}. Lehrer gibt frei.`;
  },

  async analyzeClass(states: LearningState[]): Promise<string[]> {
    await delay();
    return states.map(
      (s) =>
        `${s.name} [${getSubject(s.subjectId).labelDe}]: ${s.currentFocus[0] ?? "Übung"} · ${s.currentRecommendation?.title ?? "nächste Aktivität"}`
    );
  },

  async compareAnalyses(input: {
    studentAnalysis: string;
    teacherAnalysis: string;
    state: LearningState;
    requiresTeacherApproval: boolean;
  }): Promise<AIComparison> {
    await delay(400);
    return {
      studentRecommendation: input.studentAnalysis,
      teacherRecommendation: input.teacherAnalysis,
      agreementScore: 90,
      disagreements: [],
      mainDecision: `Nächster Schritt für ${input.state.name}: kurze Übung zu ${input.state.weaknesses[0] ?? "Fokus"}.`,
      reasoning: [
        "Eine KI, ein Entscheid",
        input.requiresTeacherApproval
          ? "Lehrer-Freigabe nötig"
          : "Solo — Vorschlag darf gezeigt werden",
      ],
      confidence: 0.9,
      requiresTeacherApproval: input.requiresTeacherApproval,
    };
  },

  async recommendNextActivity(
    state: LearningState,
    comparison: AIComparison
  ): Promise<ActivityProposal> {
    await delay();
    return {
      id: `prop-${Date.now()}`,
      title: `${state.interests[0] ?? "Quest"} Challenge`,
      description: comparison.mainDecision,
      level: state.cefrLevel,
      durationMinutes: 10,
      skill: state.currentFocus[0] ?? "practice",
      focus: state.currentFocus,
      support: ["hints"],
      personalization: state.interests.slice(0, 2),
      status: "pending",
      aiReasoning: comparison.reasoning,
      topic: state.interests[0] ?? subjectLabel(state),
    };
  },

  async generateLesson(input: {
    state: LearningState;
    goal: string;
    duration: number;
    instruction?: string;
  }): Promise<LessonDraft> {
    await delay(600);
    const topic = input.state.interests[0] ?? subjectLabel(input.state);
    const note = input.instruction ?? `Ziel: ${input.goal}`;
    return {
      id: `lesson-${Date.now()}`,
      studentId: input.state.studentId,
      title: `${topic}: ${input.goal}`,
      durationMinutes: input.duration,
      level: input.state.cefrLevel,
      status: "draft",
      studentAiNote: note,
      teacherAiNote: `Lehrer steuert Freigabe. Fach: ${subjectLabel(input.state)}.`,
      mainAiNote: "Eine Qestra-KI — kein Zwang, kein Fortschrittsverlust.",
      activities: [
        {
          id: "a1",
          order: 1,
          title: "Warm-up",
          durationMinutes: Math.max(3, Math.floor(input.duration * 0.2)),
          status: "draft",
        },
        {
          id: "a2",
          order: 2,
          title: "Hauptquest",
          durationMinutes: Math.max(5, Math.floor(input.duration * 0.5)),
          status: "draft",
        },
        {
          id: "a3",
          order: 3,
          title: "Reflexion",
          durationMinutes: Math.max(2, Math.floor(input.duration * 0.2)),
          status: "draft",
        },
      ],
    };
  },

  async updateLearningState(
    state: LearningState,
    analysis: ActivityAnalysis
  ): Promise<LearningState> {
    await delay();
    return {
      ...state,
      lastUpdated: new Date().toISOString(),
      lastActive: new Date().toISOString().slice(0, 10),
      xp: state.xp + (analysis.score ?? 5),
    };
  },

  async fillGameTemplate(input: {
    templateId: string;
    templateLabel: string;
    state: LearningState;
    topic: string;
  }): Promise<string> {
    await delay(500);
    void decideAIRoute({
      conversationOnly: false,
      deliversLearningContent: true,
      requiresExactFacts: getSubject(input.state.subjectId).exactness === "strict",
    });
    return (
      `Template „${input.templateLabel}“ gefüllt für ${subjectLabel(input.state)} / ${input.state.name}.\n` +
      `Thema: ${input.topic}\n` +
      `Niveau: ${input.state.cefrLevel}\n` +
      `3 Items mit Interesse „${input.state.interests[0] ?? input.topic}“ — bereit zur Lehrer-Freigabe.`
    );
  },
};

/** Rückwärtskompatible Aliase → eine KI */
export const mainAI = {
  compareAnalyses: qestraAI.compareAnalyses.bind(qestraAI),
  recommendNextActivity: qestraAI.recommendNextActivity.bind(qestraAI),
  generateLesson: qestraAI.generateLesson.bind(qestraAI),
  updateLearningState: qestraAI.updateLearningState.bind(qestraAI),
};

export const studentAI = {
  analyzeStudent: async (state: LearningState) =>
    qestraAI.chat(state, "Kurzprofil"),
  interpretStudentRequest: qestraAI.interpretRequest.bind(qestraAI),
  analyzeActivity: qestraAI.analyzeActivity.bind(qestraAI),
};

export const teacherAI = {
  analyzeTeachingNeeds: async (
    _input: ActivityAnalysis,
    state: LearningState
  ) => qestraAI.recommendLesson(state, state.currentFocus[0] ?? "practice"),
  recommendLesson: qestraAI.recommendLesson.bind(qestraAI),
  analyzeClass: qestraAI.analyzeClass.bind(qestraAI),
};
