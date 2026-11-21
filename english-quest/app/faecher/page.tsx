import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PUBLIC_SUBJECTS } from "@/lib/content/subjects";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `Fächer | ${BRAND.name}`,
  description: `Fächer auf ${BRAND.name}: Mathe, Deutsch, Englisch und mehr.`,
  path: "/faecher/",
});

export default function FaecherIndexPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">Fächer</h1>
        <ul className="mt-6 space-y-3">
          {PUBLIC_SUBJECTS.map((s) => (
            <li key={s.slug} className="eq-card p-5">
              <Link
                href={`/faecher/${s.slug}/`}
                className="font-display text-xl text-white hover:text-indigo-200"
              >
                {s.title}
              </Link>
              <p className="mt-1 text-sm text-slate-400">{s.summary}</p>
            </li>
          ))}
        </ul>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
