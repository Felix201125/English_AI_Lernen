"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mic, Sparkles } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { interestCatalog } from "@/lib/data/mock-students";
import { ChildHomeExtras } from "@/components/student/child-home-extras";
import { getSubject } from "@/lib/subjects";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { t, tf } from "@/lib/i18n";
import {
  continueItemsFromState,
  formatActiveDe,
  xpToNextLevel,
} from "@/lib/student/progress-engine";

export default function StudentHomePage() {
  const {
    activeStudent,
    activeSubjectId,
    setActiveSubjectId,
    studentCredits,
    creditCostPerRequest,
    games,
    isLive,
    isChildMode,
    submitStudentRequest,
    recordVoiceRequest,
    messages,
    setupProfile,
    persistReady,
    authUser,
  } = useApp();
  const i18n = t();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);

  const hour = new Date().getHours();
  const hello =
    hour < 12
      ? i18n.home.greetingMorning
      : hour < 18
        ? i18n.home.greetingDay
        : i18n.home.greetingEvening;

  const recommended = activeStudent.currentRecommendation;
  const continueItems = continueItemsFromState(activeStudent, games);
  const xpLevel = xpToNextLevel(activeStudent.xp);
  const hasSkills = Object.values(activeStudent.skills).some((v) => v > 0);

  const interestCards = useMemo(
    () =>
      interestCatalog.filter((i) => activeStudent.interests.includes(i.id)),
    [activeStudent.interests]
  );

  const playable = games.find(
    (g) =>
      (!g.studentId || g.studentId === activeStudent.studentId) &&
      (g.status === "released" || g.status === "active" || g.status === "approved")
  );

  const basedParts = [
    activeStudent.cefrLevel,
    ...activeStudent.interests.slice(0, 2),
    activeStudent.currentFocus[0],
  ].filter(Boolean);

  async function onCreate() {
    if (!prompt.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      const msg = await submitStudentRequest(prompt.trim());
      setPrompt("");
      setFeedback(
        isLive || msg.status === "pending"
          ? "Anfrage an deinen Lehrer gesendet. Du siehst den Status unter KI → Meine Anfragen."
          : msg.aiReply ?? "Antwort erhalten — schau bei Empfohlen nach."
      );
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : i18n.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function onVoice() {
    setBusy(true);
    setFeedback(i18n.home.listening);
    try {
      const msg = await recordVoiceRequest();
      setFeedback(
        isLive || msg.status === "pending"
          ? `Sprachnachricht gesendet${msg.transcriptDe ? `: „${msg.transcriptDe}“` : ""}.`
          : msg.aiReply ?? "Sprachnachricht verarbeitet."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!persistReady && authUser?.role === "student") {
    return (
      <div className="space-y-6" aria-busy="true" aria-label={i18n.common.loading}>
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
        <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            {hello}, {activeStudent.name} {isChildMode ? "🌟" : "👋"}
          </h1>
          <p className="mt-1 text-slate-300">{i18n.home.whatToday}</p>
          <div className="mt-3">
            <SubjectSwitcher
              value={activeSubjectId}
              onChange={setActiveSubjectId}
              mySubjectIds={setupProfile?.subjectIds}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
          <span className="text-indigo-300">
            {getSubject(activeSubjectId).labelDe}
          </span>
          <span className="mx-2 text-slate-600">·</span>
          <span className="text-cyan-300">
            {studentCredits.remaining ?? "∞"} {i18n.common.credits}
          </span>
          <span className="mx-2 text-slate-600">·</span>
          <span className="text-amber-300">
            ⭐ {activeStudent.xp} {i18n.common.xp}
          </span>
          <span className="mx-2 text-slate-600">·</span>
          <span className="text-slate-400">
            {formatActiveDe(activeStudent.lastActive)}
          </span>
        </div>
      </header>

      <div className="eq-card p-4">
        <div className="mb-1 flex justify-between text-sm">
          <span>Level {xpLevel.level}</span>
          <span className="text-slate-400">
            {xpLevel.current}/{xpLevel.need} XP
          </span>
        </div>
        <ProgressBar value={xpLevel.current} />
        <p className="mt-2 text-xs text-slate-500">{i18n.progress.pauseOk}</p>
      </div>

      {interestCards.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {interestCards.map((item) => (
            <Link
              key={item.id}
              href="/student/games"
              className={`eq-card bg-gradient-to-br ${item.color} p-4 text-white transition hover:scale-[1.02]`}
            >
              <div className="text-3xl">{item.emoji}</div>
              <p className="mt-2 font-semibold">{item.id}</p>
              <p className="text-xs text-white/80">Spiele entdecken</p>
            </Link>
          ))}
        </section>
      ) : (
        <Link
          href="/student/interests"
          className="eq-card block p-5 text-slate-300 hover:bg-white/5"
        >
          Noch keine Interessen — tippe hier, um welche zu wählen.
        </Link>
      )}

      <ChildHomeExtras />

      <section className="eq-card p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
          <Sparkles className="h-4 w-4" /> {i18n.home.askAi}
        </div>
        <p className="mb-2 text-xs text-slate-500">
          {tf(i18n.home.creditCost, { n: creditCostPerRequest })} ·{" "}
          {tf(i18n.ai.creditsLeft, {
            n: studentCredits.remaining ?? 0,
          })}
        </p>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I want to practise speaking..."
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-indigo-400 focus:ring"
          />
          <div className="flex gap-2">
            <Button onClick={() => void onVoice()} disabled={busy} variant="secondary">
              <Mic className="h-5 w-5" />
              {busy ? i18n.home.listening : i18n.home.voice}
            </Button>
            <Button
              onClick={() => void onCreate()}
              disabled={busy || !prompt.trim()}
            >
              {busy ? i18n.common.loading : "Erstellen"}
            </Button>
          </div>
        </div>
        {feedback && (
          <p className="mt-3 rounded-xl bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100">
            {feedback}
          </p>
        )}
        {basedParts.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            {i18n.home.basedOn}: {basedParts.join(" · ")}
          </p>
        )}
        {messages.filter((m) => m.status === "pending").length > 0 && (
          <p className="mt-2 text-xs text-amber-200">
            Offene Anfragen:{" "}
            {messages.filter((m) => m.status === "pending").length} —{" "}
            <Link href="/student/ai" className="underline">
              ansehen
            </Link>
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="eq-card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-display text-xl text-white">
            {i18n.home.continueLearning}
          </h2>
          {continueItems.length === 0 ? (
            <p className="text-sm text-slate-400">{i18n.home.noProgressYet}</p>
          ) : (
            continueItems.map((item) => (
              <Link
                key={item.gameId}
                href={`/student/activity/${item.gameId}`}
                className="block rounded-xl border border-transparent p-2 transition hover:border-white/10 hover:bg-white/5"
              >
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.title}</span>
                  <span className="text-slate-400">{item.value}%</span>
                </div>
                <ProgressBar value={item.value} />
              </Link>
            ))
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-display text-lg text-white">
              {i18n.home.recommended}
            </h3>
            {recommended ? (
              <>
                <p className="mt-2 text-xl">🕵️ {recommended.title}</p>
                <p className="text-sm text-slate-400">
                  {recommended.durationMinutes} min · {recommended.level} ·{" "}
                  {recommended.skill}
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm text-indigo-300 underline"
                    aria-expanded={whyOpen}
                    onClick={() => setWhyOpen((v) => !v)}
                  >
                    {i18n.common.why}
                  </button>
                  {whyOpen && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                      {(recommended.aiReasoning.length
                        ? recommended.aiReasoning
                        : recommended.personalization
                      ).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={recommended.status} />
                  {isLive &&
                  (recommended.status === "pending" ||
                    recommended.status === "locked") ? (
                    <Button disabled variant="secondary">
                      Warte auf Lehrer-Freigabe
                    </Button>
                  ) : playable ? (
                    <Link href={`/student/activity/${playable.id}`}>
                      <Button>Spiel starten</Button>
                    </Link>
                  ) : (
                    <Link href="/student/games">
                      <Button variant="secondary">Zu den Spielen</Button>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-400">{i18n.home.noRecommendation}</p>
            )}
          </div>
        </section>

        <section className="eq-card p-5">
          <h2 className="font-display text-xl text-white">
            {hasSkills ? i18n.home.focusAreas : i18n.home.strengths}
          </h2>
          {!hasSkills && activeStudent.strengths.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              {i18n.home.noProgressYet}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {(activeStudent.currentFocus.length
                ? activeStudent.currentFocus
                : activeStudent.strengths
              ).map((f) => (
                <li
                  key={f}
                  className="rounded-xl bg-violet-500/10 px-3 py-2 text-sm text-violet-100"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
