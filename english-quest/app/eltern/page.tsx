import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `Für Eltern | ${BRAND.name}`,
  description: `So begleiten Sie Ihr Kind mit ${BRAND.name} — Überblick ohne Druck, DSGVO Art. 8.`,
  path: "/eltern/",
});

export default function ElternPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Für Eltern
        </h1>
        <p className="mt-3 text-slate-300">
          Sie behalten den Überblick — ohne Suchtmechaniken und ohne öffentliche
          Profile Ihres Kindes.
        </p>

        <section className="eq-card mt-8 space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
            Beispielansicht (Testdaten, kein echtes Kind)
          </p>
          <h2 className="font-display text-xl text-white">
            Wochenübersicht — Beispielkind
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Mo: Mathe-Quest Prozente · 25 Min.</li>
            <li>Mi: Deutsch Wortarten · 15 Min.</li>
            <li>Fr: Englisch Vokabeln · 20 Min.</li>
          </ul>
          <p className="text-sm text-slate-400">
            Gelernte Themen (Beispiel): Prozente, Adjektive, Everyday English.
            Lernzeit gesamt diese Woche: ca. 60 Minuten.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-slate-300">
          <h2 className="font-display text-xl text-white">Warum Eltern vertrauen können</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Einwilligung unter 16 Jahren (DSGVO Art. 8)</li>
            <li>Keine öffentlichen Schülerprofile</li>
            <li>Gast-Probe ohne personenbezogene Daten</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register/?role=parent"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 text-center font-semibold text-white"
          >
            Kind anmelden
          </Link>
          <Link
            href="/register/?role=parent&invite=1"
            className="rounded-2xl border border-white/15 px-6 py-3 text-center font-semibold text-white hover:bg-white/5"
          >
            Einladung vom Kind annehmen
          </Link>
        </div>
        <SiteFooter className="mt-12" />
      </main>
    </div>
  );
}
