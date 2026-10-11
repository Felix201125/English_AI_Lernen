"use client";

import { useParams } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TeacherStudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { learningStates, setActiveStudentId, lastComparison } = useApp();
  const s = learningStates[id];
  if (!s) return <p>Schüler nicht gefunden.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {s.name}
          </h1>
          <p className="text-slate-300">
            {s.age} Jahre · {s.cefrLevel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setActiveStudentId(s.studentId)}
          >
            Als Fokus setzen
          </Button>
          <Link href="/teacher/live">
            <Button size="sm">Live-Stunde</Button>
          </Link>
        </div>
      </div>

      <div className="eq-card p-5">
        <h2 className="mb-2 text-sm text-slate-400">Interessen</h2>
        <div className="flex flex-wrap gap-2">
          {s.interests.map((i) => (
            <span
              key={i}
              className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-100"
            >
              {i}
            </span>
          ))}
        </div>
      </div>

      <div className="eq-card space-y-3 p-5">
        <h2 className="font-display text-lg">Skills</h2>
        {Object.entries(s.skills).map(([k, v]) => (
          <div key={k}>
            <div className="mb-1 flex justify-between text-sm capitalize">
              <span>{k}</span>
              <span>{v}%</span>
            </div>
            <ProgressBar value={v} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="eq-card p-4 text-sm">
          <p className="text-sky-300">Lernhinweis</p>
          <p className="mt-2 text-slate-200">
            Kurze Sprechaufgaben mit {s.interests[0]} funktionieren besser als
            lange Arbeitsblätter. {s.name} antwortet länger bei bekannten Themen.
          </p>
        </div>
        <div className="eq-card p-4 text-sm">
          <p className="text-emerald-300">Empfehlung</p>
          <p className="mt-2 text-slate-200">
            {s.currentRecommendation?.title} ({s.currentRecommendation?.level})
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Übereinstimmung: {lastComparison?.agreementScore ?? "—"}%
          </p>
          <Link href="/teacher/ai/teacher" className="mt-3 inline-block text-indigo-300 underline">
            Im KI-Assistenten öffnen
          </Link>
        </div>
      </div>

      <div className="eq-card p-5">
        <h2 className="font-display text-lg">Timeline</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>Heute: Speaking confidence improved.</li>
          <li>Gestern: Regular Past Simple verbs improved.</li>
          <li>Montag: {s.interests[0]} vocabulary expanded.</li>
          <li>Letzte Woche: Reading support increased.</li>
        </ul>
      </div>
    </div>
  );
}
