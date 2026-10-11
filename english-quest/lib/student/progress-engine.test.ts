import { describe, expect, it } from "vitest";
import { applyActivityCompletion } from "./progress-engine";
import type { Game, LearningState } from "@/lib/types";
import { createStudentLearningState } from "@/lib/data/create-student-state";

const game: Game = {
  id: "g-football-mystery",
  title: "Football Transfer Mystery",
  description: "test",
  level: "A2",
  topic: "Football",
  durationMinutes: 10,
  type: "mystery",
  xpReward: 80,
  status: "released",
  steps: [],
  personalization: {
    interests: ["Football"],
    targetSkills: ["Speaking"],
    targetWeaknesses: ["Past Simple"],
    reason: "test",
  },
};

describe("applyActivityCompletion", () => {
  it("awards XP once and writes log", () => {
    const state = createStudentLearningState("felix", "Felix");
    const next = applyActivityCompletion(state, game, 85, 1);
    expect(next.xp).toBe(80);
    expect(next.activityHistory).toHaveLength(1);
    expect(next.activityHistory[0].xpEarned).toBe(80);
    expect(next.activityHistory[0].title).toBe("Football Transfer Mystery");
  });

  it("is idempotent on reload/complete again", () => {
    const state = createStudentLearningState("felix", "Felix");
    const once = applyActivityCompletion(state, game, 85, 0);
    const twice = applyActivityCompletion(once, game, 90, 0);
    expect(twice.xp).toBe(80);
    expect(twice.activityHistory).toHaveLength(1);
  });

  it("bumps skill from activity", () => {
    const state: LearningState = {
      ...createStudentLearningState("felix", "Felix"),
      skills: {
        speaking: 50,
        listening: 50,
        reading: 50,
        writing: 50,
        vocabulary: 50,
        grammar: 50,
      },
    };
    const next = applyActivityCompletion(state, game, 100, 0);
    expect(next.skills.speaking).toBeGreaterThan(50);
  });
});
