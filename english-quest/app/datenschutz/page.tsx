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
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-amber-50">
          Struktur vollständig vorbereitet. Gelb markierte Stellen und die
          rechtliche Endfassung muss der Betreiber ergänzen und prüfen lassen.
        </p>

        <h2 className="font-display text-lg text-white">1. Verantwortlicher</h2>
        <p>
          <Fill>Name, Anschrift, E-Mail — wie Impressum</Fill>
        </p>

        <h2 className="font-display text-lg text-white">
          2. Zwecke und Rechtsgrundlagen
        </h2>
        <p>
          {BRAND.name} verarbeitet Kontodaten, Lernfortschritt, Nachrichten
          innerhalb der Plattform und ggf. Videodaten, um Lernen und
          Lehrer-Steuerung bereitzustellen. Rechtsgrundlagen u. a. Art. 6 Abs. 1
          lit. b DSGVO (Vertrag) und lit. f (berechtigtes Interesse an sicherem
          Betrieb). Bei Minderjährigen unter 16: Einwilligung der
          Erziehungsberechtigten (Art. 8 DSGVO) —{" "}
          <Fill>Prozess Elternzustimmung beschreiben</Fill>.
        </p>

        <h2 className="font-display text-lg text-white">3. Datenkategorien</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Konto: Name, E-Mail, Rolle, Passwort-Hash</li>
          <li>Lernstand: XP, Aktivitäten, Interessen, Fachwahl</li>
          <li>Kommunikation: Nachrichten Lehrkraft ↔ Schüler (in der App)</li>
          <li>Buchungen und Termine</li>
          <li>Technische Logs (Fehler, Sicherheit)</li>
        </ul>

        <h2 className="font-display text-lg text-white">4. Drittanbieter</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Mistral AI</strong> — KI-Antworten;
            Anfragen können Lernkontext enthalten.
          </li>
          <li>
            <strong className="text-white">Daily.co</strong> — Video für
            Live-Stunden (Kamera/Mikrofon nur mit Browser-Einwilligung).
          </li>
          <li>
            <strong className="text-white">Google</strong> — optionaler Login
            (nur bei Nutzung von Google-Anmeldung).
          </li>
          <li>
            <strong className="text-white">Hosting</strong> —{" "}
            <Fill>Hoster / Standort (z. B. Deutschland/EU)</Fill>
          </li>
        </ul>

        <h2 className="font-display text-lg text-white">5. Speicherdauer</h2>
        <p>
          Kontodaten bis zur Löschung des Kontos. Lern- und Buchungsdaten:{" "}
          <Fill>Aufbewahrungsfristen festlegen</Fill>. Logs:{" "}
          <Fill>z. B. 30–90 Tage</Fill>.
        </p>

        <h2 className="font-display text-lg text-white">6. Rechte</h2>
        <p>
          Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit,
          Widerspruch und Beschwerde bei einer Aufsichtsbehörde. Kontakt:{" "}
          <Fill>Datenschutz-Kontakt</Fill>.
        </p>

        <h2 className="font-display text-lg text-white">7. Minderjährige</h2>
        <p>
          Kommunikation nur innerhalb von {BRAND.name}. Keine Telefonnummern
          oder privaten Kontaktdaten zwischen Schüler und Lehrkraft. Elternzugang
          ist vorgesehen — <Fill>Details Elternportal</Fill>.
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
