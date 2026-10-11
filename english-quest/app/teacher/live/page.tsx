"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { DailyVideoPanel } from "@/components/lesson/daily-video-panel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { permissionLabel } from "@/lib/permissions";

export default function TeacherLivePage() {
  const {
    live,
    learningStates,
    games,
    permissions,
    lastComparison,
    messages,
    useCopilotSuggestion,
    pauseCurrentActivity,
    lockStudentScreen,
    setActivityStatus,
    isLive,
    setLiveActive,
    setLiveStudent,
    startDailyMeeting,
    endDailyMeeting,
    meetingBusy,
    meetingError,
  } = useApp();
  const student = learningStates[live.studentId];
  const current = games.find((g) => g.id === live.currentActivityId);
  const perms = permissions[live.studentId];
  const pending = messages.filter(
    (m) => m.studentId === live.studentId && m.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-white">
          Live-Stunde · {student.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={live.studentId}
            onChange={(e) => setLiveStudent(e.target.value)}
          >
            {Object.values(learningStates).map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.name}
              </option>
            ))}
          </select>
          {isLive ? (
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-sm text-rose-300">
              🔴 LIVE
            </span>
          ) : (
            <span className="rounded-full bg-slate-500/20 px-3 py-1 text-sm">
              Solo
            </span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setLiveActive(!isLive)}
          >
            {isLive ? "Live-Modus aus" : "Live-Modus an"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="eq-card overflow-hidden p-2 lg:col-span-2">
          <DailyVideoPanel
            roomUrl={live.dailyRoomUrl}
            userName={`Lehrer`}
            emptyTitle="Daily.co Video"
            emptyHint="Mit einem Klick ein Meeting erstellen. Schüler treten auf ihrer Live-Seite bei — direkt auf der Website."
            onStart={() => startDailyMeeting(live.studentId)}
            startLabel="Meeting jetzt starten"
            starting={meetingBusy}
            error={meetingError}
            canStart
          />
          {live.dailyRoomUrl && (
            <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-1">
              <p className="flex-1 truncate text-xs text-slate-400">
                Raum: {live.dailyRoomName ?? "—"} · {live.dailyRoomUrl}
              </p>
              <Button size="sm" variant="danger" onClick={endDailyMeeting}>
                Meeting trennen
              </Button>
            </div>
          )}
        </div>

        <div className="eq-card space-y-3 p-4 text-sm">
          <h2 className="font-display text-lg text-white">Qestra KI</h2>
          <p>
            <span className="text-slate-400">Lernsituation:</span>{" "}
            {lastComparison?.studentRecommendation}
          </p>
          <p>
            <span className="text-sky-300">Unterrichtshinweis:</span>{" "}
            {lastComparison?.teacherRecommendation}
          </p>
          <p>
            <span className="text-emerald-300">Vorschlag:</span>{" "}
            {lastComparison?.mainDecision}
          </p>
          <p className="text-amber-200">Status: Wartet auf deine Freigabe.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={useCopilotSuggestion}>
              Vorschlag nutzen
            </Button>
            <Button size="sm" variant="ghost">
              Ignorieren
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="eq-card space-y-3 p-5">
          <h2 className="font-display text-lg">Aktuelle Aktivität</h2>
          {current ? (
            <>
              <p className="text-xl">{current.title}</p>
              <StatusBadge
                status={
                  current.status === "released" ? "active" : current.status
                }
              />
              <p className="text-sm text-slate-400">
                Fokus: {student.currentFocus.join(" + ")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={pauseCurrentActivity}
                >
                  Pausieren
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    current && setActivityStatus(current.id, "completed")
                  }
                >
                  Beenden
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    lockStudentScreen(!live.studentScreenLocked)
                  }
                >
                  {live.studentScreenLocked
                    ? "Bildschirm freigeben"
                    : "Bildschirm sperren"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-slate-400">Keine Aktivität aktiv.</p>
          )}
        </div>

        <div className="eq-card space-y-2 p-5 text-sm">
          <h2 className="font-display text-lg">Kontrolle</h2>
          <p>Übersetzer: {permissionLabel(perms.translator)}</p>
          <p>Schüler-Chat: {permissionLabel(perms.studentAIChat)}</p>
          <p>Hints: {permissionLabel(perms.hints)}</p>
          <p>Externe Links: {permissionLabel(perms.externalLinks)}</p>
          <p>Offene Anfragen: {pending}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/teacher/permissions">
              <Button size="sm" variant="secondary">
                Freigaben
              </Button>
            </Link>
            <Link href="/teacher/activity-log">
              <Button size="sm" variant="ghost">
                Protokoll
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
