"use client";

import { useApp } from "@/components/providers/app-provider";
import { ProgressBar } from "@/components/ui/progress";

export default function StudentLearnPage() {
  const { activeStudent } = useApp();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Learn</h1>
      <p className="text-slate-300">
        Deine Skills — ohne Countdown, ohne Verfall.
      </p>
      <div className="eq-card space-y-4 p-5">
        {Object.entries(activeStudent.skills).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm capitalize">
              <span>{key}</span>
              <span className="text-slate-400">{value}%</span>
            </div>
            <ProgressBar value={value} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="eq-card p-5">
          <h2 className="font-display text-lg text-emerald-300">Strengths</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {activeStudent.strengths.map((s) => (
              <li key={s} className="rounded-lg bg-emerald-500/10 px-3 py-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="eq-card p-5">
          <h2 className="font-display text-lg text-amber-300">Focus areas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {activeStudent.weaknesses.map((s) => (
              <li key={s} className="rounded-lg bg-amber-500/10 px-3 py-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
