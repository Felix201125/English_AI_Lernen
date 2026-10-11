"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Mic, Volume2 } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

/**
 * Dedicated child experience for Noah: huge targets, hold-to-speak,
 * picture-first navigation, no writing required.
 */
export function ChildHomeExtras() {
  const { isChildMode, recordVoiceRequest, games, activeStudent } = useApp();
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isChildMode) return null;

  const spaceGame = games.find(
    (g) =>
      g.studentId === activeStudent.studentId &&
      ["released", "active", "approved"].includes(g.status)
  );

  async function startHold() {
    setListening(true);
    holdTimer.current = setTimeout(async () => {
      const msg = await recordVoiceRequest();
      setListening(false);
      setResult(
        `Ich habe gehört: “${msg.transcriptDe}”. Dein Lehrer bekommt das auf Englisch.`
      );
    }, 1000);
  }

  function endHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setListening(false);
  }

  return (
    <section className="eq-card space-y-4 border-cyan-400/20 p-6">
      <h2 className="font-display text-2xl text-white">Für dich zum Tippen & Sprechen</h2>
      <p className="text-slate-300">Du musst nichts schreiben. Drücke den großen Knopf.</p>
      <button
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        className={`mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-xl shadow-cyan-500/30 ${
          listening ? "scale-110 animate-pulse-soft" : ""
        }`}
      >
        <Mic className="h-12 w-12" />
        <span className="mt-2 text-sm font-semibold">
          {listening ? "Hört zu…" : "Halte mich"}
        </span>
      </button>
      {result && (
        <p className="rounded-2xl bg-cyan-500/10 p-4 text-center text-cyan-50">
          {result}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="rounded-2xl bg-black/30 p-6 text-4xl">
          <Volume2 className="mx-auto mb-2" /> Hör zu
        </button>
        {spaceGame ? (
          <Link
            href={`/student/activity/${spaceGame.id}`}
            className="rounded-2xl bg-black/30 p-6 text-center text-4xl"
          >
            🚀 Bilderspiel
          </Link>
        ) : (
          <div className="rounded-2xl bg-black/30 p-6 text-center text-slate-400">
            Warte auf Lehrer
          </div>
        )}
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => recordVoiceRequest()}
      >
        Schnell: Was als Nächstes?
      </Button>
    </section>
  );
}
