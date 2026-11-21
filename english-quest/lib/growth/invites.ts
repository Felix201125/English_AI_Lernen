export type InviteRecord = {
  code: string;
  inviterUserId: string;
  createdAt: string;
  redeemedBy: string[];
};

export type InviteRewardConfig = {
  badgeId: string;
  creditsBonus: number;
};

export const DEFAULT_INVITE_REWARD: InviteRewardConfig = {
  badgeId: "freund-eingeladen",
  creditsBonus: 0, // keine erfundenen Zahlungsversprechen; Credits nur wenn Config > 0
};

/** Selbst-Einladung und Doppelprämie für dasselbe Paar verhindern */
export function canRedeemInvite(
  invite: InviteRecord,
  redeemerUserId: string
): { ok: boolean; reason?: string } {
  if (invite.inviterUserId === redeemerUserId) {
    return { ok: false, reason: "self" };
  }
  if (invite.redeemedBy.includes(redeemerUserId)) {
    return { ok: false, reason: "already" };
  }
  return { ok: true };
}

export function applyInviteRedeem(
  invite: InviteRecord,
  redeemerUserId: string
): InviteRecord | null {
  const check = canRedeemInvite(invite, redeemerUserId);
  if (!check.ok) return null;
  return {
    ...invite,
    redeemedBy: [...invite.redeemedBy, redeemerUserId],
  };
}

export function makeInviteCode(userId: string): string {
  const base = userId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `Q-${base}${rnd}`;
}
