"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { GAME_TEMPLATES, type GameTemplateId } from "@/lib/game-templates";
import { getSubject } from "@/lib/subjects";

export default function TeacherGamesPage() {
  const {
    games,
    setActivityStatus,
    activeSubjectId,
    setActiveSubjectId,
    fillGameTemplate,
    activeStudent,
  } = useApp();
  const [topic, setTopic] = useState(activeStudent.interests[0] ?? "Übung");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function fill(id: GameTemplateId) {
    setBusy(true);
    const text = await fillGameTemplate(id, topic.trim() || "Übung");
    setPreview(text);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Spiele & Templates
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Fachneutrale Templates — Inhalt füllt die eine Qestra-KI (
            {getSubject(activeSubjectId).labelDe}).
          </p>
        </div>
        <SubjectSwitcher
          compact
          value={activeSubjectId}
          onChange={setActiveSubjectId}
        />
      </div>

      <div className="eq-card space-y-3 p-5">
        <label className="block text-sm text-slate-400">
          Thema für KI-Füllung
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full max-w-md rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {GAME_TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-display text-white">{t.labelDe}</h2>
              <p className="mt-1 text-xs text-slate-400">{t.description}</p>
              <Button
                size="sm"
                className="mt-3"
                disabled={busy}
                onClick={() => fill(t.id)}
              >
                Mit KI füllen
              </Button>
            </div>
          ))}
        </div>
        {preview && (
          <pre className="whitespace-pre-wrap rounded-xl bg-indigo-500/10 p-4 text-sm text-indigo-50">
            {preview}
          </pre>
        )}
      </div>

      <h2 className="font-display text-xl text-white">Freigegebene Spiele</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {games.map((g) => (
          <div key={g.id} className="eq-card p-5">
            <div className="flex justify-between gap-2">
              <h2 className="font-display text-lg text-white">{g.title}</h2>
              <StatusBadge status={g.status} />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {g.level} · {g.topic} · {g.studentId ?? "all"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setActivityStatus(g.id, "approved")}>
                Freigeben
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActivityStatus(g.id, "released")}
              >
                Release
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setActivityStatus(g.id, "revoked")}
              >
                Entziehen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
