import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { GALLERY, getGalleryItem } from "@/lib/content/worksheets-gallery";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export function generateStaticParams() {
  return GALLERY.map((w) => ({ id: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getGalleryItem(id);
  if (!item) return {};
  return buildPageMetadata({
    title: `${item.title} | ${BRAND.name}`,
    description: `${item.topic}, Klasse ${item.grade}`,
    path: `/arbeitsblaetter/${item.id}/`,
  });
}

export default async function WorksheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getGalleryItem(id);
  if (!item) notFound();

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/arbeitsblaetter/"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Galerie
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">
          {item.title}
        </h1>
        <div
          className="eq-card prose prose-invert mt-6 max-w-none p-6 text-slate-200"
          dangerouslySetInnerHTML={{ __html: item.html }}
        />
        <Link
          href="/lehrkraefte/"
          className="mt-6 inline-block text-sm text-indigo-300 hover:underline"
        >
          Eigenes Arbeitsblatt mit Qestra erstellen →
        </Link>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
