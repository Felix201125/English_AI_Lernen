"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

export default function SchulenPage() {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const avPath = process.env.NEXT_PUBLIC_LEGAL_AV_CONTRACT_URL || "";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    if (!privacy) {
      setError("Bitte den Datenschutzhinweis bestätigen.");
      return;
    }
    if (honey) {
      setStatus("Danke — wir melden uns.");
      return;
    }
    setBusy(true);
    try {
      const base = apiBase();
      if (base) {
        const res = await fetch(`${base}/pilot_school.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, school, email, message, website: honey }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Senden fehlgeschlagen.");
        }
      }
      setStatus(
        "Danke — wir haben Ihre Anfrage erhalten und melden uns per E-Mail."
      );
      setName("");
      setSchool("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Senden fehlgeschlagen. Bitte später erneut."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Für Schulen
        </h1>
        <p className="mt-3 text-slate-300">
          Klassen anlegen, Klassencode teilen, Datenschutz mitdenken — Qestra
          für den Schulalltag.
        </p>

        <ul className="eq-card mt-8 list-disc space-y-2 p-6 pl-10 text-sm text-slate-300">
          <li>Klassen und Klassencodes für Ihre Lehrkräfte</li>
          <li>Live-Stunden mit Freigabe durch die Lehrkraft</li>
          <li>Keine öffentlichen Schülerprofile</li>
        </ul>

        <section className="mt-8 space-y-2">
          <h2 className="font-display text-xl text-white">AV-Vertrag</h2>
          {avPath ? (
            <a
              href={avPath}
              className="text-indigo-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Auftragsverarbeitungsvertrag herunterladen
            </a>
          ) : (
            <p className="text-sm text-slate-400">
              Der AV-Vertrag wird bereitgestellt, sobald die Datei vom Betreiber
              hinterlegt ist.
            </p>
          )}
        </section>

        <form onSubmit={onSubmit} className="eq-card mt-8 space-y-3 p-6">
          <h2 className="font-display text-xl text-white">
            Pilotschule werden
          </h2>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            placeholder="Ihr Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            placeholder="Schule"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            placeholder="Nachricht"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
            aria-hidden
          />
          <label className="flex items-start gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
              className="mt-1"
            />
            <span>
              Ich habe die{" "}
              <Link href="/datenschutz/" className="text-indigo-300 hover:underline">
                Datenschutzerklärung
              </Link>{" "}
              gelesen und willige in die Verarbeitung dieser Anfrage ein.
            </span>
          </label>
          {error && (
            <p className="text-sm text-amber-200">{error}</p>
          )}
          {status && (
            <p className="text-sm text-emerald-300">{status}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Senden…" : "Anfrage senden"}
          </button>
        </form>
        <SiteFooter className="mt-12" />
      </main>
    </div>
  );
}
