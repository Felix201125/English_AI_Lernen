import type { ReactNode } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

function Fill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-amber-500/20 px-1 font-medium text-amber-100">
      【Vom Betreiber ausfüllen: {children}】
    </span>
  );
}

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
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-amber-50">
          Rechtliche Pflichtangaben — gelb markierte Felder bitte durch echte
          Daten ersetzen, bevor die Seite produktiv geht.
        </p>
        <p>
          <strong className="text-white">Angaben gemäß § 5 TMG</strong>
        </p>
        <p>
          <Fill>Name / Firma</Fill>
          <br />
          <Fill>Straße und Hausnummer</Fill>
          <br />
          <Fill>PLZ und Ort</Fill>
          <br />
          Deutschland
        </p>
        <p>
          E-Mail: <Fill>Kontakt-E-Mail</Fill>
          <br />
          Telefon: <Fill>Telefonnummer oder „nicht angegeben“</Fill>
        </p>
        <p>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:{" "}
          <Fill>Name und Anschrift</Fill>
        </p>
        <p>
          USt-IdNr. (falls vorhanden): <Fill>USt-IdNr. oder streichen</Fill>
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
