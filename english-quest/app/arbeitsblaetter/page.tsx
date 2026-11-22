import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { GALLERY } from "@/lib/content/worksheets-gallery";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `Arbeitsblatt-Galerie | ${BRAND.name}`,
  description: `Geprüfte Arbeitsblätter zum Download — erstellt mit ${BRAND.name}.`,
  path: "/arbeitsblaetter/",
});

export default function ArbeitsblaetterPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Arbeitsblatt-Galerie
        </h1>
        <p className="mt-2 text-slate-400">
          Kuratierte Blätter — frei nutzbar, Fußzeile „Erstellt mit Qestra“.
        </p>
        <ul className="mt-6 space-y-3">
          {GALLERY.map((w) => (
            <li key={w.id} className="eq-card p-4">
              <Link
                href={`/arbeitsblaetter/${w.id}/`}
                className="font-semibold text-white hover:text-indigo-200"
              >
                {w.title}
              </Link>
              <p className="text-sm text-slate-400">
                {w.subjectLabel} · Klasse {w.grade} · {w.topic}
              </p>
            </li>
          ))}
        </ul>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
