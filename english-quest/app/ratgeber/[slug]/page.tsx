import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { getGuide, GUIDES } from "@/lib/content/guides";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return buildPageMetadata({
    title: `${guide.title} | ${BRAND.name}`,
    description: guide.description,
    path: `/ratgeber/${guide.slug}/`,
  });
}

export default async function RatgeberArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/ratgeber/" className="text-sm text-slate-400 hover:text-white">
          ← Ratgeber
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">
          {guide.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{guide.publishedAt}</p>
        <div className="mt-6 space-y-4 text-slate-300">
          {guide.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
