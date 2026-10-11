"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  cancelLesson,
  fetchIcalToken,
  fetchLessons,
  fetchTeacher,
  icalUrl,
  submitReview,
} from "@/lib/marketplace/api";
import { formatSlotDe } from "@/lib/marketplace/availability";
import type { LessonBooking, TeacherPublicProfile } from "@/lib/marketplace/types";
import { getSubject } from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SEED_TEACHERS } from "@/lib/marketplace/seed";

type Tab = "upcoming" | "past" | "cancelled";
type View = "list" | "calendar";

export default function StudentLessonsPage() {
  const { activeStudentId, setupProfile } = useApp();
  const i18n = t();
  const [lessons, setLessons] = useState<LessonBooking[]>([]);
  const [teachers, setTeachers] = useState<Record<string, TeacherPublicProfile>>(
    {}
  );
  const [tab, setTab] = useState<Tab>("upcoming");
  const [view, setView] = useState<View>("list");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [ical, setIcal] = useState("");
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const tz =
    setupProfile?.timezone ||
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Europe/Berlin");

  const teacherLabel = (id: string) => {
    const tch = teachers[id] || SEED_TEACHERS.find((x) => x.id === id);
    if (tch) return `${tch.firstName} ${tch.lastInitial}.`;
    return "Lehrkraft";
  };

  const load = async () => {
    setError("");
    try {
      const list = await fetchLessons({ studentId: activeStudentId });
      setLessons(list);
      const map: Record<string, TeacherPublicProfile> = {};
      await Promise.all(
        [...new Set(list.map((l) => l.teacherId))].map(async (tid) => {
          try {
            const data = await fetchTeacher(tid);
            map[tid] = data.teacher;
          } catch {
            const seed = SEED_TEACHERS.find((x) => x.id === tid);
            if (seed) map[tid] = seed;
          }
        })
      );
      setTeachers(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    }
  };

  useEffect(() => {
    void load();
    void fetchIcalToken(activeStudentId)
      .then((token) => setIcal(icalUrl(activeStudentId, token)))
      .catch(() => setIcal(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudentId]);

  const now = Date.now();
  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const start = new Date(l.startsAt).getTime();
      if (tab === "cancelled") return l.status === "cancelled";
      if (tab === "past")
        return (
          l.status === "completed" ||
          (l.status !== "cancelled" && start + l.durationMinutes * 60_000 < now)
        );
      return (
        l.status !== "cancelled" &&
        l.status !== "completed" &&
        start + l.durationMinutes * 60_000 >= now
      );
    });
  }, [lessons, tab, now]);

  const canJoin = (l: LessonBooking) => {
    if (l.status !== "confirmed" && l.status !== "pending") return false;
    const start = new Date(l.startsAt).getTime();
    const end = start + l.durationMinutes * 60_000;
    const early = 15 * 60_000;
    return now >= start - early && now <= end;
  };

  const onCancel = async (id: string) => {
    if (!confirm("Stunde wirklich absagen?")) return;
    try {
      await cancelLesson(id, "Schüler abgesagt");
      setStatus("Stunde abgesagt. Beide Seiten werden benachrichtigt.");
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    }
  };

  const onReview = async (lesson: LessonBooking) => {
    try {
      await submitReview({
        teacherId: lesson.teacherId,
        studentId: activeStudentId,
        lessonId: lesson.id,
        stars,
        text: reviewText,
      });
      setReviewFor(null);
      setReviewText("");
      setStatus("Danke für deine Bewertung!");
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    }
  };

  const statusLabel = (s: LessonBooking["status"]) => {
    if (s === "pending") return i18n.lessons.statusPending;
    if (s === "confirmed") return i18n.lessons.statusConfirmed;
    if (s === "cancelled") return i18n.lessons.statusCancelled;
    if (s === "completed") return i18n.lessons.statusCompleted;
    return s;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {i18n.lessons.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Alle gebuchten und Live-Stunden an einem Ort.
          </p>
        </div>
        <Link href="/student/teachers/">
          <Button variant="secondary">Lehrkräfte finden</Button>
        </Link>
      </div>

      {(status || error) && (
        <p
          className={cn("text-sm", error ? "text-rose-300" : "text-emerald-300")}
          role="status"
        >
          {error || status}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["upcoming", i18n.lessons.upcoming],
            ["past", i18n.lessons.past],
            ["cancelled", i18n.lessons.cancelled],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs",
              tab === k ? "bg-indigo-500/30 text-white" : "bg-white/5 text-slate-400"
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setView(view === "list" ? "calendar" : "list")}
          className="ml-auto rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300"
        >
          {view === "list" ? i18n.lessons.calendar : i18n.lessons.list}
        </button>
      </div>

      {ical && (
        <a
          href={ical}
          className="inline-block text-sm text-cyan-300 underline"
          target="_blank"
          rel="noreferrer"
        >
          {i18n.lessons.ical}
        </a>
      )}

      {!filtered.length && (
        <p className="text-sm text-slate-400">{i18n.lessons.empty}</p>
      )}

      {view === "calendar" && filtered.length > 0 && (
        <div className="eq-card grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <p className="text-white">{formatSlotDe(l.startsAt, tz)}</p>
              <p className="text-xs text-slate-400">
                {getSubject(l.subjectId).labelDe} · {l.durationMinutes} Min.
              </p>
            </div>
          ))}
        </div>
      )}

      {view === "list" && (
        <ul className="space-y-3">
          {filtered.map((l) => (
            <li key={l.id} className="eq-card space-y-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg text-white">
                    {getSubject(l.subjectId).labelDe}
                    {l.isTrial ? " · Kennenlernen" : ""}
                  </p>
                  <p className="text-sm text-slate-300">
                    {formatSlotDe(l.startsAt, tz)} · {l.durationMinutes} Min.
                  </p>
                  <p className="text-xs text-slate-500">
                    Lehrkraft:{" "}
                    <Link
                      href={`/student/teachers/${l.teacherId}/`}
                      className="text-indigo-300 underline"
                    >
                      {teacherLabel(l.teacherId)}
                    </Link>
                  </p>
                  {l.topic && (
                    <p className="text-sm text-slate-400">
                      {i18n.lessons.topic}: {l.topic}
                    </p>
                  )}
                </div>
                <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300">
                  {statusLabel(l.status)}
                </span>
              </div>

              {l.summary && (
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{i18n.lessons.summary}:</strong>{" "}
                  {l.summary}
                </p>
              )}
              {l.homework && (
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{i18n.lessons.homework}:</strong>{" "}
                  {l.homework}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {canJoin(l) && (
                  <Link href={l.dailyRoomUrl || "/student/live/"}>
                    <Button>{i18n.lessons.join}</Button>
                  </Link>
                )}
                {canJoin(l) && (
                  <Link href="/student/live/">
                    <Button variant="secondary">{i18n.lessons.techCheck}</Button>
                  </Link>
                )}
                {(l.status === "pending" || l.status === "confirmed") && (
                  <Button
                    variant="secondary"
                    onClick={() => void onCancel(l.id)}
                  >
                    {i18n.lessons.cancel}
                  </Button>
                )}
                {l.status === "completed" && (
                  <Button
                    variant="secondary"
                    onClick={() => setReviewFor(l.id)}
                  >
                    {i18n.lessons.review}
                  </Button>
                )}
              </div>

              {reviewFor === l.id && (
                <div className="space-y-2 rounded-xl border border-white/10 p-3">
                  <label className="text-xs text-slate-400">
                    Sterne
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={stars}
                      onChange={(e) => setStars(Number(e.target.value) || 5)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    />
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm"
                    rows={2}
                    placeholder="Kurzfeedback…"
                  />
                  <Button onClick={() => void onReview(l)}>Senden</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
