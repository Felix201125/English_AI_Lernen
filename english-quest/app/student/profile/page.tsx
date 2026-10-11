"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { t, tf } from "@/lib/i18n";
import {
  ageGroupDe,
  formatActiveDe,
} from "@/lib/student/progress-engine";

const skillLabels: Record<string, string> = {
  speaking: "Sprechen",
  listening: "Hören",
  reading: "Lesen",
  writing: "Schreiben",
  vocabulary: "Wortschatz",
  grammar: "Grammatik",
};

export default function StudentProfilePage() {
  const { activeStudent, authUser, setupProfile, updateSetupProfile } =
    useApp();
  const i18n = t();
  const ageInfo = ageGroupDe(activeStudent.age);
  const hasSkills = Object.values(activeStudent.skills).some((v) => v > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {activeStudent.name}
          </h1>
          <p className="text-slate-300">
            Niveau {activeStudent.cefrLevel} ·{" "}
            {tf(i18n.profile.years, { n: activeStudent.age })} ·{" "}
            {ageInfo.label}
          </p>
          {authUser?.email && (
            <p className="mt-1 text-sm text-slate-500">{authUser.email}</p>
          )}
        </div>
        <Link href="/student/account">
          <Button variant="secondary">{i18n.profile.manageAccount}</Button>
        </Link>
      </div>

      {setupProfile && (
        <div className="eq-card space-y-2 p-5 text-sm text-slate-300">
          <h2 className="font-display text-xl text-white">Start-Einstellungen</h2>
          <p>
            Klasse {setupProfile.gradeLevel} · {setupProfile.schoolType} ·{" "}
            {setupProfile.federalState}
          </p>
          <p>
            Fächer: {setupProfile.subjectIds.join(", ")} · Modus:{" "}
            {setupProfile.learningMode}
          </p>
          <p className="text-xs text-slate-500">
            Zeiten: {setupProfile.preferredWeekdays.join(", ")} /{" "}
            {setupProfile.preferredDayParts.join(", ")}
          </p>
          <Button
            variant="secondary"
            onClick={() =>
              updateSetupProfile({
                preferredDayParts: ["afternoon", "evening"],
              })
            }
          >
            Zeiten auf Nachmittag+Abend setzen
          </Button>
        </div>
      )}

      <div className="eq-card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <p className="text-amber-300">⭐ {activeStudent.xp} XP</p>
          <p className="mt-1 text-sm text-slate-400">
            Zuletzt aktiv: {formatActiveDe(activeStudent.lastActive)} —{" "}
            {i18n.progress.pauseOk}
          </p>
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          {hasSkills ? (
            <>
              <p>Sprechen und Hören entwickeln sich mit jeder Quest.</p>
              <p>Wortschatz und Grammatik wachsen durch Übung — ohne Druck.</p>
            </>
          ) : (
            <p>{i18n.home.noProgressYet}</p>
          )}
        </div>
      </div>

      <div className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl">Skills</h2>
        {!hasSkills ? (
          <p className="text-sm text-slate-400">{i18n.common.empty}</p>
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
        <h2 className="font-display text-xl">{i18n.profile.recommendations}</h2>
        {activeStudent.currentRecommendation ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>{activeStudent.currentRecommendation.title}</li>
            {activeStudent.interests[0] && (
              <li>Passend zu deinem Interesse: {activeStudent.interests[0]}</li>
            )}
            <li>
              Schwierigkeit: {activeStudent.recommendedDifficulty}
            </li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            {i18n.home.noRecommendation}
          </p>
        )}
      </div>
    </div>
  );
}
