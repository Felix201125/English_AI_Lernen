import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getLegalConfig, legalIsComplete } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `Kontakt | ${BRAND.name}`,
  description: `Kontakt zu ${BRAND.name}.`,
  path: "/kontakt/",
});

export default function KontaktPage() {
  const legal = getLegalConfig();
  const email = legalIsComplete(legal) ? legal.email : "";

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">Kontakt</h1>
        <div className="eq-card mt-6 space-y-3 p-6 text-sm text-slate-300">
          {email ? (
            <p>
              E-Mail:{" "}
              <a className="text-indigo-300 hover:underline" href={`mailto:${email}`}>
                {email}
              </a>
            </p>
          ) : (
            <p>
              Die Kontaktadresse erscheint hier, sobald die Betreiberangaben
              hinterlegt sind. Bis dahin nutze bitte das Impressum.
            </p>
          )}
          <Link href="/impressum/" className="text-indigo-300 hover:underline">
            Zum Impressum
          </Link>
        </div>
        <SiteFooter className="mt-10" />
      </main>
    </div>
  );
}
