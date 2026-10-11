"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { SubjectPicker } from "@/components/subject-picker";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DAY_PARTS,
  FEDERAL_STATES,
  INTEREST_CHIPS,
  LEARNING_GOALS,
  LEARNING_MODES,
  LEVEL_PROBES,
  SCHOOL_TYPES,
  WEEKDAYS_DE,
  majorityLevel,
} from "@/lib/marketplace/constants";
import type {
  DayPart,
  LearningGoal,
  LearningMode,
  SchoolType,
  StudentSetupProfile,
  Weekday,
} from "@/lib/marketplace/types";
import { getSubject, type SubjectId } from "@/lib/subjects";

const STEPS = 6;

export function StudentOnboarding() {
  const {
    completeOnboarding,
    onboardingDone,
    authUser,
    setActiveSubjectId,
  } = useApp();
  const i18n = t();
  const [step, setStep] = useState(0);
  const [subjectIds, setSubjectIds] = useState<SubjectId[]>(["english"]);
  const [gradeLevel, setGradeLevel] = useState(7);
  const [schoolType, setSchoolType] = useState<SchoolType>("gymnasium");
  const [federalState, setFederalState] = useState("Bayern");
  const [goalsBySubject, setGoalsBySubject] = useState<
    Record<string, LearningGoal[]>
  >({ english: ["better-grade"] });
  const [goalSubject, setGoalSubject] = useState<SubjectId>("english");
  const [levelAnswers, setLevelAnswers] = useState<Record<string, string[]>>(
    {}
  );
  const [levelQ, setLevelQ] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningMode, setLearningMode] = useState<LearningMode>("both");
  const [preferredWeekdays, setPreferredWeekdays] = useState<Weekday[]>([
    "tue",
    "thu",
  ]);
  const [preferredDayParts, setPreferredDayParts] = useState<DayPart[]>([
    "afternoon",
  ]);
  const [feedback, setFeedback] = useState("");

  const levelsBySubject = useMemo(() => {
    const out: Record<string, string> = {};
    for (const sid of subjectIds) {
      const answers = levelAnswers[sid] ?? [];
      out[sid] = answers.length ? majorityLevel(answers) : "A2";
    }
    return out;
  }, [subjectIds, levelAnswers]);

  if (onboardingDone || authUser?.role !== "student") return null;

  const toggleSubject = (id: SubjectId) => {
    setSubjectIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const buildProfile = (): StudentSetupProfile => ({
    subjectIds,
    gradeLevel,
    schoolType,
    federalState,
    goalsBySubject,
    levelsBySubject,
    interests,
    learningMode,
    preferredWeekdays,
    preferredDayParts,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "Europe/Berlin",
  });

  const finish = (profile: StudentSetupProfile) => {
    const primary = profile.subjectIds[0] ?? "english";
    setActiveSubjectId(primary);
    completeOnboarding({
      interests: profile.interests,
      cefrLevel: profile.levelsBySubject[primary] ?? "A2",
      age: Math.min(18, Math.max(8, gradeLevel + 5)),
      setupProfile: profile,
    });
    setFeedback("Gespeichert — willkommen!");
  };

  const skipToEnd = () => {
    finish(buildProfile());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1220]/92 p-3 backdrop-blur sm:p-4">
      <div
        className="eq-card max-h-[92vh] w-full max-w-xl overflow-y-auto p-5 sm:p-6"
        role="dialog"
        aria-labelledby="onboarding-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              id="onboarding-title"
              className="font-display text-2xl font-bold text-white"
            >
              {i18n.onboarding.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Schritt {Math.min(step + 1, STEPS)} von {STEPS}
            </p>
          </div>
          <button
            type="button"
            className="text-xs text-slate-400 underline hover:text-white"
            onClick={skipToEnd}
          >
            {i18n.onboarding.skip}
          </button>
        </div>

        {feedback && (
          <p className="mt-2 text-sm text-emerald-300" role="status">
            {feedback}
          </p>
        )}

        {step === 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepSubjects}</p>
            <SubjectPicker
              value={subjectIds[0] ?? "english"}
              allowPreparing
              mySubjectIds={subjectIds}
              onChange={(id) =>
                setSubjectIds((prev) =>
                  prev.includes(id) ? prev : [...prev, id]
                )
              }
            />
            <div className="flex flex-wrap gap-2">
              {subjectIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSubject(id)}
                  className="rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs text-white"
                >
                  {getSubject(id).icon} {getSubject(id).labelDe} ×
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Tippe ein Fach in der Liste, um es hinzuzufügen. Englisch hat schon
              Spiele — andere Fächer sind für Live-Stunden buchbar.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                setGoalSubject(subjectIds[0] ?? "english");
                setStep(1);
              }}
            >
              {i18n.common.next}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepSchool}</p>
            <label className="block text-sm text-slate-300">
              {i18n.onboarding.grade}
              <input
                type="number"
                min={1}
                max={13}
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value) || 7)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-300">
              {i18n.onboarding.schoolType}
              <select
                value={schoolType}
                onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              >
                {SCHOOL_TYPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.labelDe}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              {i18n.onboarding.federalState}
              <select
                value={federalState}
                onChange={(e) => setFederalState(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              >
                {FEDERAL_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepGoals}</p>
            <div className="flex flex-wrap gap-2">
              {subjectIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGoalSubject(id)}
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs",
                    goalSubject === id
                      ? "bg-indigo-500/30 text-white"
                      : "bg-white/5 text-slate-400"
                  )}
                >
                  {getSubject(id).labelDe}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LEARNING_GOALS.map((g) => {
                const selected = (goalsBySubject[goalSubject] ?? []).includes(
                  g.id
                );
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() =>
                      setGoalsBySubject((prev) => {
                        const cur = prev[goalSubject] ?? [];
                        const next = selected
                          ? cur.filter((x) => x !== g.id)
                          : [...cur, g.id];
                        return { ...prev, [goalSubject]: next };
                      })
                    }
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-sm",
                      selected
                        ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                        : "border-white/10 text-slate-300"
                    )}
                  >
                    {g.labelDe}
                  </button>
                );
              })}
            </div>
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepLevel}</p>
            <p className="text-xs text-slate-500">{i18n.onboarding.levelHint}</p>
            <div className="flex flex-wrap gap-2">
              {subjectIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setGoalSubject(id);
                    setLevelQ(0);
                  }}
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs",
                    goalSubject === id
                      ? "bg-emerald-500/25 text-white"
                      : "bg-white/5 text-slate-400"
                  )}
                >
                  {getSubject(id).labelDe}
                  {levelsBySubject[id] ? ` · ${levelsBySubject[id]}` : ""}
                </button>
              ))}
            </div>
            {(() => {
              const list =
                LEVEL_PROBES[goalSubject] ?? LEVEL_PROBES.default;
              const q = list[Math.min(levelQ, list.length - 1)];
              if (!q) return null;
              return (
                <div>
                  <p className="mb-2 text-sm text-white">
                    {q.prompt}{" "}
                    <span className="text-slate-500">
                      ({levelQ + 1}/{list.length})
                    </span>
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setLevelAnswers((prev) => {
                            const cur = [...(prev[goalSubject] ?? [])];
                            cur[levelQ] = opt.level;
                            return { ...prev, [goalSubject]: cur };
                          });
                          if (levelQ + 1 < list.length) {
                            setLevelQ((n) => n + 1);
                          }
                        }}
                        className="block w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-slate-200 hover:border-emerald-400/40 hover:bg-emerald-500/10"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepInterests}</p>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_CHIPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setInterests((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((x) => x !== item.id)
                        : [...prev, item.id]
                    )
                  }
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left text-sm",
                    interests.includes(item.id)
                      ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                      : "border-white/10 text-slate-300"
                  )}
                >
                  {item.emoji} {item.labelDe}
                </button>
              ))}
            </div>
            <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} />
          </div>
        )}

        {step === 5 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepMode}</p>
            <div className="space-y-2">
              {LEARNING_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLearningMode(m.id)}
                  className={cn(
                    "block w-full rounded-xl border px-4 py-3 text-left text-sm",
                    learningMode === m.id
                      ? "border-violet-400/50 bg-violet-500/15 text-white"
                      : "border-white/10 text-slate-300"
                  )}
                >
                  {m.labelDe}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">Bevorzugte Zeiten</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS_DE.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    setPreferredWeekdays((prev) =>
                      prev.includes(d.id)
                        ? prev.filter((x) => x !== d.id)
                        : [...prev, d.id]
                    )
                  }
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs",
                    preferredWeekdays.includes(d.id)
                      ? "bg-cyan-500/25 text-white"
                      : "bg-white/5 text-slate-400"
                  )}
                >
                  {d.labelDe}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {DAY_PARTS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    setPreferredDayParts((prev) =>
                      prev.includes(d.id)
                        ? prev.filter((x) => x !== d.id)
                        : [...prev, d.id]
                    )
                  }
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs",
                    preferredDayParts.includes(d.id)
                      ? "bg-cyan-500/25 text-white"
                      : "bg-white/5 text-slate-400"
                  )}
                >
                  {d.labelDe}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(4)}>
                {i18n.common.back}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const profile = buildProfile();
                  finish(profile);
                }}
              >
                {i18n.onboarding.finish}
              </Button>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
              <p className="font-medium text-white">
                {i18n.onboarding.recommendations}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
                {subjectIds.map((id) => (
                  <li key={id}>
                    {getSubject(id).labelDe}: Niveau{" "}
                    {levelsBySubject[id] ?? "—"} ·{" "}
                    {(goalsBySubject[id] ?? [])
                      .map(
                        (g) =>
                          LEARNING_GOALS.find((x) => x.id === g)?.labelDe ?? g
                      )
                      .join(", ") || "Ziele später wählen"}
                  </li>
                ))}
              </ul>
              {(learningMode === "live-teacher" || learningMode === "both") && (
                <p className="mt-3 text-xs">
                  {i18n.onboarding.matchingTeachers}:{" "}
                  <Link
                    href="/student/teachers/"
                    className="text-indigo-300 underline"
                  >
                    Lehrkräfte öffnen
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const i18n = t();
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={onBack}>
        {i18n.common.back}
      </Button>
      <Button className="flex-1" onClick={onNext}>
        {i18n.common.next}
      </Button>
    </div>
  );
}
