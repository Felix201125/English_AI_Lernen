import { describe, expect, it } from "vitest";
import { applyInviteRedeem, canRedeemInvite } from "./invites";

describe("invites", () => {
  const invite = {
    code: "Q-ABC",
    inviterUserId: "u1",
    createdAt: "2026-01-01",
    redeemedBy: [] as string[],
  };

  it("blockiert Selbst-Einladung", () => {
    expect(canRedeemInvite(invite, "u1").ok).toBe(false);
  });

  it("vergibt einmalig", () => {
    const once = applyInviteRedeem(invite, "u2");
    expect(once?.redeemedBy).toEqual(["u2"]);
    expect(applyInviteRedeem(once!, "u2")).toBeNull();
  });
});
