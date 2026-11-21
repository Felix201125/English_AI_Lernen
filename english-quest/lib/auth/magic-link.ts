export type MagicLinkRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: number;
  used: boolean;
};

export function isMagicLinkValid(
  record: MagicLinkRecord | null | undefined,
  now = Date.now()
): boolean {
  if (!record || record.used) return false;
  return record.expiresAt > now;
}
