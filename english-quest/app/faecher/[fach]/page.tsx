import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { getSubject, PUBLIC_SUBJECTS } from "@/lib/content/subjects";
import {
  getCatalogSubject,
  SUBJECT_CATALOG,
} from "@/lib/content/subject-catalog";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ComingSoonSubject } from "./coming-soon";

export function generateStaticParams() {
  return SUBJECT_CATALOG.map((s) => ({ fach: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fach: string }>;
}) {
  const { fach } = await params;
  const catalog = getCatalogSubject(fach);
  if (!catalog) return {};
  return buildPageMetadata({
    title: `${catalog.title} lernen | ${BRAND.name}`,
    description: catalog.summary,
    path: `/faecher/${catalog.slug}/`,
  });
}

export default async function FachPage({
  params,
}: {
  params: Promise<{ fach: string }>;
}) {
  const { fach } = await params;
  const catalog = getCatalogSubject(fach);
  if (!catalog) notFound();

  if (catalog.status === "bald") {
    return <ComingSoonSubject subject={catalog} />;
  }

  const subject = getSubject(fach) ?? {
    slug: catalog.slug,
    title: catalog.title,
    summary: catalog.summary,
    topics: [],
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/faecher/" className="text-sm text-slate-400 hover:text-white">
          ← Fächer
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">
          {subject.title}
        </h1>
        <p className="mt-2 text-slate-300">{subject.summary}</p>
        <ul className="mt-6 space-y-3">
          {subject.topics.map((t) => (
            <li key={t.slug} className="eq-card p-4">
              <Link
                href={`/faecher/${subject.slug}/${t.slug}/`}
                className="font-semibold text-indigo-200 hover:underline"
              >
                {t.title} · Klasse {t.grade}
              </Link>
              <p className="mt-1 text-sm text-slate-400">{t.summary}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/ausprobieren/"
          className="mt-8 inline-block rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 font-semibold text-white"
        >
          Mehr Übungen in Qestra
        </Link>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}

void PUBLIC_SUBJECTS;
