import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getSiteConfig } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";

export const metadata = buildPageMetadata({
  title: `Preise | ${BRAND.name}`,
  description: `Preise und Credits bei ${BRAND.name} — klar und ohne versteckte Kosten.`,
  path: "/preise/",
});

export default function PreisePage() {
  const site = getSiteConfig();

  if (site.pricingMode === "hidden") {
    return (
      <main className="mx-auto min-h-dvh max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← {BRAND.name}
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold text-white">
          Preise
        </h1>
        <p className="eq-card mt-6 p-6 text-sm text-slate-300">
          Die Preisübersicht wird veröffentlicht, sobald verbindliche Angaben
          hinterlegt sind.
        </p>
        <SiteFooter className="mt-8" />
      </main>
    );
  }

  const freeLaunch = site.pricingMode === "free_launch";

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← {BRAND.name}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Preise
      </h1>
      <p className="mt-2 text-slate-400">
        Transparent und kindgerecht — ohne Kreditkarte zum Start.
      </p>

      <div className="eq-card mt-6 space-y-4 p-6 text-sm text-slate-300">
        {freeLaunch ? (
          <>
            <p className="font-display text-xl text-white">
              Während der Startphase kostenlos
            </p>
            <p>
              Du kannst Quests spielen, den KI-Lernbegleiter nutzen und dich
              registrieren — ohne Zahlungsmittel.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-xl text-white">Aktuelle Preise</p>
            {site.priceLessonHint ? (
              <p>
                <strong className="text-white">Live-Stunden:</strong>{" "}
                {site.priceLessonHint}
              </p>
            ) : (
              <p>Live-Stunden: Angaben folgen vom Betreiber.</p>
            )}
            {site.priceCreditsHint ? (
              <p>
                <strong className="text-white">Credits:</strong>{" "}
                {site.priceCreditsHint}
              </p>
            ) : null}
          </>
        )}

        <h2 className="pt-2 font-display text-lg text-white">Was sind Credits?</h2>
        <p>
          Credits sind dein Guthaben für KI-Hilfe. Eine{" "}
          <strong className="text-white">kleine KI-Aufgabe</strong> (kurze
          Antwort, Hint) kostet wenig; eine{" "}
          <strong className="text-white">große KI-Aufgabe</strong> (längere
          Erklärung oder Arbeitsblatt) etwas mehr. Der Stand erscheint in deinem
          Konto.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/ausprobieren/"
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-center font-semibold text-white"
        >
          Jetzt ausprobieren – ohne Anmeldung
        </Link>
        <Link
          href="/register/"
          className="rounded-2xl border border-white/15 px-6 py-3 text-center font-semibold text-white hover:bg-white/5"
        >
          Kostenlos registrieren
        </Link>
      </div>
      <SiteFooter className="mt-8" />
    </main>
  );
}
