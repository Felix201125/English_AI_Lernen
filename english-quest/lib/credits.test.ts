import { describe, expect, it } from "vitest";
import {
  canSpend,
  createCreditAccount,
  spend,
  STUDENT_DAILY_CREDITS,
} from "./credits";

describe("credits", () => {
  it("starts at daily amount", () => {
    const a = createCreditAccount("student", "2026-10-11");
    expect(a.remaining).toBe(STUDENT_DAILY_CREDITS);
  });

  it("spends and blocks when empty", () => {
    let a = createCreditAccount("student", "2026-10-11");
    a = spend(a, 5, "2026-10-11");
    expect(a.remaining).toBe(195);
    expect(canSpend(a, 5)).toBe(true);
    a = spend({ ...a, remaining: 3 }, 5, "2026-10-11");
    expect(a.remaining).toBe(3);
    expect(canSpend(a, 5)).toBe(false);
  });

  it("resets on new day", () => {
    const a = spend(
      createCreditAccount("student", "2026-10-10"),
      50,
      "2026-10-10"
    );
    const next = spend(a, 5, "2026-10-11");
    expect(next.remaining).toBe(STUDENT_DAILY_CREDITS - 5);
  });
});
