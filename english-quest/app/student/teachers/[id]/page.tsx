"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  bookLesson,
  fetchTeacher,
  sendMarketplaceMessage,
} from "@/lib/marketplace/api";
import type { FreeSlot } from "@/lib/marketplace/availability";
import { formatSlotDe } from "@/lib/marketplace/availability";
import type {
  TeacherPublicProfile,
  TeacherReview,
} from "@/lib/marketplace/types";
import { getSubject, type SubjectId } from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { activeStudentId, activeSubjectId, setupProfile } = useApp();
  const i18n = t();

  const [teacher, setTeacher] = useState<TeacherPublicProfile | null>(null);
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [duration, setDuration] = useState<25 | 45 | 60>(45);
  const [subjectId, setSubjectId] = useState<SubjectId>(activeSubjectId);
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const tz =
    setupProfile?.timezone ||
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Europe/Berlin");

  const load = async (dur = duration) => {
    setError("");
    try {
      const data = await fetchTeacher(id, dur);
      setTeacher(data.teacher);
      setSlots(data.slots);
      setReviews(data.reviews);
      if (data.teacher.subjects.includes(activeSubjectId)) {
        setSubjectId(activeSubjectId);
      } else if (data.teacher.subjects[0]) {
        setSubjectId(data.teacher.subjects[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    }
  };

  useEffect(() => {
    if (id) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const book = async (isTrial: boolean) => {
    if (!selected) {
      setError("Bitte einen Termin wählen.");
      return;
    }
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const lesson = await bookLesson({
        studentId: activeStudentId,
        teacherId: id,
        subjectId,
        topic,
        startsAt: selected,
        durationMinutes: isTrial ? 25 : duration,
        isTrial,
        autoConfirm: false,
      });
      setStatus(
        lesson.status === "pending"
          ? "Anfrage gesendet — die Lehrkraft bestätigt gleich."
          : "Stunde gebucht!"
      );
      setTimeout(() => router.push("/student/lessons/"), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    } finally {
      setBusy(false);
    }
  };

  const sendMsg = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    try {
      await sendMarketplaceMessage({
        teacherId: id,
        studentId: activeStudentId,
        text: msg.trim(),
        fromRole: "student",
      });
      setMsg("");
      setStatus("Nachricht gesendet (nur in Qestra).");
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    } finally {
      setBusy(false);
    }
  };

  if (!teacher && !error) {
    return <p className="text-slate-400">{i18n.common.loading}</p>;
  }
  if (!teacher) {
    return (
      <p className="text-rose-300" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/student/teachers/" className="text-sm text-indigo-300">
        ← {i18n.teachers.title}
      </Link>

      <header className="eq-card space-y-2 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-2xl">
            {teacher.firstName.slice(0, 1)}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              {teacher.firstName} {teacher.lastInitial}.
            </h1>
            {teacher.verified && (
              <p className="text-sm text-emerald-300">{i18n.teachers.verified}</p>
            )}
            <p className="mt-2 text-slate-300">{teacher.bioLong}</p>
            <p className="mt-2 text-sm text-slate-400">
              Stil: {teacher.style}
            </p>
            <p className="text-sm text-slate-400">
              Qualifikation: geprüft durch Qestra
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300">
          Fächer:{" "}
          {teacher.subjects.map((s) => getSubject(s).labelDe).join(", ")}
        </p>
        <p className="text-sm text-slate-300">
          Klassenstufen: {teacher.gradeLevels.join(", ")} · Schwerpunkte:{" "}
          {teacher.focusTags.join(", ")}
        </p>
        <p className="text-xs text-slate-500">{i18n.teachers.privacyNote}</p>
        <p className="text-[11px] text-slate-500">{i18n.teachers.paymentLater}</p>
      </header>

      {(status || error) && (
        <p
          className={cn("text-sm", error ? "text-rose-300" : "text-emerald-300")}
          role="status"
        >
          {error || status}
        </p>
      )}

      <section className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">Termin wählen</h2>
        <div className="flex flex-wrap gap-2">
          {([25, 45, 60] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDuration(d);
                void load(d);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs",
                duration === d
                  ? "bg-indigo-500/30 text-white"
                  : "bg-white/5 text-slate-400"
              )}
            >
              {d} Min.
            </button>
          ))}
        </div>
        <label className="block text-sm text-slate-300">
          Fach
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
          >
            {teacher.subjects.map((s) => (
              <option key={s} value={s}>
                {getSubject(s).labelDe}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-300">
          Thema / Frage (optional)
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
            placeholder="z. B. Past Simple"
          />
        </label>
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {slots.map((slot) => (
            <li key={slot.startsAt}>
              <button
                type="button"
                onClick={() => setSelected(slot.startsAt)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-sm",
                  selected === slot.startsAt
                    ? "border-cyan-400/50 bg-cyan-500/15 text-white"
                    : "border-white/10 text-slate-300"
                )}
              >
                {formatSlotDe(slot.startsAt, tz)}
              </button>
            </li>
          ))}
          {!slots.length && (
            <li className="text-sm text-slate-400">Keine freien Termine.</li>
          )}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy}
            onClick={() => void book(true)}
          >
            {i18n.teachers.trial} ({teacher.trialMinutes} Min.)
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void book(false)}
          >
            {i18n.teachers.book}
          </Button>
        </div>
      </section>

      <section className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">{i18n.teachers.message}</h2>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          placeholder="Nachricht an die Lehrkraft…"
        />
        <Button disabled={busy || !msg.trim()} onClick={() => void sendMsg()}>
          Senden
        </Button>
      </section>

      <section className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">Bewertungen</h2>
        {!reviews.length && (
          <p className="text-sm text-slate-400">Noch keine Bewertungen.</p>
        )}
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm"
            >
              <span className="text-amber-300">{"★".repeat(r.stars)}</span>
              <p className="mt-1 text-slate-300">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
