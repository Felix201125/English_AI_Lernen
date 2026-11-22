"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function NewsletterForm({
  list = "news",
  label = "Neuigkeiten & Start-Infos per E-Mail",
}: {
  list?: "news" | "teacher_pack";
  label?: string;
}) {
  const [email, setEmail] = useState("");
  const [honey, setHoney] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honey) {
      setMsg("Danke — bitte E-Mail bestätigen, falls eine Nachricht ankommt.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const base =
        process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "") ||
        `${window.location.origin}/api`;
      const res = await fetch(`${base}/newsletter.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", email, list, website: honey }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Anmeldung fehlgeschlagen.");
      }
      setMsg(
        data.message ||
          "Falls die Adresse gültig ist, senden wir eine Bestätigung (Double-Opt-in)."
      );
      setEmail("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="eq-card space-y-3 p-5">
      <p className="text-sm font-medium text-white">{label}</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-Mail"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
      />
      <input
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        aria-hidden
      />
      <p className="text-xs text-slate-500">
        Mit Anmeldung akzeptieren Sie die{" "}
        <Link href="/datenschutz/" className="text-indigo-300 hover:underline">
          Datenschutzerklärung
        </Link>
        . Abmeldung jederzeit.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
      >
        Eintragen
      </button>
      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </form>
  );
}
