import type {
  ActivityPerformance,
  LearningState,
  Game,
} from "@/lib/types";

/** Idempotente XP-Gutschrift + Log + Skill-Update */
export function applyActivityCompletion(
  state: LearningState,
  game: Game,
  score: number,
  _hintsUsed: number
): LearningState {
  void _hintsUsed;
  const already = state.activityHistory.some(
    (a) => a.activityId === game.id && a.status === "completed"
  );
  if (already) {
    return {
      ...state,
      lastActive: formatDay(new Date()),
      lastUpdated: new Date().toISOString(),
    };
  }

  const xpEarned = game.xpReward;
  const skillKey = skillFromGame(game);
  const skills = { ...state.skills };
  const bump = Math.max(2, Math.round(score / 25));
  skills[skillKey] = Math.min(100, (skills[skillKey] ?? 50) + bump);

  const entry: ActivityPerformance = {
    activityId: game.id,
    title: game.title,
    completedAt: formatDay(new Date()),
    score,
    xpEarned,
    status: "completed",
  };

  const strengths = deriveStrengths(skills);
  const weaknesses = deriveWeaknesses(skills, state.weaknesses);

  return {
    ...state,
    xp: state.xp + xpEarned,
    skills,
    strengths,
    weaknesses,
    currentFocus:
      weaknesses.length > 0
        ? weaknesses.slice(0, 2)
        : state.currentFocus.length
          ? state.currentFocus
          : ["Getting started"],
    activityHistory: [entry, ...state.activityHistory],
    lastActive: formatDay(new Date()),
    lastUpdated: new Date().toISOString(),
  };
}

function skillFromGame(
  game: Game
): keyof LearningState["skills"] {
  const fromPersonalization = game.personalization?.targetSkills?.[0]?.toLowerCase();
  const map: Record<string, keyof LearningState["skills"]> = {
    speaking: "speaking",
    listening: "listening",
    reading: "reading",
    writing: "writing",
    vocabulary: "vocabulary",
    grammar: "grammar",
  };
  if (fromPersonalization && map[fromPersonalization]) {
    return map[fromPersonalization];
  }
  if (game.type === "speaking") return "speaking";
  if (game.topic.toLowerCase().includes("grammar")) return "grammar";
  return "vocabulary";
}

function deriveStrengths(skills: LearningState["skills"]): string[] {
  return Object.entries(skills)
    .filter(([, v]) => v >= 60)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => capitalize(k));
}

function deriveWeaknesses(
  skills: LearningState["skills"],
  previous: string[]
): string[] {
  const low = Object.entries(skills)
    .filter(([, v]) => v < 55)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([k]) => capitalize(k));
  return low.length ? low : previous.slice(0, 2);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Relatives / deutsches Datum */
export function formatActiveDe(isoOrLabel: string): string {
  if (!isoOrLabel) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(isoOrLabel)) {
    const day = isoOrLabel.slice(0, 10);
    const today = formatDay(new Date());
    const yesterday = formatDay(new Date(Date.now() - 86400000));
    if (day === today) return "heute";
    if (day === yesterday) return "gestern";
    const [y, m, d] = day.split("-");
    return `${d}.${m}.${y}`;
  }
  return isoOrLabel;
}

export function ageGroupDe(
  age: number
): { key: "child" | "teenager" | "adult"; label: string } {
  if (age < 13) return { key: "child", label: "Kind" };
  if (age < 18) return { key: "teenager", label: "Jugendliche:r" };
  return { key: "adult", label: "Erwachsen" };
}

export function continueItemsFromState(
  state: LearningState,
  games: Game[]
): { gameId: string; title: string; value: number }[] {
  const inProgress = games.filter(
    (g) =>
      (!g.studentId || g.studentId === state.studentId) &&
      (g.status === "active" || g.status === "released")
  );
  return inProgress.slice(0, 2).map((g) => {
    const hist = state.activityHistory.find((a) => a.activityId === g.id);
    return {
      gameId: g.id,
      title: g.title,
      value: hist?.score ?? (g.status === "active" ? 40 : 0),
    };
  });
}

export function xpToNextLevel(xp: number): { level: number; current: number; need: number } {
  const level = Math.floor(xp / 100) + 1;
  const current = xp % 100;
  return { level, current, need: 100 };
}
