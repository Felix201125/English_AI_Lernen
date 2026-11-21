"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { makeInviteCode } from "@/lib/growth/invites";

export default function StudentInvitePage() {
  const { authUser } = useApp();
  const code = useMemo(
    () => makeInviteCode(authUser?.id || "guest"),
    [authUser?.id]
  );
  const [copied, setCopied] = useState(false);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://qestra.local";
  const link = `${origin}/register/?invite=${encodeURIComponent(code)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(
    `Probier Qestra mit mir aus: ${link}`
  )}`;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        Freunde einladen
      </h1>
      <p className="text-slate-300">
        Teile deinen Link. Nachnamen und Fotos erscheinen nicht auf Erfolgs-Karten.
      </p>
      <div className="eq-card space-y-3 p-5">
        <p className="text-sm text-slate-400">Dein Code</p>
        <p className="font-display text-2xl text-indigo-200">{code}</p>
        <p className="break-all text-sm text-slate-400">{link}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="rounded-xl bg-indigo-500 px-4 py-2 font-semibold text-white"
            onClick={async () => {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Kopiert!" : "Link kopieren"}
          </button>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/15 px-4 py-2 text-center text-white hover:bg-white/5"
          >
            Per WhatsApp teilen
          </a>
        </div>
      </div>
    </div>
  );
}
