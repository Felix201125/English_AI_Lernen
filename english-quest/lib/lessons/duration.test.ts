import { describe, expect, it } from "vitest";
import { splitDurationExact } from "./duration";

describe("splitDurationExact", () => {
  it("sums to 45", () => {
    const parts = splitDurationExact(45, [2, 5, 2]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(45);
    expect(parts.every((p) => p >= 1)).toBe(true);
  });

  it("sums to 30", () => {
    const parts = splitDurationExact(30, [1, 1, 1]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(30);
  });
});
