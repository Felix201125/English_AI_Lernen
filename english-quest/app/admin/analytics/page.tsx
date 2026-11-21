"use client";

import { FormEvent, useState } from "react";

export default function AdminAnalyticsPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const base =
        process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "") ||
        `${window.location.origin}/api`;
      const res = await fetch(`${base}/analytics.php`, {
        headers: { "X-Admin-Key": key },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Kein Zugriff");
      }
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Fehler");
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">
        Analyse-Trichter
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Nur mit Admin-Key aus der Server-Config. Aggregierte Zahlen, keine
        Kinderprofile.
      </p>
      <form onSubmit={load} className="eq-card mt-6 flex gap-2 p-4">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin-Key"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-500 px-4 py-2 font-semibold text-white"
        >
          Laden
        </button>
      </form>
      {error && <p className="mt-3 text-amber-200">{error}</p>}
      {data && (
        <pre className="eq-card mt-4 overflow-auto p-4 text-xs text-slate-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}
