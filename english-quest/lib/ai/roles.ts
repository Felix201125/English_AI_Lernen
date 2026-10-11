/**
 * Qestra: **eine** KI (Mistral).
 * „Rollen“ sind nur Prompt-Modi / interne Aufgaben — keine separaten AIs in der UI.
 */

export type AIMode =
  | "chat" // direkte Konversation
  | "recommend" // nächste Aktivität / Lesson-Tipp
  | "content" // Arbeitsblatt, Quest-Inhalt, Test
  | "game_fill" // Game-Template mit Fachinhalt füllen
  | "teacher"; // Lehrer-Kontext (Freigabe-Policy gilt)

export type AIRoute = "direct" | "content";

export const SINGLE_AI = {
  name: "Qestra KI",
  provider: "mistral",
  note: "Eine API, ein Assistent. Interne Modi steuern nur den Prompt.",
} as const;

/** Wann auslieferbarer Inhalt (strengere Prompt-Anweisung) vs. Chat */
export function decideAIRoute(input: {
  deliversLearningContent: boolean;
  requiresExactFacts: boolean;
  conversationOnly: boolean;
}): AIRoute {
  if (input.conversationOnly && !input.deliversLearningContent) {
    return "direct";
  }
  if (input.deliversLearningContent || input.requiresExactFacts) {
    return "content";
  }
  return "direct";
}
