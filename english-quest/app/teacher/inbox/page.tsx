"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeDe } from "@/lib/format/datetime";
import { fetchLessons, confirmLesson, cancelLesson } from "@/lib/marketplace/api";
import type { LessonBooking } from "@/lib/marketplace/types";
import { useEffect } from "react";
import { getSubject } from "@/lib/subjects";

type Tab = "content" | "bookings" | "help" | "notes";

export default function TeacherInboxPage() {
  const {
    messages,
    notifications,
    decideStudentRequest,
    markNotificationRead,
    settings,
    updateSettings,
    authUser,
    helpRequest,
  } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("content");
  const [reply, setReply] = useState<Record<string, string>>({});
  const [bookings, setBookings] = useState<LessonBooking[]>([]);

  const teacherId =
    authUser?.marketplaceTeacherId ||
    (authUser?.id ? `teacher-${authUser.id}` : "");

  useEffect(() => {
    if (!teacherId) return;
    void fetchLessons({ teacherId })
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [teacherId]);

  const pendingMessages = messages.filter((m) => m.status === "pending");
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const openBadge =
    pendingMessages.length +
    pendingBookings.length +
    (helpRequest?.status === "open" ? 1 : 0);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "content", label: "Inhalts-Anfragen", count: pendingMessages.length },
    { id: "bookings", label: "Buchungen", count: pendingBookings.length },
    {
      id: "help",
      label: "Hilfe (Live)",
      count: helpRequest?.status === "open" ? 1 : 0,
    },
    {
      id: "notes",
      label: "Benachrichtigungen",
      count: notifications.filter((n) => !n.read).length,
    },
  ];

  const policyLabel =
    settings.teacherReplyPolicy === "ai-may-reply"
      ? "KI darf einfache Fragen beantworten"
      : "Antworten immer erst von mir bestätigen lassen";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Posteingang
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Offene Anfragen: {openBadge} · {policyLabel}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={
              settings.teacherReplyPolicy === "always-ask-teacher"
                ? "primary"
                : "secondary"
            }
            onClick={() => {
              updateSettings({ teacherReplyPolicy: "always-ask-teacher" });
              toast.success("Antworten zuerst von dir bestätigen lassen.");
            }}
          >
            Antworten immer erst von mir bestätigen lassen
          </Button>
          <Button
            size="sm"
            variant={
              settings.teacherReplyPolicy === "ai-may-reply"
                ? "primary"
                : "secondary"
            }
            onClick={() => {
              updateSettings({ teacherReplyPolicy: "ai-may-reply" });
              toast.success("KI darf außerhalb von Live antworten.");
            }}
          >
            KI darf antworten
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              tab === t.id
                ? "bg-violet-500/30 text-white"
                : "bg-white/5 text-slate-400"
            }`}
          >
            {t.label}
            {t.count > 0 ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <section className="space-y-4">
          {!messages.length && (
            <p className="text-sm text-slate-400">Keine Inhalts-Anfragen.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="eq-card space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg text-white">
                  {m.status === "pending"
                    ? "Wartet auf dich"
                    : m.status === "approved"
                      ? "Freigegeben"
                      : m.status === "denied"
                        ? "Abgelehnt"
                        : "Beantwortet"}{" "}
                  · {m.studentName}
                </h2>
                <span className="text-xs text-slate-500">
                  {formatDateTimeDe(m.createdAt)}
                </span>
              </div>
              <p className="text-lg text-white">
                „{m.text || m.transcriptDe || "—"}“
              </p>
              {m.aiInterpretation && (
                <p className="text-sm text-slate-400">
                  Einordnung: {m.aiInterpretation}
                </p>
              )}
              {m.mainProposal && (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  Vorschlag: {m.mainProposal.title} ·{" "}
                  {m.mainProposal.durationMinutes} Min.
                  <div className="mt-1">
                    <StatusBadge status={m.mainProposal.status} />
                  </div>
                </div>
              )}
              {m.status === "pending" ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Antwort an den Schüler (optional)"
                    value={reply[m.id] ?? ""}
                    onChange={(e) =>
                      setReply((r) => ({ ...r, [m.id]: e.target.value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        decideStudentRequest(m.id, true);
                        toast.success("Freigegeben.");
                      }}
                    >
                      Freigeben
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        decideStudentRequest(m.id, false);
                        toast.success("Abgelehnt.");
                      }}
                    >
                      Ablehnen
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-300">
                  Status gespeichert — keine Aktion mehr nötig.
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === "bookings" && (
        <section className="space-y-3">
          {!bookings.length && (
            <p className="text-sm text-slate-400">
              Keine Buchungen. Für Seed-Tests: als lena@qestra.seed anmelden
              (Passwort: qestra-seed) oder unter Marktplatz das Seed-Profil wählen.
            </p>
          )}
          {bookings.map((b) => (
            <div key={b.id} className="eq-card space-y-2 p-4 text-sm">
              <p className="text-white">
                {getSubject(b.subjectId).labelDe} ·{" "}
                {formatDateTimeDe(b.startsAt)} · {b.durationMinutes} Min. ·{" "}
                {b.status}
              </p>
              {b.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      void confirmLesson(b.id).then(() => {
                        toast.success("Buchung bestätigt.");
                        setBookings((prev) =>
                          prev.map((x) =>
                            x.id === b.id
                              ? { ...x, status: "confirmed" }
                              : x
                          )
                        );
                      })
                    }
                  >
                    Bestätigen
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      void cancelLesson(b.id, "Abgelehnt").then(() => {
                        toast.success("Buchung abgelehnt.");
                        void fetchLessons({ teacherId }).then(setBookings);
                      })
                    }
                  >
                    Ablehnen
                  </Button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === "help" && (
        <section className="eq-card p-5 text-sm text-slate-300">
          {helpRequest?.status === "open" ? (
            <p>Offene Hilfe-Anfrage aus einer Live-Stunde.</p>
          ) : (
            <p>Keine offenen Hilfe-Anfragen.</p>
          )}
        </section>
      )}

      {tab === "notes" && (
        <section className="eq-card p-5">
          <ul className="space-y-2 text-sm">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                  n.read ? "bg-white/5" : "bg-amber-500/10"
                }`}
              >
                <span>
                  {n.message}
                  <span className="ml-2 text-xs text-slate-500">
                    {formatDateTimeDe(n.createdAt)}
                  </span>
                </span>
                {!n.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    Gelesen
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
