import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function ImpressumPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← {BRAND.name}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Impressum
      </h1>
      <div className="eq-card mt-6 space-y-4 p-6 text-sm text-slate-300">
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100">
          [Platzhalter — Inhalt vom Betreiber ergänzen]
        </p>
        <p>
          <strong className="text-white">Angaben gemäß § 5 TMG</strong>
        </p>
        <p>
          Name / Firma
          <br />
          Straße, Hausnummer
          <br />
          PLZ Ort
          <br />
          Deutschland
        </p>
        <p>
          E-Mail: kontakt@example.com
          <br />
          Telefon: [Platzhalter]
        </p>
        <p>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: [Platzhalter]
        </p>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        <Link href="/datenschutz" className="text-indigo-300 hover:underline">
          Datenschutz
        </Link>
      </p>
    </main>
  );
}
