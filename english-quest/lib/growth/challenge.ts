export type ClassChallenge = {
  id: string;
  classId: string;
  title: string;
  weekStart: string;
  scores: Record<string, number>; // studentId → points
};

/** Rangliste nur innerhalb der Klasse — keine klassenfremden Einträge */
export function classLeaderboard(
  challenge: ClassChallenge,
  classMemberIds: string[]
): { studentId: string; points: number }[] {
  const allowed = new Set(classMemberIds);
  return Object.entries(challenge.scores)
    .filter(([id]) => allowed.has(id))
    .map(([studentId, points]) => ({ studentId, points }))
    .sort((a, b) => b.points - a.points);
}
