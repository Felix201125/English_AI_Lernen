"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

export default function TeacherSettingsPage() {
  const { settings, updateSettings, authUser } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-white">Settings</h1>
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
              Passwort ändern, überall abmelden oder Konto löschen →{" "}
              <Link href="/teacher/account" className="text-indigo-300">
                Konto
              </Link>
            </p>
          </div>
        )}

        <div>
          <h2 className="font-display text-lg text-white">
            Qestra-KI Freigabe
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Darf die eine KI einfache Schüler-Fragen außerhalb von Live-Lessons
            selbst beantworten — oder immer dir vorlegen?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={
                settings.teacherReplyPolicy === "always-ask-teacher"
                  ? "primary"
                  : "secondary"
              }
              onClick={() =>
                updateSettings({ teacherReplyPolicy: "always-ask-teacher" })
              }
            >
              Immer zuerst mich fragen
            </Button>
            <Button
              variant={
                settings.teacherReplyPolicy === "ai-may-reply"
                  ? "primary"
                  : "secondary"
              }
              onClick={() =>
                updateSettings({ teacherReplyPolicy: "ai-may-reply" })
              }
            >
              KI darf antworten (außerhalb Live)
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Solo learning</h2>
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.notifyOnSoloComplete}
              onChange={(e) =>
                updateSettings({ notifyOnSoloComplete: e.target.checked })
              }
            />
            Notify me when a student finishes something alone
          </label>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Live lesson mode</h2>
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.liveLessonActive}
              onChange={(e) =>
                updateSettings({ liveLessonActive: e.target.checked })
              }
            />
            Live lesson active (teacher full control)
          </label>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Adaptive defaults</h2>
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.adaptiveDifficulty}
              onChange={(e) =>
                updateSettings({ adaptiveDifficulty: e.target.checked })
              }
            />
            Adaptive difficulty enabled
          </label>
          <select
            className="mt-3 w-full max-w-sm rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={settings.readingSupportDefault}
            onChange={(e) =>
              updateSettings({
                readingSupportDefault: e.target
                  .value as typeof settings.readingSupportDefault,
              })
            }
          >
            <option value="audio-visual">Audio + visual support</option>
            <option value="audio">Audio first</option>
            <option value="visual">Visual support</option>
            <option value="text">Text-based</option>
          </select>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Motivation: kein Streak-Verfall. Pause einer Woche ist ok — Lernen aus
          Bock, nicht aus Druck.
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-50">
          <h2 className="font-display text-lg text-white">
            Keys für Upload (Mistral + Daily.co)
          </h2>
          <p className="mt-2 text-slate-200">
            Keys werden <strong>nicht</strong> im Browser gespeichert — nur in{" "}
            <code className="text-amber-200">api/config.php</code> auf Hetzner.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-300">
            <li>
              <code className="text-amber-200">api/config.example.php</code> →{" "}
              <code className="text-amber-200">api/config.php</code>
            </li>
            <li>
              <code className="text-amber-200">mistral_api_key</code> von{" "}
              console.mistral.ai eintragen
            </li>
            <li>
              <code className="text-amber-200">daily_api_key</code> von{" "}
              dashboard.daily.co eintragen
            </li>
            <li>
              <code className="text-amber-200">google_client_id</code> von{" "}
              Google Cloud (OAuth Web-Client) für Google-Login
            </li>
            <li>
              Live-Stunden → <strong>Meeting jetzt starten</strong> — Video läuft
              direkt auf der Website
            </li>
          </ol>
          <p className="mt-2 text-xs text-slate-400">
            Build: <code>npm run build:hetzner</code> →{" "}
            <code>dist-hetzner/</code> hochladen. Details in HETZNER.md.
          </p>
        </div>
      </div>
    </div>
  );
}
