import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function DatenschutzPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← {BRAND.name}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Datenschutzerklärung
      </h1>
      <div className="eq-card mt-6 space-y-4 p-6 text-sm leading-relaxed text-slate-300">
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100">
          [Platzhalter — Inhalt vom Betreiber ergänzen / rechtlich prüfen]
        </p>
        <h2 className="font-display text-lg text-white">1. Verantwortlicher</h2>
        <p>[Name, Adresse, E-Mail — siehe Impressum]</p>

        <h2 className="font-display text-lg text-white">2. Zweck der Verarbeitung</h2>
        <p>
          {BRAND.name} verarbeitet Kontodaten und Lernfortschritt, um die
          Lernplattform bereitzustellen. Zielgruppe sind auch Minderjährige —
          wir arbeiten datensparsam (DSGVO, Art. 8 bei unter 16 Jahren).
        </p>

        <h2 className="font-display text-lg text-white">3. Drittanbieter</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Mistral AI</strong> — KI-Antworten /
            Lernunterstützung. Es können Anfragen und Lernkontext an Mistral
            übermittelt werden.
          </li>
          <li>
            <strong className="text-white">Daily.co</strong> — Video für
            Live-Stunden (Kamera/Mikrofon nur mit Einwilligung im Browser).
          </li>
          <li>
            <strong className="text-white">Google</strong> — optionaler Login
            über Google Identity Services (nur wenn du Google-Login nutzt).
          </li>
        </ul>

        <h2 className="font-display text-lg text-white">4. Speicherdauer & Rechte</h2>
        <p>
          Kontodaten bleiben, bis du dein Konto löschst. Du hast Rechte auf
          Auskunft, Berichtigung, Löschung und Beschwerde bei einer
          Aufsichtsbehörde.
        </p>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        <Link href="/impressum" className="text-indigo-300 hover:underline">
          Impressum
        </Link>
      </p>
    </main>
  );
}
