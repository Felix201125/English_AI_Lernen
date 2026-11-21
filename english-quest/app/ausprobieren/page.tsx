"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PROBE_GRADES, PROBE_INTERESTS } from "@/lib/guest/interests";
import {
  guestAi,
  guestAnswer,
  guestComplete,
  guestQuestStart,
  guestStart,
} from "@/lib/guest/client";
import { getGuestQuest } from "@/lib/guest/quests";
import { SiteFooter } from "@/components/legal/site-footer";
import { trackFunnel } from "@/components/analytics/funnel-tracker";
import { cn } from "@/lib/utils";

type Step = "interest" | "grade" | "quest" | "ai" | "done";

export default function AusprobierenPage() {
  const [step, setStep] = useState<Step>("interest");
  const [interest, setInterest] = useState<string | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [aiUsed, setAiUsed] = useState(0);
  const [aiInput, setAiInput] = useState("");
  const [aiLog, setAiLog] = useState<{ role: "user" | "ai"; text: string }[]>(
    []
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const [questId, setQuestId] = useState<string | null>(null);
  const quest = useMemo(
    () => (questId ? getGuestQuest(questId) : null),
    [questId]
  );

  useEffect(() => {
    void guestStart();
    trackFunnel("probe_start", "ausprobieren");
  }, []);

  const progress =
    step === "interest"
      ? 10
      : step === "grade"
        ? 25
        : step === "quest"
          ? 40 + (qIndex / Math.max(1, quest?.questions.length ?? 4)) * 35
          : step === "ai"
            ? 80 + aiUsed * 5
            : 100;

  const onPickInterest = async (id: string) => {
    setInterest(id);
    setStep("grade");
  };

  const onPickGrade = async (g: number) => {
    if (!interest) return;
    setBusy(true);
    setError(null);
    try {
      setGrade(g);
      const session = await guestQuestStart(interest, g);
      setXp(session.payload.xp);
      setQuestId(session.payload.questId);
      setQIndex(0);
      setStep("quest");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quest konnte nicht starten.");
    } finally {
      setBusy(false);
    }
  };

  const onAnswer = async (optionIndex: number) => {
    if (!quest) return;
    const q = quest.questions[qIndex];
    if (!q) return;
    setBusy(true);
    setError(null);
    try {
      const { session, correct, xpGain } = await guestAnswer(q.id, optionIndex);
      setXp(session.payload.xp);
      setFeedback(correct ? "Richtig!" : "Leider falsch — nächste Frage!");
      if (xpGain > 0) {
        setXpFlash(xpGain);
        window.setTimeout(() => setXpFlash(null), 1200);
      }
      window.setTimeout(() => {
        setFeedback(null);
        if (qIndex + 1 >= quest.questions.length) {
          void (async () => {
            const done = await guestComplete();
            setXp(done.payload.xp);
            setConfetti(true);
            trackFunnel("probe_quest_complete", "ausprobieren");
            setStep("ai");
          })();
        } else {
          setQIndex((i) => i + 1);
        }
      }, 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Antwort fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const onAiSend = async () => {
    const msg = aiInput.trim();
    if (!msg) return;
    setBusy(true);
    setError(null);
    setAiInput("");
    setAiLog((l) => [...l, { role: "user", text: msg }]);
    try {
      const { reply, session } = await guestAi(msg);
      setAiUsed(session.payload.aiMessagesUsed);
      setAiLog((l) => [...l, { role: "ai", text: reply }]);
      if (session.payload.aiMessagesUsed >= 3) {
        window.setTimeout(() => setStep("done"), 600);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "KI gerade nicht verfügbar."
      );
      if (
        e instanceof Error &&
        e.message.includes("3 Nachrichten")
      ) {
        setStep("done");
      }
    } finally {
      setBusy(false);
    }
  };

  const finishAiEarly = () => setStep("done");

  return (
    <main className="relative mx-auto min-h-dvh max-w-3xl px-4 py-8 sm:px-6">
      {confetti && <ConfettiBurst />}
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-xl font-bold text-white">
          {BRAND.name}
        </Link>
        <Link
          href="/register/"
          className="text-sm text-slate-400 hover:text-white"
        >
          Kostenlos registrieren
        </Link>
      </header>

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Probe ohne Anmeldung · keine persönlichen Daten
        </p>
      </div>

      {xpFlash !== null && (
        <p
          className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-bounce font-display text-2xl font-bold text-emerald-300"
          aria-live="polite"
        >
          +{xpFlash} XP
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </p>
      )}

      {step === "interest" && (
        <section className="mt-8 space-y-4">
          <h1 className="font-display text-3xl font-bold text-white">
            Was interessiert dich?
          </h1>
          <p className="text-slate-400">
            Wähl eine Kachel — danach kommt eine kurze Quest.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROBE_INTERESTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void onPickInterest(item.id)}
                className="eq-card flex min-h-[100px] flex-col items-center justify-center gap-2 p-4 text-center transition hover:scale-[1.03] hover:ring-1 hover:ring-indigo-400/40"
              >
                <span className="text-3xl" aria-hidden>
                  {item.emoji}
                </span>
                <span className="font-semibold text-white">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "grade" && (
        <section className="mt-8 space-y-4">
          <h1 className="font-display text-3xl font-bold text-white">
            Welche Klasse?
          </h1>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {PROBE_GRADES.map((g) => (
              <button
                key={g}
                type="button"
                disabled={busy}
                onClick={() => void onPickGrade(g)}
                className={cn(
                  "eq-card py-6 text-center font-display text-2xl font-bold text-white transition hover:ring-1 hover:ring-indigo-400/40",
                  grade === g && "ring-1 ring-indigo-400"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "quest" && quest && (
        <section className="mt-8 space-y-4">
          <h1 className="font-display text-2xl font-bold text-white">
            {quest.title}
          </h1>
          <p className="text-sm text-slate-400">
            Frage {qIndex + 1} von {quest.questions.length} · {xp} XP
          </p>
          {feedback && (
            <p className="text-emerald-300" aria-live="polite">
              {feedback}
            </p>
          )}
          <div className="eq-card space-y-4 p-5">
            <p className="text-lg text-white">
              {quest.questions[qIndex]?.prompt}
            </p>
            <div className="grid gap-2">
              {quest.questions[qIndex]?.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  disabled={busy || Boolean(feedback)}
                  onClick={() => void onAnswer(i)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-slate-100 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === "ai" && (
        <section className="mt-8 space-y-4">
          <h1 className="font-display text-2xl font-bold text-white">
            Frag den KI-Lernbegleiter
          </h1>
          <p className="text-slate-400">
            Noch {Math.max(0, 3 - aiUsed)} von 3 Nachrichten in der Probe.
          </p>
          <div className="eq-card max-h-64 space-y-2 overflow-y-auto p-4 text-sm">
            {aiLog.length === 0 && (
              <p className="text-slate-500">
                z. B. „Wie rechne ich Prozent nochmal?“
              </p>
            )}
            {aiLog.map((m, i) => (
              <p
                key={`${m.role}-${i}`}
                className={
                  m.role === "user" ? "text-indigo-200" : "text-slate-200"
                }
              >
                <strong>{m.role === "user" ? "Du: " : "KI: "}</strong>
                {m.text}
              </p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onAiSend();
              }}
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none ring-indigo-500/40 focus:ring-2"
              placeholder="Frag mich etwas zu deiner Aufgabe"
              disabled={busy || aiUsed >= 3}
            />
            <button
              type="button"
              disabled={busy || aiUsed >= 3 || !aiInput.trim()}
              onClick={() => void onAiSend()}
              className="rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              Senden
            </button>
          </div>
          <button
            type="button"
            className="text-sm text-slate-400 underline hover:text-white"
            onClick={finishAiEarly}
          >
            Weiter zum Ergebnis
          </button>
        </section>
      )}

      {step === "done" && (
        <section className="mt-8 space-y-6 text-center">
          <h1 className="font-display text-3xl font-bold text-white">
            Du hast {xp} XP gesammelt und dein erstes Abzeichen verdient!
          </h1>
          <p className="text-slate-300">
            Speichere deinen Fortschritt — kostenlos, ohne Kreditkarte.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register/?from=probe"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-4 text-center font-semibold text-white shadow-lg shadow-indigo-500/30 sm:w-auto"
            >
              Fortschritt speichern – kostenlos registrieren
            </Link>
            <Link
              href="/login/?from=probe"
              className="w-full rounded-2xl border border-white/15 px-6 py-4 text-center font-semibold text-white hover:bg-white/5 sm:w-auto"
            >
              Schon Konto? Anmelden
            </Link>
          </div>
        </section>
      )}

      <SiteFooter className="mt-12" />
    </main>
  );
}

function ConfettiBurst() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="eq-confetti absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: `${(i * 17) % 100}%`,
            background: ["#818cf8", "#22d3ee", "#34d399", "#f472b6"][i % 4],
            animationDelay: `${(i % 8) * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
