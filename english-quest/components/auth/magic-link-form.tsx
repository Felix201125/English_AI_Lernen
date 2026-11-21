"use client";

import { FormEvent, useState } from "react";
import { authInputClass } from "@/components/auth/auth-shell";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const base =
        process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "") ||
        `${window.location.origin}/api`;
      await fetch(`${base}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "magic_link_request", email }),
      });
      // Keine Account-Enumeration
      setMsg(
        "Falls ein Konto existiert, haben wir dir eine Mail geschickt."
      );
      setEmail("");
    } catch {
      setMsg(
        "Falls ein Konto existiert, haben wir dir eine Mail geschickt."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t border-white/10 pt-4">
      <p className="text-xs text-slate-500">Link zum Anmelden per E-Mail</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={authInputClass}
        placeholder="E-Mail"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl border border-white/15 py-2 text-sm text-white hover:bg-white/5"
      >
        Magic Link senden
      </button>
      {msg && <p className="text-xs text-slate-400">{msg}</p>}
    </form>
  );
}
