"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default function TeacherLessonsPage() {
  const {
    learningStates,
    generateLesson,
    lessonDraft,
    updateLessonActivity,
    reorderLessonActivity,
  } = useApp();
  const [studentId, setStudentId] = useState("alex");
  const [goal, setGoal] = useState("Past Simple");
  const [duration, setDuration] = useState(45);
  const [instruction, setInstruction] = useState(
    "Make it fun and use football."
  );
  const [busy, setBusy] = useState(false);
  const state = learningStates[studentId];

  async function onGenerate() {
    setBusy(true);
    await generateLesson({ studentId, goal, duration, instruction });
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        Lesson Generator
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="eq-card space-y-3 p-5">
          <label className="block text-sm">
            Student
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              {Object.values(learningStates).map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Goal
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Duration
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {[30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Optional instruction
            <textarea
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </label>
          <p className="text-xs text-slate-500">
            Live control / Translator / AI activity: Teacher approval required ·
            Adaptive difficulty enabled · Reading: Audio + visual
          </p>
          <Button onClick={onGenerate} disabled={busy}>
            {busy ? "Generiere…" : "Generate lesson ✨"}
          </Button>
        </div>

        <div className="eq-card p-5 text-sm text-slate-300">
          <h2 className="font-display text-lg text-white">AI considers</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Age {state.age}</li>
            <li>Level {state.cefrLevel}</li>
            <li>Reading {state.readingLevel}</li>
            <li>Interests: {state.interests.join(", ")}</li>
            <li>Strengths: {state.strengths.join(", ")}</li>
            <li>Weaknesses: {state.weaknesses.join(", ")}</li>
            <li>Previous lessons & mistakes</li>
          </ul>
        </div>
      </div>

      {lessonDraft && (
        <div className="eq-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-white">
                {lessonDraft.title}
              </h2>
              <p className="text-sm text-slate-400">
                {lessonDraft.durationMinutes} minutes · {lessonDraft.level}
              </p>
            </div>
            <StatusBadge status={lessonDraft.status} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            <p>
              <span className="text-sky-300">Unterrichtsziel:</span>{" "}
              {lessonDraft.teacherAiNote}
            </p>
            <p>
              <span className="text-emerald-300">Vorschlag:</span>{" "}
              {lessonDraft.mainAiNote}
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Lernprofil: {lessonDraft.studentAiNote}
          </p>
          <ul className="space-y-2">
            {[...lessonDraft.activities]
              .sort((a, b) => a.order - b.order)
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <span>
                    {String(a.order).padStart(2, "0")} — {a.title}{" "}
                    <span className="text-slate-500">
                      {a.durationMinutes} min
                    </span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={a.status} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => reorderLessonActivity(a.id, "up")}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => reorderLessonActivity(a.id, "down")}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateLessonActivity(a.id, {
                          title: `${a.title} (easier)`,
                        })
                      }
                    >
                      Easier
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateLessonActivity(a.id, {
                          title: `${a.title} (harder)`,
                        })
                      }
                    >
                      Harder
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateLessonActivity(a.id, { status: "released" })
                      }
                    >
                      Release
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        updateLessonActivity(a.id, { status: "revoked" })
                      }
                    >
                      Revoke
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
          <Link href="/teacher/ai/teacher" className="text-sm text-indigo-300 underline">
            Im KI-Assistenten öffnen
          </Link>
        </div>
      )}
    </div>
  );
}
