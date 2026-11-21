import { describe, expect, it } from "vitest";
import { isMagicLinkValid } from "./magic-link";

describe("magic link", () => {
  it("verfällt nach Ablauf", () => {
    expect(
      isMagicLinkValid(
        { tokenHash: "x", userId: "u", expiresAt: Date.now() - 1000, used: false },
        Date.now()
      )
    ).toBe(false);
  });

  it("gültig wenn nicht used und nicht abgelaufen", () => {
    expect(
      isMagicLinkValid(
        {
          tokenHash: "x",
          userId: "u",
          expiresAt: Date.now() + 60_000,
          used: false,
        },
        Date.now()
      )
    ).toBe(true);
  });
});
