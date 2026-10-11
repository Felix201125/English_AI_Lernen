/**
 * Bewertung pro Aufgabe: einmal werten, max. 100 % Gesamtergebnis.
 * firstTryCorrect = voll, nach Hinweis/2. Versuch = teilweise.
 */

export type StepAttempt = {
  stepId: string;
  firstCorrect: boolean;
  usedHint: boolean;
  retried: boolean;
  attempts: number;
};

export type StepScore = {
  stepId: string;
  points: number; // 0..1
  attempts: number;
};

export function scoreStep(attempt: StepAttempt): StepScore {
  if (!attempt.firstCorrect && attempt.attempts === 0) {
    return { stepId: attempt.stepId, points: 0, attempts: 0 };
  }
  if (attempt.firstCorrect && !attempt.usedHint && !attempt.retried) {
    return { stepId: attempt.stepId, points: 1, attempts: attempt.attempts };
  }
  if (attempt.firstCorrect || attempt.retried) {
    // nach Hinweis oder zweitem Versuch teilweise
    return {
      stepId: attempt.stepId,
      points: attempt.usedHint || attempt.retried ? 0.5 : 1,
      attempts: attempt.attempts,
    };
  }
  return { stepId: attempt.stepId, points: 0, attempts: attempt.attempts };
}

/** Gesamtscore 0–100, nie über 100 */
export function totalScorePercent(
  steps: StepScore[],
  stepCount: number
): number {
  const n = Math.max(1, stepCount);
  const sum = steps.reduce((acc, s) => acc + s.points, 0);
  return Math.min(100, Math.round((sum / n) * 100));
}

export function countFullyCorrect(steps: StepScore[]): number {
  return steps.filter((s) => s.points >= 1).length;
}

/** Korrigiert historische Scores > 100 */
export function clampHistoricScore(score: number | undefined | null): number {
  if (score == null || Number.isNaN(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}
