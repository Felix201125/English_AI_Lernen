import {
  emptyGuestPayload,
  GUEST_BADGE_FIRST_QUEST,
  type GuestPayload,
} from "./types";

export type MergeableStudent = {
  xp: number;
  interests: string[];
  badgeIds: string[];
  mergedGuestTokens?: string[];
};

export type MergeResult = {
  student: MergeableStudent;
  applied: boolean;
  reason?:
    | "already_merged"
    | "expired"
    | "empty"
    | "merged_elsewhere"
    | "ok";
};

/**
 * Idempotenter Gast→Konto-Merge: XP addieren, Badges union, Interessen wenn leer.
 */
export function mergeGuestIntoStudent(
  student: MergeableStudent,
  guest: GuestPayload | null | undefined,
  opts: {
    tokenId: string;
    expired?: boolean;
    alreadyMergedIntoOther?: boolean;
  }
): MergeResult {
  if (!guest) {
    return { student, applied: false, reason: "empty" };
  }
  if (opts.expired) {
    return { student, applied: false, reason: "expired" };
  }
  if (opts.alreadyMergedIntoOther) {
    return { student, applied: false, reason: "merged_elsewhere" };
  }
  const merged = student.mergedGuestTokens ?? [];
  if (merged.includes(opts.tokenId)) {
    return { student, applied: false, reason: "already_merged" };
  }

  const badgeIds = Array.from(
    new Set([
      ...student.badgeIds,
      ...guest.badgeIds,
      ...(guest.questStatus === "done" ? [GUEST_BADGE_FIRST_QUEST] : []),
    ])
  );

  const interests =
    student.interests.length > 0
      ? student.interests
      : [...guest.interestIds];

  return {
    applied: true,
    reason: "ok",
    student: {
      xp: student.xp + Math.max(0, guest.xp),
      interests,
      badgeIds,
      mergedGuestTokens: [...merged, opts.tokenId],
    },
  };
}

export function finalizeGuestCompletion(payload: GuestPayload): GuestPayload {
  const badges = Array.from(
    new Set([...payload.badgeIds, GUEST_BADGE_FIRST_QUEST])
  );
  return {
    ...payload,
    questStatus: "done",
    badgeIds: badges,
  };
}

export function applyAnswerXp(
  payload: GuestPayload,
  questionId: string,
  correct: boolean,
  xpGain: number
): GuestPayload {
  if (payload.answers.some((a) => a.questionId === questionId)) {
    return payload;
  }
  return {
    ...payload,
    xp: payload.xp + (correct ? Math.max(0, xpGain) : 0),
    answers: [...payload.answers, { questionId, correct }],
  };
}

export { emptyGuestPayload };
