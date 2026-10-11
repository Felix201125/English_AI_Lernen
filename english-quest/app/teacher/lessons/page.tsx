"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { regenerateActivityLevel } from "@/lib/lessons/build-lesson";
import {
  deleteTeacherLesson,
  fetchTeacherBundle,
  saveTeacherLesson,
} from "@/lib/teacher/persist";
import type { LessonDraft } from "@/lib/types";
export default function TeacherLessonsPage() {
  const {
    learningStates,
    generateLesson,
    lessonDraft,
    loadLessonDraft,
    updateLessonActivity,
    reorderLessonActivity,
    authUser,
  } = useApp();
  const toast = useToast();
  const teacherId =
    authUser?.marketplaceTeacherId ||
    (authUser?.id ? `teacher-${authUser.id}` : "teacher-local");

  const [studentId, setStudentId] = useState("alex");
  const [goal, setGoal] = useState("Past Simple");
  const [duration, setDuration] = useState(45);
  const [instruction, setInstruction] = useState(
    "Mach es spielerisch und nutze Fußball."
  );
  const [busy, setBusy] = useState(false);
  const [library, setLibrary] = useState<LessonDraft[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    activityId: string;
    patch: Partial<LessonDraft["activities"][number]>;
  } | null>(null);
  const [undoStack, setUndoStack] = useState<LessonDraft[]>([]);
  const state = learningStates[studentId];

  const loadLibrary = async () => {
    const bundle = await fetchTeacherBundle(teacherId);
    setLibrary(bundle?.lessons?.filter((l) => !l.archived) ?? []);
  };

  useEffect(() => {
    void loadLibrary();
    try {
      const raw = sessionStorage.getItem("qestra.openLesson");
      if (raw) {
        const draft = JSON.parse(raw) as LessonDraft;
        loadLessonDraft(draft);
        sessionStorage.removeItem("qestra.openLesson");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  async function onGenerate() {
    setBusy(true);
    toast.loading("Stunde wird erzeugt…");
    try {
      await generateLesson({ studentId, goal, duration, instruction });
      toast.success("Stunde erzeugt — bitte prüfen und speichern.");
    } catch {
      toast.error("Stunde konnte nicht erzeugt werden.");
    } finally {
      setBusy(false);
    }
  }

  async function persistCurrent(status?: LessonDraft["status"]) {
    if (!lessonDraft) return;
    const next = {
      ...lessonDraft,
      status: status ?? lessonDraft.status,
      updatedAt: new Date().toISOString(),
    };
    // Summe prüfen
    const sum = next.activities.reduce((a, b) => a + b.durationMinutes, 0);
    if (sum !== next.durationMinutes) {
      toast.error(`Minuten stimmen nicht: ${sum} statt ${next.durationMinutes}.`);
      return;
    }
    await saveTeacherLesson(teacherId, next);
    setLibrary((prev) => {
      const others = prev.filter((l) => l.id !== next.id);
      return [next, ...others];
    });
    toast.success(
      status === "released" ? "Stunde freigegeben und gespeichert." : "Gespeichert."
    );
  }

  async function onLevel(
    activityId: string,
    direction: "easier" | "harder"
  ) {
    if (!lessonDraft || !state) return;
    const act = lessonDraft.activities.find((a) => a.id === activityId);
    if (!act) return;
    setBusy(true);
    toast.loading(direction === "easier" ? "Leichtere Version…" : "Schwierigere Version…");
    try {
      const gen = await regenerateActivityLevel({
        state,
        activityTitle: act.title,
        direction,
        goal,
      });
      setPreview({
        activityId,
        patch: {
          title: gen.title,
          instructions: gen.instructions,
          tasks: gen.tasks,
          solutions: gen.solutions,
          materials: gen.materials,
          teacherTips: gen.teacherTips,
          levelNote: gen.levelNote,
        },
      });
      toast.success("Vorschau bereit — übernehmen oder verwerfen.");
    } catch {
      toast.error("Anpassung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  function applyPreview() {
    if (!preview || !lessonDraft) return;
    setUndoStack((u) => [lessonDraft, ...u].slice(0, 10));
    updateLessonActivity(preview.activityId, preview.patch);
    setPreview(null);
    toast.success("Aktivität übernommen.");
  }

  function undo() {
    const prev = undoStack[0];
    if (!prev) return;
    setUndoStack((u) => u.slice(1));
    loadLessonDraft(prev);
    toast.success("Rückgängig gemacht.");
  }

  const draft = lessonDraft;
  const sumMin =
    draft?.activities.reduce((a, b) => a + b.durationMinutes, 0) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        Stunden planen
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="eq-card space-y-3 p-5">
          <label className="block text-sm text-slate-300">
            Schüler
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
          <label className="block text-sm text-slate-300">
            Unterrichtsziel
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </label>
          <label className="block text-sm text-slate-300">
            Dauer
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {[30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d} Minuten
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Optionale Anweisung
            <textarea
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </label>
          <Button onClick={() => void onGenerate()} disabled={busy}>
            {busy ? "Generiere…" : "Stunde erzeugen"}
          </Button>
        </div>

        <div className="eq-card p-5 text-sm text-slate-300">
          <h2 className="font-display text-lg text-white">Die KI berücksichtigt</h2>
          {state && (
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Alter {state.age}</li>
              <li>Niveau {state.cefrLevel}</li>
              <li>Interessen: {state.interests.join(", ") || "—"}</li>
              <li>Stärken: {state.strengths.join(", ") || "—"}</li>
              <li>Fokus: {state.weaknesses.join(", ") || "—"}</li>
              <li>
                Letzte Fehler:{" "}
                {state.commonMistakes[0]?.pattern ?? "keine erfasst"}
              </li>
            </ul>
          )}
        </div>
      </div>

      <section className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">Meine Stunden-Entwürfe</h2>
        {!library.length && (
          <p className="text-sm text-slate-400">
            Noch keine gespeicherten Stunden. Erzeuge eine und speichere sie.
          </p>
        )}
        <ul className="space-y-2">
          {library.map((l) => (
            <li
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
            >
              <button
                type="button"
                className="text-left text-white hover:underline"
                onClick={() => {
                  loadLessonDraft(l);
                  toast.success("Stunde geöffnet.");
                }}
              >
                {l.title} · {l.durationMinutes} Min. · {l.status === "released" ? "freigegeben" : "Entwurf"}
              </button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const copy = {
                      ...l,
                      id: `lesson-${Date.now()}`,
                      title: `${l.title} (Kopie)`,
                      status: "draft" as const,
                    };
                    void saveTeacherLesson(teacherId, copy).then(() => {
                      toast.success("Dupliziert.");
                      void loadLibrary();
                    });
                  }}
                >
                  Duplizieren
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    void deleteTeacherLesson(teacherId, l.id).then(() => {
                      toast.success("Gelöscht.");
                      void loadLibrary();
                    })
                  }
                >
                  Löschen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {draft && (
        <div className="eq-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-white">{draft.title}</h2>
              <p className="text-sm text-slate-400">
                {draft.durationMinutes} Minuten · Niveau {draft.level} · Summe
                Aktivitäten: {sumMin} Min.
              </p>
            </div>
            <StatusBadge status={draft.status} />
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-sky-300">Unterrichtsziel:</span>{" "}
              {draft.teacherAiNote}
            </p>
            <p>
              <span className="text-emerald-300">Begründung:</span>{" "}
              {draft.studentAiNote}
            </p>
            <p>
              <span className="text-violet-300">Methode:</span> {draft.mainAiNote}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void persistCurrent("draft")} disabled={busy}>
              Speichern
            </Button>
            <Button
              onClick={() => void persistCurrent("released")}
              disabled={busy}
            >
              Freigeben
            </Button>
            <Button
              variant="secondary"
              disabled={!undoStack.length}
              onClick={undo}
            >
              Rückgängig
            </Button>
          </div>

          {preview && (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm">
              <p className="font-medium text-white">Vorschau</p>
              <p className="mt-1 text-slate-200">{preview.patch.title}</p>
              <p className="mt-2 text-slate-400">{preview.patch.instructions}</p>
              <ul className="mt-2 list-disc pl-5 text-slate-300">
                {(preview.patch.tasks ?? []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={applyPreview}>
                  Übernehmen
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreview(null)}
                >
                  Verwerfen
                </Button>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {[...draft.activities]
              .sort((a, b) => a.order - b.order)
              .map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-left text-white"
                      onClick={() =>
                        setOpenId((id) => (id === a.id ? null : a.id))
                      }
                    >
                      {String(a.order).padStart(2, "0")} — {a.title}{" "}
                      <span className="text-slate-500">
                        {a.durationMinutes} Min.
                      </span>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={a.status} />
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Nach oben verschieben"
                        onClick={() => reorderLessonActivity(a.id, "up")}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Nach unten verschieben"
                        onClick={() => reorderLessonActivity(a.id, "down")}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => void onLevel(a.id, "easier")}
                      >
                        Leichter
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => void onLevel(a.id, "harder")}
                      >
                        Schwerer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateLessonActivity(a.id, { status: "released" })
                        }
                      >
                        Freigeben
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          updateLessonActivity(a.id, { status: "revoked" })
                        }
                      >
                        Zurückziehen
                      </Button>
                    </div>
                  </div>
                  {openId === a.id && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm text-slate-300">
                      <p>
                        <strong className="text-white">Anleitung:</strong>{" "}
                        {a.instructions || "—"}
                      </p>
                      <div>
                        <strong className="text-white">Aufgaben:</strong>
                        <ul className="list-disc pl-5">
                          {(a.tasks ?? []).map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-white">Lösungen:</strong>
                        <ul className="list-disc pl-5">
                          {(a.solutions ?? []).map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-white">Material:</strong>{" "}
                        {(a.materials ?? []).join(", ") || "—"}
                      </div>
                      <div>
                        <strong className="text-white">Hinweise für dich:</strong>
                        <ul className="list-disc pl-5">
                          {(a.teacherTips ?? []).map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
          <Link
            href="/teacher/ai/teacher"
            className="text-sm text-indigo-300 underline"
          >
            Im KI-Assistenten öffnen
          </Link>
        </div>
      )}
    </div>
  );
}
