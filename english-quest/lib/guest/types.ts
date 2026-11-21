export type GuestQuestAnswer = {
  questionId: string;
  correct: boolean;
};

export type GuestPayload = {
  interestIds: string[];
  grade: number | null;
  xp: number;
  badgeIds: string[];
  questId: string | null;
  answers: GuestQuestAnswer[];
  aiMessagesUsed: number;
  questStatus: "idle" | "active" | "done";
  subject: "mathe" | "deutsch";
};

export type GuestSessionPublic = {
  token: string;
  expiresAt: string;
  payload: GuestPayload;
};

export const GUEST_BADGE_FIRST_QUEST = "erste-quest";
export const GUEST_COOKIE = "qestra_guest";
export const GUEST_LS_KEY = "qestra.guest.token";

export function emptyGuestPayload(): GuestPayload {
  return {
    interestIds: [],
    grade: null,
    xp: 0,
    badgeIds: [],
    questId: null,
    answers: [],
    aiMessagesUsed: 0,
    questStatus: "idle",
    subject: "mathe",
  };
}
