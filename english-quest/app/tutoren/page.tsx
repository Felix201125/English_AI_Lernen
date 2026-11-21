import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";

export const metadata = buildPageMetadata({
  title: `Lehrkräfte finden | ${BRAND.name}`,
  description: `Finde Lehrkräfte auf ${BRAND.name} oder bewirb dich selbst.`,
  path: "/tutoren/",
});

/**
 * Öffentliche Tutoren-Seite: keine Seed-/Demo-Profile.
 * Echte Profile kommen später aus der API — bis dahin ehrlicher Recruiting-Block.
 */
export default function TutorenPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← {BRAND.name}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Lehrkräfte
      </h1>
      <p className="mt-2 text-slate-400">
        Live-Stunden mit echten Lehrkräften — sicher und DSGVO-bewusst.
      </p>

      <div className="eq-card mt-6 space-y-4 p-6 text-sm text-slate-300">
        <p className="font-display text-xl text-white">
          Wir suchen gerade die ersten Lehrkräfte
        </p>
        <p>
          Sobald Lehrkräfte freigeschaltet sind, erscheinen sie hier. Bis dahin
          kannst du die Probe für Schüler:innen nutzen oder dich als Lehrkraft
          registrieren.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register/?role=teacher"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-center font-semibold text-white"
          >
            Jetzt als Lehrkraft bewerben
          </Link>
          <Link
            href="/lehrkraefte/"
            className="rounded-2xl border border-white/15 px-6 py-3 text-center font-semibold text-white hover:bg-white/5"
          >
            Mehr für Lehrkräfte
          </Link>
        </div>
      </div>
      <SiteFooter className="mt-8" />
    </main>
  );
}
