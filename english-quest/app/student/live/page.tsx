"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { DailyVideoPanel } from "@/components/lesson/daily-video-panel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { permissionLabel } from "@/lib/permissions";
import { t } from "@/lib/i18n";

export default function StudentLivePage() {
  const {
    activeStudent,
    games,
    live,
    permissions,
    isLive,
    helpRequest,
    requestLiveHelp,
    endDailyMeeting,
  } = useApp();
  const i18n = t();
  const perms = permissions[activeStudent.studentId] ?? permissions[Object.keys(permissions)[0]];
  const current = games.find((g) => g.id === live.currentActivityId);
  const roomReady =
    Boolean(live.dailyRoomUrl) &&
    (!live.studentId || live.studentId === activeStudent.studentId);
  const [helpMsg, setHelpMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-white">
          {i18n.live.title}
        </h1>
        {isLive && roomReady && (
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-sm text-rose-300">
            🔴 Live
          </span>
        )}
      </div>

      {!isLive && !roomReady ? (
        <div className="eq-card p-8 text-center">
          <p className="text-4xl">📅</p>
          <h2 className="mt-3 font-display text-xl text-white">
            {i18n.live.notLive}
          </h2>
          <p className="mt-2 text-slate-400">{i18n.live.nextLesson}</p>
          <Link href="/student" className="mt-4 inline-block">
            <Button variant="secondary">Zur Startseite</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="eq-card overflow-hidden p-2">
            <DailyVideoPanel
              roomUrl={roomReady ? live.dailyRoomUrl : null}
              userName={activeStudent.name}
              emptyTitle="Daily.co Video"
              emptyHint={
                isLive
                  ? "Dein Lehrer startet das Meeting. Kamera und Mikrofon werden erst nach deiner Erlaubnis genutzt."
                  : i18n.live.notLive
              }
              canStart={false}
            />
            {roomReady && (
              <div className="flex justify-end p-3">
                <Button variant="secondary" size="sm" onClick={endDailyMeeting}>
                  {i18n.live.leave}
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="eq-card space-y-3 p-5">
              <h2 className="font-display text-lg">Aktuelle Aktivität</h2>
              {current ? (
                <>
                  <p className="text-xl text-white">{current.title}</p>
                  <StatusBadge
                    status={
                      current.status === "released" ? "active" : current.status
                    }
                  />
                  {["released", "active", "approved"].includes(current.status) && (
                    <Link href={`/student/activity/${current.id}`}>
                      <Button>Zur Aktivität</Button>
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-slate-400">Noch keine Aktivität freigegeben.</p>
              )}
            </div>
            <div className="eq-card space-y-2 p-5 text-sm">
              {perms && (
                <>
                  <p>
                    Übersetzer:{" "}
                    <span className="text-slate-300">
                      {permissionLabel(perms.translator)}
                    </span>
                  </p>
                  <p>
                    Hinweise:{" "}
                    <span className="text-slate-300">
                      {permissionLabel(perms.hints)}
                    </span>
                  </p>
                </>
              )}
              <div className="flex flex-col gap-2 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={helpRequest?.status === "open"}
                  onClick={() => {
                    requestLiveHelp();
                    setHelpMsg(i18n.live.helpSent);
                  }}
                >
                  {helpRequest?.status === "open"
                    ? i18n.live.helpOpen
                    : i18n.live.askHelp}
                </Button>
                {helpMsg && (
                  <p className="text-xs text-emerald-300">{helpMsg}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
