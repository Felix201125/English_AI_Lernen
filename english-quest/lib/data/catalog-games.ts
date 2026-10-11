import type { Game } from "@/lib/types";
import { games as seedGames } from "@/lib/data/mock-students";

/** A2-Spiele für alle Schüler (nicht an Demo-IDs gebunden) */
export const sharedA2Games: Game[] = [
  {
    id: "g-vocab-match",
    title: "Vocabulary Match",
    description: "Match English words with the right meaning.",
    level: "A2",
    topic: "Vocabulary",
    durationMinutes: 8,
    type: "quiz",
    xpReward: 50,
    status: "released",
    personalization: {
      interests: ["Gaming", "Football"],
      targetSkills: ["Vocabulary"],
      targetWeaknesses: [],
      reason: "Core A2 vocabulary",
    },
    steps: [
      {
        id: "vm1",
        prompt: "Which word means 'Stadion'?",
        type: "mcq",
        options: ["library", "stadium", "kitchen"],
        correctId: "1",
        audioHint: "stadium = place for football matches",
      },
      {
        id: "vm2",
        prompt: "Choose the past form of 'go'.",
        type: "mcq",
        options: ["goed", "went", "gone"],
        correctId: "1",
      },
      {
        id: "vm3",
        prompt: "Say three words about your hobby.",
        type: "speaking",
        audioHint: "Speak slowly. Example: ball, team, win.",
      },
    ],
  },
  {
    id: "g-sentence-builder",
    title: "Sentence Builder",
    description: "Build correct Past Simple sentences.",
    level: "A2",
    topic: "Grammar",
    durationMinutes: 10,
    type: "quiz",
    xpReward: 60,
    status: "released",
    personalization: {
      interests: ["Football", "Music"],
      targetSkills: ["Grammar"],
      targetWeaknesses: ["Past Simple"],
      reason: "Past Simple practice",
    },
    steps: [
      {
        id: "sb1",
        prompt: "Pick the correct sentence.",
        type: "mcq",
        options: [
          "She play football yesterday.",
          "She played football yesterday.",
          "She plays football yesterday.",
        ],
        correctId: "1",
      },
      {
        id: "sb2",
        prompt: "Which sentence is correct?",
        type: "mcq",
        options: [
          "They didn't went home.",
          "They didn't go home.",
          "They don't went home.",
        ],
        correctId: "1",
      },
      {
        id: "sb3",
        prompt: "Tell me what you did last weekend (2–3 sentences).",
        type: "speaking",
        audioHint: "Use Past Simple: played, watched, visited…",
      },
    ],
  },
  {
    id: "g-listening-quiz",
    title: "Listening Quiz",
    description: "Listen carefully and choose what you hear.",
    level: "A2",
    topic: "Listening",
    durationMinutes: 8,
    type: "quiz",
    xpReward: 55,
    status: "released",
    personalization: {
      interests: ["Music", "Movies"],
      targetSkills: ["Listening"],
      targetWeaknesses: [],
      reason: "Listening comprehension",
    },
    steps: [
      {
        id: "lq1",
        prompt: "You hear: 'He bought a ticket.' What did he buy?",
        type: "mcq",
        options: ["a ticket", "a ticket machine", "a thicket"],
        correctId: "0",
        audioHint: "bought = past of buy",
      },
      {
        id: "lq2",
        prompt: "You hear: 'We went to the cinema.' Where did they go?",
        type: "mcq",
        options: ["the stadium", "the cinema", "the supermarket"],
        correctId: "1",
      },
      {
        id: "lq3",
        prompt: "Repeat: 'Yesterday I listened to music.'",
        type: "speaking",
        audioHint: "Focus on 'listened' and 'yesterday'.",
      },
    ],
  },
];

/** Katalog: Shared A2 + Seed-Spiele (für alle spielbar, wenn released) */
export function getStudentGameCatalog(): Game[] {
  const byId = new Map<string, Game>();
  for (const g of [...sharedA2Games, ...seedGames]) {
    if (!byId.has(g.id)) {
      byId.set(g.id, {
        ...g,
        // Freigegebene Spiele für alle Schüler nutzbar
        studentId:
          g.status === "released" || g.status === "active"
            ? undefined
            : g.studentId,
      });
    }
  }
  return Array.from(byId.values());
}
