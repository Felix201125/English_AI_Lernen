"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Volume2, Mic, Square } from "lucide-react";
import { t, tf } from "@/lib/i18n";
import { callServerAI } from "@/lib/ai/server-client";

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const i18n = t();
  const {
    games,
    completeActivity,
    setActivityStatus,
    requestTranslation,
    translations,
    can,
    isChildMode,
    live,
    activeStudent,
  } = useApp();
  const game = games.find((g) => g.id === id);
  const [step, setStep] = useState(0);
  const [hints, setHints] = useState(0);
  const [hintText, setHintText] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"ok" | "retry" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [word, setWord] = useState("stadium");
  const [correctCount, setCorrectCount] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speechNote, setSpeechNote] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const current = game?.steps[step];
  const approvedTranslation = useMemo(
    () =>
      translations.find(
        (tr) => tr.sourceText === word && tr.status === "approved" && tr.shown
      ),
    [translations, word]
  );

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!game) {
    return <p className="text-slate-300">Aktivität nicht gefunden.</p>;
  }

  if (game.status === "revoked") {
    return (
      <div className="eq-card p-8 text-center">
        <p className="text-4xl">🚫</p>
        <h1 className="mt-3 font-display text-2xl">Aktivität beendet</h1>
        <p className="mt-2 text-slate-300">
          Dein Lehrer hat diese Aktivität zurückgezogen.
        </p>
        <Button className="mt-4" onClick={() => router.push("/student/games")}>
          Zurück zu Spielen
        </Button>
      </div>
    );
  }

  if (
    ["locked", "pending", "draft"].includes(game.status) ||
    (live.studentScreenLocked && live.currentActivityId === game.id)
  ) {
    return (
      <div className="eq-card p-8 text-center">
        <StatusBadge status={game.status === "draft" ? "locked" : game.status} />
        <h1 className="mt-4 font-display text-2xl">{game.title}</h1>
        <p className="mt-2 text-slate-300">{i18n.games.lockedTeacher}</p>
      </div>
    );
  }

  async function finish() {
    setBusy(true);
    setActivityStatus(game!.id, "active");
    await completeActivity(
      game!.id,
      Math.round((correctCount / Math.max(1, game!.steps.length)) * 100) ||
        (result === "ok" ? 85 : 70),
      hints
    );
    setBusy(false);
    setDone(true);
  }

  function checkAnswer(optionIndexOrId: string) {
    if (!current) return;
    setSelected(optionIndexOrId);
    setHintText(null);
    const correct =
      current.correctId === optionIndexOrId ||
      current.correctId === String(optionIndexOrId);
    if (correct) {
      setResult("ok");
      setFeedback(i18n.activity.correct);
      setCorrectCount((c) => c + 1);
    } else {
      setResult("retry");
      setFeedback(i18n.activity.almost);
    }
  }

  function showHint() {
    const next = hints + 1;
    setHints(next);
    const soft = current?.audioHint || "Think about Past Simple forms.";
    const strong =
      current?.options?.[Number(current.correctId)] ||
      "Look at the verb form carefully.";
    setHintText(next === 1 ? soft : strong);
  }

  async function startRecording() {
    setSpeechNote(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((tr) => tr.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setSpeechNote(i18n.activity.micDenied);
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function acceptSpeaking() {
    setBusy(true);
    const ai = await callServerAI({
      action: "teacher_recommend",
      question: `Short feedback for spoken English answer about: ${current?.prompt}. Student typed: ${typedAnswer || "(audio recorded)"}`,
      student: {
        name: activeStudent.name,
        level: activeStudent.cefrLevel,
        focus: activeStudent.currentFocus,
        interests: activeStudent.interests,
      },
    });
    setSpeechNote(
      ai ||
        "Nice speaking! Keep using Past Simple. (English practice feedback)"
    );
    setResult("ok");
    setFeedback(i18n.activity.correct);
    setCorrectCount((c) => c + 1);
    setBusy(false);
  }

  if (done) {
    const entry = activeStudent.activityHistory.find(
      (a) => a.activityId === game.id
    );
    return (
      <div className="eq-card mx-auto max-w-lg p-8 text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-3 font-display text-3xl text-white">
          {i18n.activity.completeTitle}
        </h1>
        <p className="mt-2 text-emerald-300">{i18n.activity.completeSubtitle}</p>
        <div className="mt-6 grid gap-2 text-left text-sm text-slate-300">
          <p>
            {i18n.activity.summaryCorrect}: {correctCount}/{game.steps.length}
          </p>
          <p>
            {i18n.activity.summaryXp}: +{entry?.xpEarned ?? game.xpReward} XP
          </p>
          <p>Score: {entry?.score ?? "—"}%</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => router.push("/student")}>Start</Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/student/progress")}
          >
            {i18n.nav.progress}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {game.title}
          </h1>
          <p className="text-slate-400">
            {tf(i18n.activity.step, {
              n: step + 1,
              total: game.steps.length,
            })}{" "}
            · +{game.xpReward} XP
          </p>
        </div>
        <StatusBadge
          status={game.status === "released" ? "active" : game.status}
        />
      </div>

      <div className="eq-card grid gap-6 p-6 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700/40 to-indigo-900/40 p-10 text-7xl">
          {game.topic === "Football"
            ? "⚽"
            : game.topic === "Space"
              ? "🚀"
              : "🎮"}
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl text-white">
              {current?.prompt}
            </h2>
            {current?.audioHint && (
              <button
                type="button"
                className="rounded-full bg-cyan-500/20 p-3 text-cyan-200"
                title={current.audioHint}
                aria-label="Audio-Hinweis"
                onClick={() => setHintText(current.audioHint || null)}
              >
                <Volume2 />
              </button>
            )}
          </div>

          {current?.type === "image-choice" && (
            <div
              className={`grid gap-3 ${isChildMode ? "grid-cols-1" : "grid-cols-3"}`}
            >
              {current.imageOptions?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => checkAnswer(opt.id)}
                  className={`rounded-2xl border border-white/10 bg-black/20 p-6 text-4xl transition hover:bg-white/10 ${
                    selected === opt.id ? "ring-2 ring-indigo-400" : ""
                  }`}
                >
                  <div>{opt.emoji}</div>
                  <div className="mt-2 text-sm text-slate-300">{opt.label}</div>
                </button>
              ))}
            </div>
          )}

          {current?.type === "mcq" && (
            <div className="space-y-2">
              {current.options?.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => checkAnswer(String(idx))}
                  className={`block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left hover:bg-white/10 ${
                    selected === String(idx) ? "ring-2 ring-indigo-400" : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {current?.type === "speaking" && (
            <div className="space-y-3 rounded-2xl border border-dashed border-violet-400/40 bg-violet-500/10 p-6">
              <div className="flex flex-wrap justify-center gap-2">
                {!recording ? (
                  <Button onClick={() => void startRecording()}>
                    <Mic className="h-4 w-4" /> {i18n.activity.record}
                  </Button>
                ) : (
                  <Button variant="danger" onClick={stopRecording}>
                    <Square className="h-4 w-4" /> {i18n.activity.recordStop}
                  </Button>
                )}
              </div>
              {audioUrl && (
                <div className="space-y-2">
                  <audio controls src={audioUrl} className="w-full" />
                  <p className="text-center text-xs text-slate-400">
                    {i18n.activity.playRecording}
                  </p>
                </div>
              )}
              <p className="text-center text-xs text-slate-400">
                {i18n.activity.typeFallback}
              </p>
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                placeholder="Type your answer in English…"
              />
              <Button
                className="w-full"
                disabled={busy || (!audioUrl && !typedAnswer.trim())}
                onClick={() => void acceptSpeaking()}
              >
                {busy ? i18n.common.loading : i18n.common.next}
              </Button>
              {speechNote && (
                <p className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                  {speechNote}
                </p>
              )}
            </div>
          )}

          {feedback && (
            <p
              className={`rounded-xl px-3 py-2 text-sm ${
                result === "ok"
                  ? "bg-emerald-500/10 text-emerald-100"
                  : "bg-amber-500/10 text-amber-100"
              }`}
            >
              {feedback}
            </p>
          )}
          {hintText && (
            <p className="rounded-xl bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
              {i18n.activity.hintShown}: {hintText}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {can("hints") && (
              <Button variant="secondary" size="sm" onClick={showHint}>
                {i18n.common.hint} ({hints})
              </Button>
            )}
            {step < game.steps.length - 1 ? (
              <Button
                disabled={result !== "ok"}
                onClick={() => {
                  setStep((s) => s + 1);
                  setSelected(null);
                  setResult(null);
                  setFeedback(null);
                  setHintText(null);
                  setTypedAnswer("");
                  setAudioUrl(null);
                  setSpeechNote(null);
                }}
              >
                {i18n.common.next}
              </Button>
            ) : (
              <Button disabled={result !== "ok" || busy} onClick={() => void finish()}>
                {busy ? i18n.common.loading : i18n.common.finish}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="eq-card p-4">
        <h3 className="text-sm font-medium text-slate-200">Übersetzer</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void requestTranslation(word)}
          >
            Übersetzung anfragen
          </Button>
        </div>
        {approvedTranslation ? (
          <p className="mt-2 text-sm text-emerald-300">
            {approvedTranslation.sourceText} →{" "}
            {approvedTranslation.translatedText}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Frag deinen Lehrer, wenn du Hilfe bei diesem Wort brauchst.
          </p>
        )}
      </div>
    </div>
  );
}
