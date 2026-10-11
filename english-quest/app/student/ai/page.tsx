"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Square } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSubject } from "@/lib/subjects";
import { SINGLE_AI } from "@/lib/ai/roles";
import { t, tf } from "@/lib/i18n";
import { canSpend } from "@/lib/credits";

export default function StudentAIPage() {
  const {
    activeStudent,
    activeSubjectId,
    setActiveSubjectId,
    studentCredits,
    creditCostPerRequest,
    isLive,
    isChildMode,
    submitStudentRequest,
    recordVoiceRequest,
    settings,
    messages,
    games,
    setupProfile,
  } = useApp();
  const i18n = t();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [out, setOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const myMessages = messages.filter(
    (m) => m.studentId === activeStudent.studentId
  );
  const releasedGames = games.filter(
    (g) =>
      (!g.studentId || g.studentId === activeStudent.studentId) &&
      (g.status === "released" || g.status === "approved")
  );

  async function sendText() {
    if (!text.trim()) return;
    if (!canSpend(studentCredits, creditCostPerRequest)) {
      setOut("Nicht genug Credits. Morgen gibt es wieder 200 — Pause ist ok.");
      return;
    }
    setBusy(true);
    try {
      const msg = await submitStudentRequest(text.trim());
      setText("");
      setOut(
        isLive || msg.status === "pending"
          ? "Anfrage an deinen Lehrer gesendet. Status siehst du unten."
          : msg.aiReply ??
              `${SINGLE_AI.name}: ${msg.aiInterpretation}${
                settings.teacherReplyPolicy === "always-ask-teacher"
                  ? " — Lehrer prüft den Vorschlag."
                  : ""
              }`
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleVoice() {
    if (recording) {
      setRecording(false);
      return;
    }
    setRecording(true);
    setBusy(true);
    try {
      const msg = await recordVoiceRequest();
      setOut(
        `Transkript: „${msg.transcriptDe}”\n${
          msg.status === "ai-replied"
            ? msg.aiReply
            : "An Lehrer gesendet — warte auf Freigabe."
        }`
      );
    } finally {
      setBusy(false);
      setRecording(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {i18n.ai.title}
          </h1>
          <p className="mt-1 text-slate-300">
            Fach: {getSubject(activeSubjectId).labelDe}
          </p>
        </div>
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-300">
          {tf(i18n.ai.creditsLeft, { n: studentCredits.remaining ?? 0 })}
          <span className="ml-2 text-slate-500">
            (−{creditCostPerRequest}/Anfrage)
          </span>
        </p>
      </div>
      <p className="text-xs text-slate-500">{i18n.ai.howCredits}</p>

      <SubjectSwitcher
        value={activeSubjectId}
        onChange={setActiveSubjectId}
        mySubjectIds={setupProfile?.subjectIds}
      />

      <div className="eq-card space-y-4 p-5">
        <p className="text-sm text-slate-400">
          {[
            activeStudent.cefrLevel,
            ...activeStudent.interests.slice(0, 2),
            activeStudent.currentFocus[0],
          ]
            .filter(Boolean)
            .join(" · ") || "Wähle Interessen für bessere Tipps."}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={isChildMode ? 2 : 3}
          placeholder="I want to practise speaking / Make a football game…"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
        />
        <div className={`flex gap-3 ${isChildMode ? "flex-col" : ""}`}>
          <Button onClick={() => void toggleVoice()} disabled={busy} variant="secondary">
            {recording ? (
              <>
                <Square className="h-4 w-4" /> {i18n.home.stopRecording}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> {i18n.home.voice}
              </>
            )}
          </Button>
          <Button onClick={() => void sendText()} disabled={busy || !text.trim()}>
            {busy ? i18n.common.loading : "Senden"}
          </Button>
        </div>
        {out && (
          <pre className="whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm text-slate-200">
            {out}
          </pre>
        )}
      </div>

      <div className="eq-card p-5">
        <h2 className="font-display text-xl text-white">{i18n.ai.requests}</h2>
        {myMessages.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">{i18n.common.empty}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {myMessages.slice(0, 10).map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-white">
                    {m.text || m.transcriptDe || "Anfrage"}
                  </span>
                  <StatusBadge
                    status={
                      m.status === "pending"
                        ? "pending"
                        : m.status === "denied"
                          ? "revoked"
                          : "approved"
                    }
                  />
                </div>
                {m.status === "approved" && (
                  <p className="mt-1 text-xs text-emerald-300">
                    Freigegeben — schau unter Spiele / Lernen.
                  </p>
                )}
                {m.status === "denied" && (
                  <p className="mt-1 text-xs text-rose-300">Abgelehnt</p>
                )}
                {m.status === "pending" && (
                  <p className="mt-1 text-xs text-amber-200">{i18n.ai.pending}</p>
                )}
              </li>
            ))}
          </ul>
        )}
        {releasedGames.length > 0 && (
          <p className="mt-4 text-sm text-slate-400">
            Freigegebene Inhalte:{" "}
            <Link href="/student/games" className="text-indigo-300 underline">
              {releasedGames.length} Spiele
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
