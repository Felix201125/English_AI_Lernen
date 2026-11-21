import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getLegalConfig, legalIsComplete } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";

export const metadata = buildPageMetadata({
  title: `Datenschutz | ${BRAND.name}`,
  description: `Datenschutzerklärung von ${BRAND.name} — DSGVO, Eltern-Einwilligung unter 16.`,
  path: "/datenschutz/",
});

export default function DatenschutzPage() {
  const legal = getLegalConfig();
  const complete = legalIsComplete(legal);

  return (
    <main className="mx-auto min-h-dvh min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← {BRAND.name}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">
        Datenschutzerklärung
      </h1>
      <div className="eq-card mt-6 space-y-4 p-6 text-sm leading-relaxed text-slate-300">
        <h2 className="font-display text-lg text-white">1. Verantwortlicher</h2>
        {complete ? (
          <p>
            {legal.operatorName}
            <br />
            {legal.street}, {legal.zipCity}
            <br />
            E-Mail:{" "}
            <a className="text-indigo-300 hover:underline" href={`mailto:${legal.email}`}>
              {legal.email}
            </a>
          </p>
        ) : (
          <p>Siehe Impressum — Angaben folgen, sobald hinterlegt.</p>
        )}

        <h2 className="font-display text-lg text-white">
          2. Zwecke und Rechtsgrundlagen
        </h2>
        <p>
          {BRAND.name} verarbeitet Kontodaten, Lernfortschritt, Nachrichten in
          der Plattform und ggf. Videodaten, um Lernen und Unterricht
          bereitzustellen. Rechtsgrundlagen u. a. Art. 6 Abs. 1 lit. b DSGVO
          (Vertrag) und lit. f (sicherer Betrieb). Bei Nutzerinnen und Nutzern
          unter 16 Jahren ist die Einwilligung der Erziehungsberechtigten nach
          Art. 8 DSGVO erforderlich — der Ablauf ist in der Registrierung
          umgesetzt (Zustimmung / Eltern-Einladung).
        </p>

        <h2 className="font-display text-lg text-white">3. Datenkategorien</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Konto: Name, E-Mail, Rolle, Passwort-Hash bzw. Google-Subjekt</li>
          <li>Lernstand: XP, Aktivitäten, Interessen, Fachwahl</li>
          <li>Kommunikation in der App (Lehrkraft ↔ Schüler)</li>
          <li>Buchungen und Termine</li>
          <li>Technische Logs (Fehler, Sicherheit)</li>
          <li>
            Gast-Probe: nur Session-Token und gehashte IP für Rate-Limits — keine
            Namen oder E-Mails
          </li>
        </ul>

        <h2 className="font-display text-lg text-white">4. Auftragsverarbeiter</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Hetzner</strong> — Hosting (soweit
            genutzt)
          </li>
          <li>
            <strong className="text-white">Mistral AI</strong> — KI-Antworten;
            Anfragen können Lernkontext enthalten
          </li>
          <li>
            <strong className="text-white">Daily.co</strong> — Video für
            Live-Stunden (Kamera/Mikrofon nur mit Browser-Einwilligung)
          </li>
          <li>
            <strong className="text-white">Google</strong> — optionaler Login
            (nur bei Nutzung von Google-Anmeldung)
          </li>
        </ul>

        <h2 className="font-display text-lg text-white">5. Speicherdauer</h2>
        <p>
          Kontodaten bis zur Löschung des Kontos. Gast-Sessions verfallen nach
          wenigen Tagen. Logs werden nur so lange wie für Sicherheit nötig
          behalten.
        </p>

        <h2 className="font-display text-lg text-white">6. Betroffenenrechte</h2>
        <p>
          Du hast Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung,
          Datenübertragbarkeit und Widerspruch sowie Beschwerde bei einer
          Aufsichtsbehörde. Konten können in den Einstellungen gelöscht werden.
        </p>

        <h2 className="font-display text-lg text-white">
          7. Minderjährige & Eltern
        </h2>
        <p>
          Unter 16 Jahren ist die Einwilligung der Erziehungsberechtigten nötig.
          Es gibt keine öffentlichen Schülerprofile und keinen Zugriff auf
          Kontaktlisten des Geräts.
        </p>
      </div>
      <SiteFooter className="mt-8" />
    </main>
  );
}
