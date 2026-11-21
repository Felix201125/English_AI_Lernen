"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

export default function LehrkraeftePage() {
  const [subject, setSubject] = useState("Mathematik");
  const [grade, setGrade] = useState("6");
  const [topic, setTopic] = useState("Prozentrechnung");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const onPreview = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDownloadMsg(null);
    try {
      const base = apiBase();
      if (base) {
        const res = await fetch(`${base}/guest_worksheet.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "preview",
            subject,
            grade,
            topic,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          html?: string;
          token?: string;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          throw new Error(
            data.error ||
              "Limit erreicht oder Vorschau nicht verfügbar. Bitte später erneut."
          );
        }
        setPreview(data.html || "");
        setPreviewToken(data.token || null);
        if (data.token) {
          localStorage.setItem("qestra.worksheet.preview", data.token);
        }
        return;
      }
      // Offline-Vorschau
      const html = `<h1>${topic} — Klasse ${grade}</h1><p>Fach: ${subject}</p><ol><li>Aufgabe 1 (Beispiel)</li><li>Aufgabe 2 (Beispiel)</li></ol><p class="wm">Erstellt mit ${BRAND.name}</p>`;
      setPreview(html);
      setPreviewToken("local-preview");
      localStorage.setItem("qestra.worksheet.preview", "local-preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler bei der Vorschau.");
    } finally {
      setBusy(false);
    }
  };

  const onDownload = () => {
    const token =
      previewToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("qestra.worksheet.preview")
        : null);
    if (!token) {
      setDownloadMsg("Bitte zuerst eine Vorschau erzeugen.");
      return;
    }
    setDownloadMsg(
      "PDF-Download ist nach kostenloser Registrierung freigeschaltet. Deine Vorschau bleibt gespeichert."
    );
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Für Lehrkräfte
        </h1>
        <p className="mt-3 text-slate-300">
          Arbeitsblätter in Sekunden vorbereiten — Vorschau ohne Login, Download
          nach kostenloser Registrierung.
        </p>

        <form onSubmit={onPreview} className="eq-card mt-8 space-y-4 p-6">
          <h2 className="font-display text-xl text-white">
            Arbeitsblatt in 30 Sekunden erstellen – kostenlos testen
          </h2>
          <label className="block text-sm text-slate-300">
            Fach
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option>Mathematik</option>
              <option>Deutsch</option>
              <option>Englisch</option>
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Klasse
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {[5, 6, 7, 8, 9, 10].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Thema
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Wird erstellt…" : "Vorschau erzeugen"}
          </button>
        </form>

        {preview && (
          <section className="eq-card relative mt-6 overflow-hidden p-6">
            <div
              className="prose prose-invert max-w-none text-sm text-slate-200"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
            <p className="pointer-events-none absolute bottom-4 right-4 rotate-[-12deg] text-lg font-bold text-white/25">
              Erstellt mit {BRAND.name}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onDownload}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
              >
                PDF herunterladen
              </button>
              <Link
                href="/register/?role=teacher"
                className="rounded-xl bg-indigo-500/80 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Kostenlos registrieren für Download
              </Link>
            </div>
            {downloadMsg && (
              <p className="mt-3 text-sm text-slate-400">{downloadMsg}</p>
            )}
          </section>
        )}

        <SiteFooter className="mt-12" />
      </main>
    </div>
  );
}
