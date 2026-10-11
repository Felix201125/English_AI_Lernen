"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { SubjectPicker } from "@/components/subject-picker";
import { Button } from "@/components/ui/button";
import { fetchTeachers } from "@/lib/marketplace/api";
import { sortTeachers } from "@/lib/marketplace/ranking";
import { LEARNING_GOALS } from "@/lib/marketplace/constants";
import type { TeacherPublicProfile } from "@/lib/marketplace/types";
import { getSubject, type SubjectId } from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { formatSlotDe } from "@/lib/marketplace/availability";

type SortKey = "match" | "rating" | "price" | "nextSlot";

export default function StudentTeachersPage() {
  const { activeSubjectId, setupProfile } = useApp();
  const i18n = t();
  const [subject, setSubject] = useState<SubjectId>(activeSubjectId);
  const [grade, setGrade] = useState(setupProfile?.gradeLevel ?? 0);
  const [goal, setGoal] = useState("");
  const [lang, setLang] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("match");
  const [teachers, setTeachers] = useState<TeacherPublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchTeachers({
        subject: subject || undefined,
        grade: grade || undefined,
        lang: lang || undefined,
        minRating: minRating || undefined,
        duration: 45,
      });
      setTeachers(list);
      setStatus(`${list.length} Lehrkräfte gefunden`);
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () => sortTeachers(teachers, sort, setupProfile, { subjectId: subject, goal }),
    [teachers, sort, setupProfile, subject, goal]
  );

  const tz =
    setupProfile?.timezone ||
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Europe/Berlin");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          {i18n.teachers.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{i18n.teachers.subtitle}</p>
        <p className="mt-1 text-xs text-slate-500">{i18n.teachers.privacyNote}</p>
      </div>

      <div className="eq-card space-y-3 p-4">
        <p className="text-xs font-medium text-slate-400">{i18n.teachers.filters}</p>
        <SubjectPicker
          value={subject}
          onChange={setSubject}
          allowPreparing
          mySubjectIds={setupProfile?.subjectIds}
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-400">
            Klassenstufe
            <input
              type="number"
              min={0}
              max={13}
              value={grade || ""}
              placeholder="alle"
              onChange={(e) => setGrade(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">
            Ziel
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="">alle</option>
              {LEARNING_GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.labelDe}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Sprache
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="">alle</option>
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
              <option value="tr">Türkisch</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Min. Bewertung
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value={0}>alle</option>
              <option value={4}>ab 4★</option>
              <option value={4.5}>ab 4,5★</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            aria-label="Sortierung"
          >
            <option value="match">{i18n.teachers.sortMatch}</option>
            <option value="rating">{i18n.teachers.sortRating}</option>
            <option value="price">{i18n.teachers.sortPrice}</option>
            <option value="nextSlot">{i18n.teachers.sortNext}</option>
          </select>
          <Button type="button" onClick={() => void load()}>
            {i18n.teachers.search}
          </Button>
          {status && (
            <span className="text-xs text-emerald-300" role="status">
              {status}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">{i18n.teachers.paymentLater}</p>
      </div>

      {loading && <p className="text-sm text-slate-400">{i18n.common.loading}</p>}
      {error && (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      {!loading && !sorted.length && (
        <p className="text-sm text-slate-400">{i18n.teachers.noResults}</p>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {sorted.map((teacher) => (
          <li key={teacher.id}>
            <Link
              href={`/student/teachers/${teacher.id}/`}
              className="eq-card block space-y-2 p-4 transition hover:border-indigo-400/30"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-lg"
                  aria-hidden
                >
                  {teacher.firstName.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-white">
                    {teacher.firstName} {teacher.lastInitial}.
                  </p>
                  {teacher.verified && (
                    <span className="text-[11px] text-emerald-300">
                      {i18n.teachers.verified}
                    </span>
                  )}
                  <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                    {teacher.bioShort}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {teacher.subjects.map((s) => getSubject(s).labelDe).join(" · ")}
              </p>
              <p className="text-xs text-slate-400">
                Klassen {teacher.gradeLevels.join(", ")}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span>
                  ★ {teacher.ratingAvg.toFixed(1)} ({teacher.ratingCount})
                </span>
                <span>
                  {teacher.lessonsTaught} {i18n.teachers.lessons}
                </span>
                <span>
                  {teacher.priceCreditsPerHour != null
                    ? i18n.teachers.priceCredits.replace(
                        "{n}",
                        String(teacher.priceCreditsPerHour)
                      )
                    : i18n.teachers.priceFree}
                </span>
              </div>
              <p className="text-xs text-cyan-300">
                {i18n.teachers.nextSlot}:{" "}
                {teacher.nextFreeSlotIso
                  ? formatSlotDe(teacher.nextFreeSlotIso, tz)
                  : "—"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
