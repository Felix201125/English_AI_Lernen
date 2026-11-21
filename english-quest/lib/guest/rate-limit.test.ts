import { describe, expect, it } from "vitest";

/** Spiegel der Session-KI-Grenze (3) — PHP erzwingt zusätzlich IP-Tageslimit */
function canSendGuestAi(used: number, max = 3): boolean {
  return used < max;
}

describe("guest AI rate limit", () => {
  it("erlaubt genau 3 Nachrichten", () => {
    expect(canSendGuestAi(0)).toBe(true);
    expect(canSendGuestAi(2)).toBe(true);
    expect(canSendGuestAi(3)).toBe(false);
    expect(canSendGuestAi(4)).toBe(false);
  });
});
