"use client";

import { useState } from "react";
import { qestraAI } from "@/lib/ai/qestra-ai";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { callServerAI } from "@/lib/ai/server-client";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { SINGLE_AI } from "@/lib/ai/roles";
import { getSubject } from "@/lib/subjects";

export default function TeacherAIPage() {
  const {
    learningStates,
    activeStudent,
    activeSubjectId,
    setActiveSubjectId,
    decideRecommendation,
    lastComparison,
    setActiveStudentId,
  } = useApp();
  const [question, setQuestion] = useState(
    "Was sollte als Nächstes geübt werden?"
  );
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rec = activeStudent.currentRecommendation;

  async function ask() {
    setBusy(true);
    try {
      const remote = await callServerAI({
        action: "teacher_recommend",
        question,
        student: {
          name: activeStudent.name,
          level: activeStudent.cefrLevel,
          focus: activeStudent.currentFocus,
          interests: activeStudent.interests,
          weaknesses: activeStudent.weaknesses,
        },
      });
      if (remote) {
        setAnswer(remote);
        setBusy(false);
        return;
      }
    } catch {
      // fall back to mock
    }
    const text = await qestraAI.recommendLesson(
      activeStudent,
      activeStudent.currentFocus[0] ?? "practice"
    );
    const classNotes = await qestraAI.analyzeClass(
      Object.values(learningStates)
    );
    setAnswer(
      `${text}\n\nBelege:\n- Grammatik ${activeStudent.skills.grammar}%\n- Speaking-Confidence steigt\n- Starkes Interesse an ${activeStudent.interests[0]}\n\nKlasse:\n${classNotes.join("\n")}`
    );
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {SINGLE_AI.name}
          </h1>
          <p className="text-sm text-slate-400">
            Eine KI · Fach {getSubject(activeSubjectId).labelDe} · Lehrer
            unlimitiert
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SubjectSwitcher
            compact
            value={activeSubjectId}
            onChange={setActiveSubjectId}
          />
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={activeStudent.studentId}
            onChange={(e) => setActiveStudentId(e.target.value)}
          >
            {Object.values(learningStates).map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="eq-card space-y-3 p-5">
        <p className="text-sm text-slate-400">
          Frag den Assistenten. Freigaben und Aktivitäten entscheidest weiterhin
          du.
        </p>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button onClick={ask} disabled={busy}>
          {busy ? "Denkt nach…" : "Fragen"}
        </Button>
        {answer && (
          <pre className="whitespace-pre-wrap rounded-xl bg-sky-500/10 p-4 text-sm text-sky-50">
            {answer}
          </pre>
        )}
      </div>

      <div className="eq-card space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl text-white">Aktuelle Empfehlung</h2>
          {rec && <StatusBadge status={rec.status} />}
          <span className="rounded-full bg-white/5 px-3 py-1 text-sm">
            Übereinstimmung: {lastComparison?.agreementScore ?? "—"}%
          </span>
        </div>
        <p className="text-slate-300">
          {lastComparison?.teacherRecommendation}
        </p>
        <p className="text-lg text-white">
          {rec?.title ?? lastComparison?.mainDecision}
        </p>
        <details className="text-sm text-slate-300">
          <summary className="cursor-pointer text-indigo-300">Warum?</summary>
          <ul className="mt-2 list-disc pl-5">
            {(rec?.aiReasoning ?? lastComparison?.reasoning ?? []).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={() => decideRecommendation("approve")}>
            Freigeben
          </Button>
          <Button
            variant="secondary"
            onClick={() => decideRecommendation("release")}
          >
            An Schüler senden
          </Button>
          <Button
            variant="danger"
            onClick={() => decideRecommendation("reject")}
          >
            Ablehnen
          </Button>
        </div>
      </div>
    </div>
  );
}
