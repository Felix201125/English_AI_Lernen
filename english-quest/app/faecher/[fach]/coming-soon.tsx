import Link from "next/link";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/legal/site-footer";
import { NewsletterForm } from "@/components/landing/newsletter-form";
import type { CatalogSubject } from "@/lib/content/subject-catalog";

export function ComingSoonSubject({ subject }: { subject: CatalogSubject }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/faecher/" className="text-sm text-slate-400 hover:text-white">
          ← Fächer
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">
          {subject.title}
        </h1>
        <p className="mt-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100">
          Bald verfügbar
        </p>
        <p className="mt-4 text-slate-300">{subject.summary}</p>
        <p className="mt-2 text-sm text-slate-400">
          Tragen Sie sich ein, wenn Sie informiert werden möchten — ohne
          Terminversprechen.
        </p>
        <div className="mt-6">
          <NewsletterForm label="Neuigkeiten zu diesem Fach per E-Mail" />
        </div>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
