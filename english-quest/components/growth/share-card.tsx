"use client";

import { useRef, useState } from "react";
import { BRAND } from "@/lib/brand";

/** Erfolgs-Karte: nur Vorname/Spitzname, XP, Badge — kein Nachname/Foto */
export function ShareCard({
  nickname,
  xp,
  badgeLabel,
}: {
  nickname: string;
  xp: number;
  badgeLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const probe =
    typeof window !== "undefined"
      ? `${window.location.origin}/ausprobieren/`
      : "/ausprobieren/";

  const shareText = `${nickname} hat ${xp} XP und „${badgeLabel}“ bei ${BRAND.name}. Schaffst du das auch? Probier Qestra aus: ${probe}`;

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="eq-card bg-gradient-to-br from-indigo-600/40 to-cyan-600/20 p-6 text-center"
      >
        <p className="font-display text-2xl font-bold text-white">{nickname}</p>
        <p className="mt-2 text-amber-200">{xp} XP</p>
        <p className="mt-1 text-emerald-200">Abzeichen: {badgeLabel}</p>
        <p className="mt-4 text-xs text-slate-400">{BRAND.name}</p>
      </div>
      <button
        type="button"
        className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareText);
            setMsg("Text zum Teilen kopiert.");
          } catch {
            setMsg(shareText);
          }
        }}
      >
        Teilen
      </button>
      {msg && <p className="text-xs text-slate-400">{msg}</p>}
    </div>
  );
}
