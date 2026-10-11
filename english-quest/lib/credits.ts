/** Credit-Kontingent — Schüler täglich, Lehrer unlimitiert */

export const STUDENT_DAILY_CREDITS = 200;

export type CreditAccount = {
  role: "student" | "teacher";
  /** verbleibend heute; teacher = Infinity-Semantik via null */
  remaining: number | null;
  resetAt: string; // ISO date (day)
};

export function createCreditAccount(
  role: "student" | "teacher",
  day = new Date().toISOString().slice(0, 10)
): CreditAccount {
  if (role === "teacher") {
    return { role, remaining: null, resetAt: day };
  }
  return { role, remaining: STUDENT_DAILY_CREDITS, resetAt: day };
}

export function canSpend(account: CreditAccount, cost: number): boolean {
  if (account.remaining === null) return true;
  return account.remaining >= cost;
}

export function spend(
  account: CreditAccount,
  cost: number,
  today = new Date().toISOString().slice(0, 10)
): CreditAccount {
  let next = account;
  if (account.resetAt !== today && account.role === "student") {
    next = createCreditAccount("student", today);
  }
  if (next.remaining === null) return next;
  if (next.remaining < cost) return next;
  return { ...next, remaining: next.remaining - cost };
}
