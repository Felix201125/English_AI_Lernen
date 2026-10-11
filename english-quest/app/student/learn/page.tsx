"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { ProgressBar } from "@/components/ui/progress";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { Button } from "@/components/ui/button";
import { getSubject } from "@/lib/subjects";
import { t } from "@/lib/i18n";

const skillLabels: Record<string, string> = {
  speaking: "Sprechen",
  listening: "Hören",
  reading: "Lesen",
  writing: "Schreiben",
  vocabulary: "Wortschatz",
  grammar: "Grammatik",
};

export default function StudentLearnPage() {
  const {
    activeStudent,
    activeSubjectId,
    setActiveSubjectId,
    setupProfile,
  } = useApp();
  const i18n = t();
  const subject = getSubject(activeSubjectId);
  const contentReady = subject.status === "active";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Lernen</h1>
      <p className="text-slate-300">
        Skills für {subject.labelDe} — ohne Countdown, ohne Verfall.
      </p>
      <SubjectSwitcher
        value={activeSubjectId}
        onChange={setActiveSubjectId}
        mySubjectIds={setupProfile?.subjectIds}
      />

      {!contentReady ? (
        <div className="eq-card space-y-3 p-6 text-slate-400">
          <p>
            {subject.labelDe} ist {i18n.subject.preparing.toLowerCase()}. Du
            kannst trotzdem eine Lehrkraft buchen.
          </p>
          <Link href="/student/teachers/">
            <Button>{i18n.nav.teachers}</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="eq-card space-y-4 p-5">
            {Object.entries(activeStudent.skills).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{skillLabels[key] ?? key}</span>
                  <span className="text-slate-400">{value}%</span>
                </div>
                <ProgressBar value={value} />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="eq-card p-5">
              <h2 className="font-display text-lg text-emerald-300">Stärken</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {activeStudent.strengths.length === 0 ? (
                  <li className="text-slate-400">{i18n.common.empty}</li>
                ) : (
                  activeStudent.strengths.map((s) => (
                    <li
                      key={s}
                      className="rounded-lg bg-emerald-500/10 px-3 py-2"
                    >
                      {s}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="eq-card p-5">
              <h2 className="font-display text-lg text-amber-300">Fokus</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {activeStudent.weaknesses.length === 0 ? (
                  <li className="text-slate-400">{i18n.common.empty}</li>
                ) : (
                  activeStudent.weaknesses.map((s) => (
                    <li
                      key={s}
                      className="rounded-lg bg-amber-500/10 px-3 py-2"
                    >
                      {s}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
