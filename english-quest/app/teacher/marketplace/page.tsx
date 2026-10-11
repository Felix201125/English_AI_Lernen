"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  completeLesson,
  confirmLesson,
  cancelLesson,
  fetchLessons,
  saveTeacherAvailability,
  saveTeacherProfile,
} from "@/lib/marketplace/api";
import type { LessonBooking, Weekday } from "@/lib/marketplace/types";
import { WEEKDAYS_DE } from "@/lib/marketplace/constants";
import { getSubject } from "@/lib/subjects";
import { formatSlotDe } from "@/lib/marketplace/availability";
import { cn } from "@/lib/utils";

/** Lehrkraft: Profil, Verfügbarkeit, Buchungsanfragen — Gegenstück zur Suche */
const SEED_PROFILES = [
  { id: "seed-teacher-lena", label: "Lena M. (Test-Seed)" },
  { id: "seed-teacher-jonas", label: "Jonas K. (Test-Seed)" },
  { id: "seed-teacher-sara", label: "Sara H. (Test-Seed)" },
];

export default function TeacherMarketplacePage() {
  const { authUser } = useApp();
  const ownId =
    authUser?.marketplaceTeacherId ||
    (authUser?.id ? `teacher-${authUser.id.replace(/[^a-z0-9\-]/gi, "")}` : "teacher-local");
  const [teacherId, setTeacherId] = useState(ownId);

  const [firstName, setFirstName] = useState(authUser?.name?.split(" ")[0] ?? "");
  const [lastInitial, setLastInitial] = useState("Q");
  const [bioShort, setBioShort] = useState("");
  const [bioLong, setBioLong] = useState("");
  const [style, setStyle] = useState("");
  const [subjects, setSubjects] = useState("english,math");
  const [price, setPrice] = useState<string>("40");
  const [weekday, setWeekday] = useState<Weekday>("tue");
  const [startH, setStartH] = useState(15);
  const [endH, setEndH] = useState(18);
  const [lessons, setLessons] = useState<LessonBooking[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [homework, setHomework] = useState("");
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const loadLessons = async () => {
    try {
      const list = await fetchLessons({ teacherId });
      setLessons(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
    }
  };

  useEffect(() => {
    setTeacherId(ownId);
  }, [ownId]);

  useEffect(() => {
    void loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const saveProfile = async () => {
    setError("");
    try {
      const t = await saveTeacherProfile(teacherId, {
        firstName,
        lastInitial,
        bioShort,
        bioLong,
        style,
        subjects: subjects.split(",").map((s) => s.trim()).filter(Boolean),
        // PAYMENT HOOK — Credits vorbereitet, Zahlung später
        priceCreditsPerHour: price === "" ? null : Number(price),
        currencyNote: "credits-placeholder",
        gradeLevels: [5, 6, 7, 8, 9, 10],
        languagesSpoken: ["de"],
        focusTags: ["gaps", "homework"],
        trialMinutes: 25,
      });
      setStatus(
        t.approved
          ? "Profil gespeichert."
          : "Profil gespeichert. Es wird nach einer kurzen Prüfung sichtbar."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    }
  };

  const saveSlots = async () => {
    try {
      await saveTeacherAvailability(teacherId, [
        {
          weekday,
          startMinutes: startH * 60,
          endMinutes: endH * 60,
          timezone: "Europe/Berlin",
        },
      ]);
      setStatus("Verfügbarkeit gespeichert.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Marktplatz-Profil
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Dein Profil wird nach einer kurzen Prüfung sichtbar. Kontakt nur über
          Qestra — keine privaten Kontaktdaten.
        </p>
        <label className="mt-3 block text-xs text-slate-400">
          Profil für Buchungen
          <select
            className="mt-1 w-full max-w-md rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value={ownId}>Mein Profil</option>
            {SEED_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(status || error) && (
        <p
          className={cn("text-sm", error ? "text-rose-300" : "text-emerald-300")}
          role="status"
        >
          {error || status}
        </p>
      )}

      <section className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">Profil</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-slate-400">
            Vorname
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Nachname (Initial)
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              value={lastInitial}
              maxLength={1}
              onChange={(e) => setLastInitial(e.target.value)}
            />
          </label>
        </div>
        <label className="block text-xs text-slate-400">
          Kurzbeschreibung
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={bioShort}
            onChange={(e) => setBioShort(e.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-400">
          Vorstellung
          <textarea
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            rows={3}
            value={bioLong}
            onChange={(e) => setBioLong(e.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-400">
          Unterrichtsstil
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-400">
          Fächer (IDs, kommagetrennt)
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-400">
          Preis Credits/Std. (leer = ausblenden)
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <Button onClick={() => void saveProfile()}>Profil speichern</Button>
      </section>

      <section className="eq-card space-y-3 p-5">
        <h2 className="font-display text-xl text-white">Verfügbarkeit</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={weekday}
            onChange={(e) => setWeekday(e.target.value as Weekday)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            {WEEKDAYS_DE.map((d) => (
              <option key={d.id} value={d.id}>
                {d.labelDe}
              </option>
            ))}
          </select>
          <label className="text-xs text-slate-400">
            von
            <input
              type="number"
              min={8}
              max={21}
              value={startH}
              onChange={(e) => setStartH(Number(e.target.value))}
              className="ml-1 w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-1"
            />
          </label>
          <label className="text-xs text-slate-400">
            bis
            <input
              type="number"
              min={9}
              max={22}
              value={endH}
              onChange={(e) => setEndH(Number(e.target.value))}
              className="ml-1 w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-1"
            />
          </label>
        </div>
        <Button onClick={() => void saveSlots()}>Zeiten speichern</Button>
      </section>

      <section className="eq-card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-white">Buchungsanfragen</h2>
          <Button variant="secondary" onClick={() => void loadLessons()}>
            Aktualisieren
          </Button>
        </div>
        {!lessons.length && (
          <p className="text-sm text-slate-400">Noch keine Anfragen.</p>
        )}
        <ul className="space-y-3">
          {lessons.map((l) => (
            <li key={l.id} className="rounded-xl border border-white/10 p-3 text-sm">
              <p className="text-white">
                {getSubject(l.subjectId).labelDe} ·{" "}
                {formatSlotDe(l.startsAt, "Europe/Berlin")} · {l.status}
              </p>
              <p className="text-slate-400">
                Schüler {l.studentId}
                {l.topic ? ` · ${l.topic}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {l.status === "pending" && (
                  <>
                    <Button
                      onClick={() =>
                        void confirmLesson(l.id).then(() => {
                          setStatus("Bestätigt.");
                          void loadLessons();
                        })
                      }
                    >
                      Bestätigen
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs"
                        placeholder="Grund (optional)"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                      />
                      <Button
                        variant="secondary"
                        onClick={() =>
                          void cancelLesson(
                            l.id,
                            declineReason || "Abgelehnt"
                          ).then(() => {
                            setStatus("Abgelehnt — Schüler wurde informiert.");
                            setDeclineReason("");
                            void loadLessons();
                          })
                        }
                      >
                        Ablehnen
                      </Button>
                    </div>
                  </>
                )}
                {l.status === "confirmed" && (
                  <Button
                    variant="secondary"
                    onClick={() => setCompleteId(l.id)}
                  >
                    Nachbereitung
                  </Button>
                )}
              </div>
              {completeId === l.id && (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    placeholder="Zusammenfassung"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                  <textarea
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    placeholder="Hausaufgaben / freigeschaltete Übungen"
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                  />
                  <Button
                    onClick={() =>
                      void completeLesson({
                        lessonId: l.id,
                        summary,
                        homework,
                        unlockedGameIds: [],
                      }).then(() => {
                        setCompleteId(null);
                        setStatus("Nachbereitung gespeichert.");
                        void loadLessons();
                      })
                    }
                  >
                    Speichern & abschließen
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
