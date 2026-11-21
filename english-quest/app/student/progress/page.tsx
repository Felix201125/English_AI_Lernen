"use client";

import { useApp } from "@/components/providers/app-provider";
import { ProgressBar } from "@/components/ui/progress";
import { t } from "@/lib/i18n";
import { formatActiveDe } from "@/lib/student/progress-engine";

const skillLabels: Record<string, string> = {
  speaking: "Sprechen",
  listening: "Hören",
  reading: "Lesen",
  writing: "Schreiben",
  vocabulary: "Wortschatz",
  grammar: "Grammatik",
};

export default function StudentProgressPage() {
  const { activeStudent, badgeIds } = useApp();
  const i18n = t();
  const hasHistory = activeStudent.activityHistory.length > 0;
  const hasSkills = Object.values(activeStudent.skills).some((v) => v > 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        {i18n.progress.title}
      </h1>
      <div className="eq-card grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-400">{i18n.common.xp}</p>
          <p className="text-2xl font-bold text-amber-300">{activeStudent.xp}</p>
          {badgeIds.length > 0 && (
            <p className="mt-2 text-xs text-emerald-300">
              Abzeichen:{" "}
              {badgeIds
                .map((b) => (b === "erste-quest" ? "Erste Quest" : b))
                .join(", ")}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-slate-400">{i18n.progress.level}</p>
          <p className="text-2xl font-bold text-white">
            {activeStudent.cefrLevel}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">{i18n.progress.lastActive}</p>
          <p className="text-2xl font-bold text-cyan-300">
            {formatActiveDe(activeStudent.lastActive)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{i18n.progress.pauseOk}</p>
        </div>
      </div>

      <div className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">Skills</h2>
        {!hasSkills ? (
          <p className="text-sm text-slate-400">{i18n.home.noProgressYet}</p>
        ) : (
          Object.entries(activeStudent.skills).map(([k, v]) => (
            <div key={k}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{skillLabels[k] ?? k}</span>
                <span>{v}%</span>
              </div>
              <ProgressBar value={v} />
            </div>
          ))
        )}
      </div>

      <div className="eq-card p-5">
        <h2 className="font-display text-xl text-white">
          {i18n.progress.learningLog}
        </h2>
        {!hasHistory ? (
          <p className="mt-4 text-sm text-slate-400">{i18n.progress.emptyLog}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {activeStudent.activityHistory.map((a) => (
              <li
                key={`${a.activityId}-${a.completedAt}`}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-white">{a.title}</span>
                  <span className="text-amber-300">+{a.xpEarned} XP</span>
                </div>
                <p className="text-xs text-slate-400">
                  {formatActiveDe(a.completedAt)}
                  {a.score != null ? ` · Ergebnis ${a.score}%` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
