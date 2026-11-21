"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ClassCodeEntry() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length < 3) {
      setMsg("Bitte einen gültigen Klassencode eingeben.");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("qestra.inviteCode", cleaned);
    }
    setMsg("Klassencode gespeichert — weiter zur Registrierung.");
    router.push(`/register/?class=${encodeURIComponent(cleaned)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="eq-card flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
    >
      <label className="flex-1 text-sm text-slate-300">
        Hast du einen Klassencode? Hier eingeben
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 uppercase text-white"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="z. B. KLASSE7A"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
      >
        Weiter
      </button>
      {msg && <p className="w-full text-sm text-emerald-300">{msg}</p>}
    </form>
  );
}
