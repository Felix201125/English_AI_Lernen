"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { getSubject } from "@/lib/subjects";
import { t, tf } from "@/lib/i18n";

export default function StudentGamesPage() {
  const {
    games,
    activeStudentId,
    isLive,
    can,
    activeStudent,
    activeSubjectId,
    setActiveSubjectId,
    setupProfile,
  } = useApp();
  const i18n = t();
  const subject = getSubject(activeSubjectId);
  const contentReady = subject.status === "active";
  const mine = contentReady
    ? games.filter((g) => !g.studentId || g.studentId === activeStudentId)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        {i18n.games.title}
      </h1>
      <p className="text-slate-300">{i18n.games.subtitle}</p>
      <SubjectSwitcher
        value={activeSubjectId}
        onChange={setActiveSubjectId}
        mySubjectIds={setupProfile?.subjectIds}
      />

      {!contentReady ? (
        <div className="eq-card space-y-3 p-8 text-center text-slate-400">
          <p>
            {subject.labelDe}: {i18n.subject.preparing}. Spiele folgen — du
            kannst schon eine Lehrkraft für Live-Stunden buchen.
          </p>
          <Link href="/student/teachers/" className="inline-block">
            <Button>{i18n.nav.teachers}</Button>
          </Link>
        </div>
      ) : mine.length === 0 ? (
        <div className="eq-card p-8 text-center text-slate-400">
          <p>{i18n.games.empty}</p>
          <Link href="/student/interests" className="mt-4 inline-block">
            <Button variant="secondary">Interessen wählen</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((game) => {
            const locked =
              game.status === "locked" ||
              game.status === "pending" ||
              game.status === "revoked" ||
              (isLive &&
                !["released", "active", "approved", "completed"].includes(
                  game.status
                ));
            const allowed =
              can("activityAccess", {
                hasApproval: ["released", "active", "approved", "completed"].includes(
                  game.status
                ),
              }) ||
              ["released", "active", "completed"].includes(game.status);

            const interestHit = game.personalization?.interests?.some((i) =>
              activeStudent.interests.includes(i)
            );

            return (
              <div key={game.id} className="eq-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl text-white">
                      {game.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {game.level} ·{" "}
                      {tf(i18n.games.minutes, { n: game.durationMinutes })} ·{" "}
                      {game.personalization?.targetSkills?.[0] ?? game.type}
                      {interestHit ? " · passt zu dir" : ""}
                    </p>
                  </div>
                  <StatusBadge status={game.status} />
                </div>
                <p className="mt-3 text-sm text-slate-300">{game.description}</p>
                <p className="mt-2 text-sm text-amber-200/90">
                  {tf(i18n.games.xpReward, { n: game.xpReward })}
                </p>
                {locked || !allowed ? (
                  <p className="mt-4 text-sm text-amber-200">
                    🔒 {i18n.games.lockedTeacher}
                  </p>
                ) : game.status === "completed" ? (
                  <Link
                    href={`/student/activity/${game.id}`}
                    className="mt-4 inline-block"
                  >
                    <Button variant="secondary">Nochmal üben</Button>
                  </Link>
                ) : (
                  <Link
                    href={`/student/activity/${game.id}`}
                    className="mt-4 inline-block"
                  >
                    <Button>{i18n.common.start}</Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
