import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { GUIDES } from "@/lib/content/guides";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `Ratgeber | ${BRAND.name}`,
  description: `Artikel zu Lernen, Motivation und KI — ehrlich und ohne erfundene Studien.`,
  path: "/ratgeber/",
});

export default function RatgeberIndexPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">Ratgeber</h1>
        <ul className="mt-6 space-y-3">
          {GUIDES.map((g) => (
            <li key={g.slug} className="eq-card p-5">
              <Link
                href={`/ratgeber/${g.slug}/`}
                className="font-display text-xl text-white hover:text-indigo-200"
              >
                {g.title}
              </Link>
              <p className="mt-1 text-sm text-slate-400">{g.description}</p>
            </li>
          ))}
        </ul>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
