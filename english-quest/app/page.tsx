import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/legal/site-footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
              {BRAND.name}
            </p>
            <p className="text-sm text-slate-400">{BRAND.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:text-white"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
            >
              Registrieren
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-10 py-12 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
              Dein persönliches Lern-Game — für jedes Fach
            </h1>
            <p className="max-w-md text-slate-300">
              {BRAND.description} Englisch zuerst, weitere Fächer folgen.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 text-center font-semibold text-white shadow-lg shadow-indigo-500/30"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-white/15 px-6 py-4 text-center font-semibold text-white hover:bg-white/5"
              >
                Anmelden
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              Mit E-Mail oder Google — danach öffnet sich dein Schüler- oder
              Lehrer-Bereich.
            </p>
          </div>
          <div className="eq-card relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_50%)]" />
            <div className="relative space-y-4">
              <p className="font-display text-6xl font-bold text-indigo-300/80">Q</p>
              <p className="font-display text-xl text-white">
                Quests lernen. Ohne Druck.
              </p>
              <p className="text-slate-300">
                Der Lehrer steuert Live-Stunden. Solo lernst du wann du willst —
                Pause ist ok, Fortschritt bleibt.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Fachübergreifend gedacht — Start: Englisch</li>
                <li>• Live: Lehrer entscheidet</li>
                <li>• Solo: Lernen wenn du Bock hast</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="eq-card space-y-3 p-6 text-sm text-slate-300">
          <h2 className="font-display text-xl text-white">So funktioniert’s</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Registrieren (E-Mail oder Google)</li>
            <li>Interessen & kurzer Einstufungstest</li>
            <li>Quests spielen — Lehrer steuert Live-Stunden</li>
          </ol>
        </section>

        <SiteFooter className="pt-4" />
      </div>
    </main>
  );
}
