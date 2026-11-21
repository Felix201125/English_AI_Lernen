import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { getTopic, PUBLIC_SUBJECTS } from "@/lib/content/subjects";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TopicExercisePlayer } from "@/components/seo/topic-exercise";

export function generateStaticParams() {
  return PUBLIC_SUBJECTS.flatMap((s) =>
    s.topics.map((t) => ({ fach: s.slug, thema: t.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fach: string; thema: string }>;
}) {
  const { fach, thema } = await params;
  const hit = getTopic(fach, thema);
  if (!hit) return {};
  return buildPageMetadata({
    title: `${hit.topic.title} Klasse ${hit.topic.grade} | ${hit.subject.title} | ${BRAND.name}`,
    description: hit.topic.summary,
    path: `/faecher/${hit.subject.slug}/${hit.topic.slug}/`,
  });
}

export default async function ThemaPage({
  params,
}: {
  params: Promise<{ fach: string; thema: string }>;
}) {
  const { fach, thema } = await params;
  const hit = getTopic(fach, thema);
  if (!hit) notFound();
  const { subject, topic } = hit;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: topic.title,
    description: topic.summary,
    educationalLevel: `Klasse ${topic.grade}`,
    inLanguage: "de",
    provider: { "@type": "Organization", name: BRAND.name },
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href={`/faecher/${subject.slug}/`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← {subject.title}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">
          {topic.title} · Klasse {topic.grade}
        </h1>
        <p className="mt-2 text-slate-300">{topic.summary}</p>
        <div className="mt-6">
          <TopicExercisePlayer exercise={topic.exercise} />
        </div>
        <Link
          href="/ausprobieren/"
          className="mt-8 inline-block text-indigo-300 hover:underline"
        >
          Mehr Übungen in Qestra →
        </Link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
