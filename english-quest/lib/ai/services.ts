/**
 * Öffentliche AI-Exports — alles läuft über die eine Qestra-KI.
 */
export {
  qestraAI,
  mainAI,
  studentAI,
  teacherAI,
} from "@/lib/ai/qestra-ai";

export type { StudentAIService, TeacherAIService, MainAIService } from "@/lib/ai/service-types";
