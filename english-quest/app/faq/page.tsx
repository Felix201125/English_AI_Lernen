import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `FAQ | ${BRAND.name}`,
  description: `Häufige Fragen zu ${BRAND.name}: Kosten, Alter, Datenschutz, Fächer und Start.`,
  path: "/faq/",
});

export default function FaqPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">FAQ</h1>
        <div className="mt-6 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="eq-card p-4">
              <summary className="cursor-pointer font-semibold text-white">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-slate-300">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-400">
          <Link href="/ausprobieren/" className="text-indigo-300 hover:underline">
            Jetzt ausprobieren
          </Link>
        </p>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
