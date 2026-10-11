"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

export default function TeacherDashboardPage() {
  const {
    learningStates,
    lastComparison,
    notifications,
    messages,
    setActiveStudentId,
  } = useApp();
  const students = Object.values(learningStates);
  const pending = messages.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Lehrer-Dashboard
          </h1>
          <p className="text-slate-300">
            Übersicht, Empfehlungen und Freigaben — du bleibst in Kontrolle
          </p>
        </div>
        <Link href="/teacher/lessons">
          <Button>+ Stunde erstellen</Button>
        </Link>
      </div>

      {(notifications.some((n) => !n.read) || pending > 0) && (
        <div className="eq-card border-amber-500/30 p-4 text-sm text-amber-100">
          {pending === 1
            ? "1 offene Schüler-Anfrage"
            : `${pending} offene Schüler-Anfragen`}
          {" · "}
          {(() => {
            const n = notifications.filter((x) => !x.read).length;
            return n === 1
              ? "1 Benachrichtigung (inkl. Solo-Abschlüsse)"
              : `${n} Benachrichtigungen (inkl. Solo-Abschlüsse)`;
          })()}
          <Link href="/teacher/inbox" className="ml-3 underline">
            Anfragen öffnen
          </Link>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {students.map((s) => (
          <div key={s.studentId} className="eq-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl text-white">
                  {s.name} · {s.cefrLevel}
                </h2>
                <p className="text-xs text-emerald-300">Im Fortschritt</p>
              </div>
              <span className="text-xs text-slate-500">{s.ageGroup}</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Fokus:</span>{" "}
                {s.currentFocus[0]} · Stärke {s.strengths[0]}
              </p>
              <p>
                <span className="text-sky-300">Hinweis:</span> Weiter an{" "}
                {s.weaknesses[0] ?? s.currentFocus[0]} arbeiten
              </p>
              <p>
                <span className="text-emerald-300">Empfehlung:</span>{" "}
                {s.currentRecommendation?.title ?? "—"} ·{" "}
                {s.currentRecommendation?.level}
              </p>
              <p>
                Übereinstimmung:{" "}
                {s.studentId === "alex"
                  ? `${lastComparison?.agreementScore ?? 88}%`
                  : "76%"}
              </p>
            </div>
            <Link
              href={`/teacher/students/${s.studentId}`}
              className="mt-4 inline-block"
              onClick={() => setActiveStudentId(s.studentId)}
            >
              <Button variant="secondary" size="sm">
                Schüler öffnen
              </Button>
            </Link>
          </div>
        ))}
      </section>

      <section className="eq-card p-5">
        <h2 className="font-display text-xl text-white">Empfehlungen</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {students.map((s) => (
            <li
              key={s.studentId}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <strong className="text-white">{s.name}:</strong>{" "}
              {s.currentFocus[0]} bleibt im Fokus. Empfohlen:{" "}
              {s.currentRecommendation?.title}.
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
