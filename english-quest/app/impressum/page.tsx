import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getLegalConfig, legalIsComplete } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";

export const metadata = buildPageMetadata({
  title: `Impressum | ${BRAND.name}`,
  description: `Impressum und Anbieterkennzeichnung von ${BRAND.name}.`,
  path: "/impressum/",
});

export default function ImpressumPage() {
  const legal = getLegalConfig();
  const complete = legalIsComplete(legal);

  return (
    <main className="mx-auto min-h-dvh min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← {BRAND.name}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Impressum
      </h1>
      <div className="eq-card mt-6 space-y-4 p-6 text-sm text-slate-300">
        {complete ? (
          <>
            <p>
              <strong className="text-white">Angaben gemäß § 5 DDG</strong>
            </p>
            <p>
              {legal.operatorName}
              <br />
              {legal.street}
              <br />
              {legal.zipCity}
              <br />
              {legal.country}
            </p>
            <p>
              E-Mail:{" "}
              <a
                className="text-indigo-300 hover:underline"
                href={`mailto:${legal.email}`}
              >
                {legal.email}
              </a>
              {legal.phone ? (
                <>
                  <br />
                  Telefon: {legal.phone}
                </>
              ) : null}
            </p>
            <p>Verantwortlich für den Inhalt: {legal.responsiblePerson}</p>
            {(legal.registerCourt || legal.registerNumber) && (
              <p>
                Register: {legal.registerCourt} {legal.registerNumber}
              </p>
            )}
            {legal.vatId && <p>USt-IdNr.: {legal.vatId}</p>}
          </>
        ) : (
          process.env.NODE_ENV !== "production" && (
            <p className="sr-only" data-dev-legal-incomplete="1">
              Legal config incomplete (dev only)
            </p>
          )
        )}
      </div>
      <SiteFooter className="mt-8" />
    </main>
  );
}
