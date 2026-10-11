"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function TeacherSettingsPage() {
  const { settings, updateSettings, authUser } = useApp();
  const toast = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-white">
          Einstellungen
        </h1>
        <Link href="/teacher/account">
          <Button variant="secondary">Konto verwalten</Button>
        </Link>
      </div>

      <div className="eq-card space-y-5 p-5">
        {authUser && (
          <div>
            <h2 className="font-display text-lg text-white">Konto</h2>
            <p className="mt-1 text-sm text-slate-300">
              {authUser.name} · {authUser.email}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Passwort ändern oder Konto löschen unter{" "}
              <Link href="/teacher/account" className="text-indigo-300">
                Konto
              </Link>
              .
            </p>
          </div>
        )}

        <div>
          <h2 className="font-display text-lg text-white">Antworten der KI</h2>
          <p className="mt-1 text-sm text-slate-400">
            Sollen einfache Schülerfragen außerhalb von Live-Stunden erst von dir
            bestätigt werden?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={
                settings.teacherReplyPolicy === "always-ask-teacher"
                  ? "primary"
                  : "secondary"
              }
              onClick={() => {
                updateSettings({ teacherReplyPolicy: "always-ask-teacher" });
                toast.success("Gespeichert: Antworten erst von dir bestätigen lassen.");
              }}
            >
              Antworten immer erst von mir bestätigen lassen
            </Button>
            <Button
              variant={
                settings.teacherReplyPolicy === "ai-may-reply"
                  ? "primary"
                  : "secondary"
              }
              onClick={() => {
                updateSettings({ teacherReplyPolicy: "ai-may-reply" });
                toast.success("Gespeichert: KI darf außerhalb von Live antworten.");
              }}
            >
              KI darf antworten (außerhalb Live)
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Allein lernen</h2>
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.notifyOnSoloComplete}
              onChange={(e) => {
                updateSettings({ notifyOnSoloComplete: e.target.checked });
                toast.success("Benachrichtigung gespeichert.");
              }}
            />
            Benachrichtigen, wenn ein Schüler etwas allein abschließt
          </label>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Live-Stunden</h2>
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.liveLessonActive}
              onChange={(e) => {
                updateSettings({ liveLessonActive: e.target.checked });
                toast.success(
                  e.target.checked
                    ? "Live-Modus aktiv."
                    : "Live-Modus beendet."
                );
              }}
            />
            Live-Stunde aktiv (volle Steuerung)
          </label>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Anpassung</h2>
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.adaptiveDifficulty}
              onChange={(e) => {
                updateSettings({ adaptiveDifficulty: e.target.checked });
                toast.success("Gespeichert.");
              }}
            />
            Schwierigkeit automatisch anpassen
          </label>
          <select
            className="mt-3 w-full max-w-sm rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={settings.readingSupportDefault}
            onChange={(e) => {
              updateSettings({
                readingSupportDefault: e.target
                  .value as typeof settings.readingSupportDefault,
              });
              toast.success("Leseunterstützung gespeichert.");
            }}
          >
            <option value="audio-visual">Audio und Bilder</option>
            <option value="audio">Zuerst Audio</option>
            <option value="visual">Visuelle Unterstützung</option>
            <option value="text">Textbasiert</option>
          </select>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Pause ist ok — Fortschritt bleibt erhalten. Kein Streak-Druck.
        </div>
      </div>
    </div>
  );
}
