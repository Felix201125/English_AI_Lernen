import { describe, expect, it } from "vitest";
import {
  applyAnswerXp,
  finalizeGuestCompletion,
  mergeGuestIntoStudent,
} from "./merge";
import { emptyGuestPayload, GUEST_BADGE_FIRST_QUEST } from "./types";

describe("guest merge", () => {
  it("addiert XP und union Badges, Interessen wenn leer", () => {
    const guest = {
      ...emptyGuestPayload(),
      xp: 50,
      badgeIds: [GUEST_BADGE_FIRST_QUEST],
      interestIds: ["Football", "Music"],
      questStatus: "done" as const,
    };
    const r = mergeGuestIntoStudent(
      { xp: 10, interests: [], badgeIds: [] },
      guest,
      { tokenId: "tok-1" }
    );
    expect(r.applied).toBe(true);
    expect(r.student.xp).toBe(60);
    expect(r.student.interests).toEqual(["Football", "Music"]);
    expect(r.student.badgeIds).toContain(GUEST_BADGE_FIRST_QUEST);
  });

  it("ist idempotent bei gleichem Token", () => {
    const guest = {
      ...emptyGuestPayload(),
      xp: 40,
      questStatus: "done" as const,
      badgeIds: [GUEST_BADGE_FIRST_QUEST],
    };
    const first = mergeGuestIntoStudent(
      { xp: 0, interests: [], badgeIds: [] },
      guest,
      { tokenId: "tok-1" }
    );
    const second = mergeGuestIntoStudent(first.student, guest, {
      tokenId: "tok-1",
    });
    expect(second.applied).toBe(false);
    expect(second.reason).toBe("already_merged");
    expect(second.student.xp).toBe(40);
  });

  it("überschreibt Interessen nicht wenn schon gesetzt", () => {
    const guest = {
      ...emptyGuestPayload(),
      xp: 10,
      interestIds: ["Space"],
      questStatus: "done" as const,
    };
    const r = mergeGuestIntoStudent(
      { xp: 5, interests: ["Music"], badgeIds: ["x"] },
      guest,
      { tokenId: "t2" }
    );
    expect(r.student.interests).toEqual(["Music"]);
    expect(r.student.xp).toBe(15);
  });

  it("lehnt abgelaufenes und fremd-gemergtes Token ab", () => {
    const guest = { ...emptyGuestPayload(), xp: 99 };
    expect(
      mergeGuestIntoStudent(
        { xp: 0, interests: [], badgeIds: [] },
        guest,
        { tokenId: "t", expired: true }
      ).reason
    ).toBe("expired");
    expect(
      mergeGuestIntoStudent(
        { xp: 0, interests: [], badgeIds: [] },
        guest,
        { tokenId: "t", alreadyMergedIntoOther: true }
      ).reason
    ).toBe("merged_elsewhere");
  });

  it("applyAnswerXp verdoppelt nicht", () => {
    let p = emptyGuestPayload();
    p = applyAnswerXp(p, "q1", true, 20);
    p = applyAnswerXp(p, "q1", true, 20);
    expect(p.xp).toBe(20);
    expect(p.answers).toHaveLength(1);
  });

  it("finalize vergibt Erstes-Quest-Badge", () => {
    const done = finalizeGuestCompletion(emptyGuestPayload());
    expect(done.questStatus).toBe("done");
    expect(done.badgeIds).toContain(GUEST_BADGE_FIRST_QUEST);
  });
});
