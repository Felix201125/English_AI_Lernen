/** Mock AI implementations — no external API keys. */
export { studentAI, teacherAI, mainAI } from "@/lib/ai/services";
export {
  runActivityAnalysis,
  processStudentRequest,
  messageFromRequest,
} from "@/lib/ai/orchestrator";
