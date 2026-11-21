import { describe, expect, it } from "vitest";

function canPreview(count: number, max = 2): boolean {
  return count < max;
}

describe("guest worksheet limit", () => {
  it("erlaubt 1–2 Vorschauen pro Tag", () => {
    expect(canPreview(0)).toBe(true);
    expect(canPreview(1)).toBe(true);
    expect(canPreview(2)).toBe(false);
  });
});
