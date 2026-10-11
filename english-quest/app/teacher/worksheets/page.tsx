"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

export default function WorksheetsPage() {
  const { learningStates } = useApp();
  const [studentId, setStudentId] = useState("alex");
  const [topic, setTopic] = useState("Football");
  const [generated, setGenerated] = useState(false);
  const s = learningStates[studentId];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        Worksheet Generator
      </h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="eq-card space-y-3 p-5">
          <select
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {Object.values(learningStates).map((st) => (
              <option key={st.studentId} value={st.studentId}>
                {st.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Level {s.cefrLevel} · Focus Past Simple · Age {s.age}
          </p>
          <Button onClick={() => setGenerated(true)}>Mit KI erstellen ✨</Button>
        </div>
        <div className="eq-card p-5">
          {generated ? (
            <div className="space-y-4 text-sm">
              <h2 className="font-display text-xl text-white">
                Past Simple — {topic}
              </h2>
              <p className="text-slate-300">
                Reading: Last weekend the player went to the stadium and bought
                a new jersey…
              </p>
              <p>1. Messi ____ (join) PSG in 2021.</p>
              <p>2. Match: stadium / jersey / trophy</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setGenerated(true)}>
                  Regenerate
                </Button>
                <Button size="sm" variant="ghost">
                  Print
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Noch kein Worksheet generiert.</p>
          )}
        </div>
      </div>
    </div>
  );
}
