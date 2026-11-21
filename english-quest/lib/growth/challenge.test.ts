import { describe, expect, it } from "vitest";
import { classLeaderboard } from "./challenge";

describe("class challenge visibility", () => {
  it("zeigt keine klassenfremden Scores", () => {
    const board = classLeaderboard(
      {
        id: "c1",
        classId: "class-a",
        title: "Woche",
        weekStart: "2026-03-01",
        scores: { alex: 10, stranger: 99, emma: 5 },
      },
      ["alex", "emma"]
    );
    expect(board.map((b) => b.studentId)).toEqual(["alex", "emma"]);
  });
});
