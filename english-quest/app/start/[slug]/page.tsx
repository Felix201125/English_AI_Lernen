import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { BRAND } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/legal/site-footer";

type Campaign = {
  slug: string;
  title: string;
  headline: string;
  body: string;
  image?: string;
  cta?: string;
  noindex?: boolean;
};

function loadCampaigns(): Campaign[] {
  const dir = path.join(process.cwd(), "content", "campaigns");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Campaign);
}

export function generateStaticParams() {
  return loadCampaigns().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = loadCampaigns().find((x) => x.slug === slug);
  if (!c) return {};
  const meta = buildPageMetadata({
    title: `${c.title} | ${BRAND.name}`,
    description: c.body,
    path: `/start/${c.slug}/`,
  });
  if (c.noindex) {
    meta.robots = { index: false, follow: false };
  }
  return meta;
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = loadCampaigns().find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-white">
          {c.headline}
        </h1>
        <p className="mt-4 text-slate-300">{c.body}</p>
        <Link
          href={`/ausprobieren/?utm_source=campaign&utm_campaign=${encodeURIComponent(c.slug)}`}
          className="mt-8 inline-block rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-4 font-bold text-white"
        >
          {c.cta || "Jetzt ausprobieren"}
        </Link>
        <SiteFooter className="mt-12" />
      </main>
    </div>
  );
}
