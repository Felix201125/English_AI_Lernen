import { describe, expect, it } from "vitest";
import {
  clampHistoricScore,
  countFullyCorrect,
  scoreStep,
  totalScorePercent,
} from "./scoring";

describe("scoring", () => {
  it("full credit on first try without hint", () => {
    const s = scoreStep({
      stepId: "1",
      firstCorrect: true,
      usedHint: false,
      retried: false,
      attempts: 1,
    });
    expect(s.points).toBe(1);
  });

  it("partial credit after hint", () => {
    const s = scoreStep({
      stepId: "1",
      firstCorrect: true,
      usedHint: true,
      retried: false,
      attempts: 2,
    });
    expect(s.points).toBe(0.5);
  });

  it("never exceeds 100%", () => {
    const steps = [
      scoreStep({
        stepId: "a",
        firstCorrect: true,
        usedHint: false,
        retried: false,
        attempts: 1,
      }),
      scoreStep({
        stepId: "b",
        firstCorrect: true,
        usedHint: false,
        retried: false,
        attempts: 1,
      }),
      scoreStep({
        stepId: "c",
        firstCorrect: true,
        usedHint: false,
        retried: false,
        attempts: 1,
      }),
    ];
    // Bug-Simulation: 6 „correct“ Zählungen bei 3 Steps
    expect(totalScorePercent(steps, 3)).toBe(100);
    expect(countFullyCorrect(steps)).toBe(3);
  });

  it("clamps historic scores", () => {
    expect(clampHistoricScore(200)).toBe(100);
    expect(clampHistoricScore(-5)).toBe(0);
  });
});
