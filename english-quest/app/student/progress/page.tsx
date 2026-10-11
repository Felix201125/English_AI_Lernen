"use client";

import { useApp } from "@/components/providers/app-provider";
import { ProgressBar } from "@/components/ui/progress";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { getSubject } from "@/lib/subjects";
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
  const {
    activeStudent,
    activeSubjectId,
    setActiveSubjectId,
    setupProfile,
    progressBySubject,
  } = useApp();
  const i18n = t();
  const hasHistory = activeStudent.activityHistory.length > 0;
  const hasSkills = Object.values(activeStudent.skills).some((v) => v > 0);

  const overallXp =
    Object.values(progressBySubject).reduce((sum, s) => sum + (s.xp || 0), 0) ||
    activeStudent.xp;

  const subjectEntries = Object.entries(progressBySubject);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        {i18n.progress.title}
      </h1>
      <SubjectSwitcher
        value={activeSubjectId}
        onChange={setActiveSubjectId}
        mySubjectIds={setupProfile?.subjectIds}
      />

      <div className="eq-card grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-400">{i18n.progress.subjectXp}</p>
          <p className="text-2xl font-bold text-amber-300">{activeStudent.xp}</p>
          <p className="text-xs text-slate-500">
            {getSubject(activeSubjectId).labelDe}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">{i18n.progress.overall}</p>
          <p className="text-2xl font-bold text-white">{overallXp} XP</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">{i18n.progress.level}</p>
          <p className="text-2xl font-bold text-white">
            {activeStudent.cefrLevel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatActiveDe(activeStudent.lastActive)} · {i18n.progress.pauseOk}
          </p>
        </div>
      </div>

      <div className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">
          {i18n.progress.perSubject}
        </h2>
        {!subjectEntries.length ? (
          <p className="text-sm text-slate-400">{i18n.home.noProgressYet}</p>
        ) : (
          <ul className="space-y-2">
            {subjectEntries.map(([id, slice]) => (
              <li
                key={id}
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm"
              >
                <span className="text-white">
                  {getSubject(id).icon} {getSubject(id).labelDe}
                </span>
                <span className="text-slate-400">
                  {slice.levelLabel} · {slice.xp} XP
                </span>
              </li>
            ))}
          </ul>
        )}
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
