import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects";
import { getSiteConfig } from "@/lib/legal/config";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { SiteFooter } from "@/components/legal/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = buildPageMetadata({
  title: `Qestra – Lernen mit KI nach deinen Interessen | Klasse 5–10`,
  description:
    "Qestra macht Schulstoff zu Spielen und Quests rund um deine Interessen — mit KI-Lernbegleiter. Kostenlos starten, ohne Anmeldung ausprobieren.",
  path: "/",
});

const TRUST = ["Kostenlos", "Keine Kreditkarte", "DSGVO-konform"] as const;

export default function LandingPage() {
  const site = getSiteConfig();
  const showServerDe = Boolean(
    process.env.NEXT_PUBLIC_LEGAL_HOSTING_DE === "1" ||
      process.env.NEXT_PUBLIC_HOSTING_REGION === "DE"
  );
  const trustLine = showServerDe
    ? [...TRUST, "Server in Deutschland"]
    : [...TRUST];

  const subjects = Object.values(SUBJECTS);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,102,241,0.35),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(34,211,238,0.2),transparent_45%),linear-gradient(180deg,#0b1220_0%,#111827_60%,#0b1220_100%)]"
        aria-hidden
      />
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-14">
          <div className="space-y-5">
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
              Lernen, das zu deinen Interessen passt.
            </h1>
            <p className="max-w-xl text-base text-slate-300 md:text-lg">
              Qestra macht Schulstoff zu Spielen und Quests rund um das, was dich
              begeistert – mit einem KI-Lernbegleiter, der dir hilft statt Druck
              zu machen. Für Klasse 5 bis 10. Kostenlos starten.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/ausprobieren/"
                className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-indigo-500/40 transition hover:brightness-110"
              >
                Jetzt ausprobieren – ohne Anmeldung
              </Link>
              <Link
                href="/register/"
                className="rounded-2xl border border-white/20 px-6 py-4 text-center font-semibold text-white hover:bg-white/5"
              >
                Kostenlos registrieren
              </Link>
            </div>
            <p className="text-sm text-slate-400">{trustLine.join(" · ")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <UiCapture title="Quest" subtitle="Interessen → Aufgaben" accent="indigo" />
            <UiCapture title="XP & Abzeichen" subtitle="Fortschritt sichtbar" accent="amber" />
            <UiCapture title="KI-Chat" subtitle="Hilfe ohne Druck" accent="cyan" />
            <UiCapture title="Arbeitsblatt" subtitle="Für Lehrkräfte" accent="violet" />
          </div>
        </section>

        {/* So funktioniert's */}
        <section className="py-12">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            So funktioniert&apos;s
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Interessen wählen",
                d: "Fußball, Gaming, Musik und mehr — der Stoff kommt in deiner Welt an.",
              },
              {
                n: "2",
                t: "Quests spielen",
                d: "Kurze Aufgaben mit XP und Abzeichen. Pause ist ok — Fortschritt bleibt.",
              },
              {
                n: "3",
                t: "Fortschritt sehen",
                d: "Du und ggf. Eltern oder Lehrkraft sehen, was du gelernt hast.",
              },
            ].map((s) => (
              <li key={s.n} className="eq-card p-5">
                <p className="font-display text-3xl text-indigo-300">{s.n}</p>
                <p className="mt-2 font-semibold text-white">{s.t}</p>
                <p className="mt-1 text-sm text-slate-400">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Zielgruppen */}
        <section className="py-12">
          <h2 className="font-display text-2xl font-bold text-white">
            Für wen ist Qestra?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <AudienceCard
              title="Für Schüler:innen"
              text="Lerne mit Quests zu deinen Interessen und einem KI-Begleiter."
              href="/ausprobieren/"
              cta="Jetzt ausprobieren"
            />
            <AudienceCard
              title="Für Eltern"
              text="Überblick ohne Druck — Einwilligung unter 16, keine öffentlichen Profile."
              href="/eltern/"
              cta="Mehr für Eltern"
            />
            <AudienceCard
              title="Für Lehrkräfte & Schulen"
              text="Arbeitsblätter, Klassencode, Live-Stunden — Datenschutz mitgedacht."
              href="/lehrkraefte/"
              cta="Mehr für Lehrkräfte"
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Schulen:{" "}
            <Link href="/schulen/" className="text-indigo-300 hover:underline">
              Pilot werden
            </Link>
          </p>
        </section>

        {/* Fächer */}
        <section className="py-12">
          <h2 className="font-display text-2xl font-bold text-white">Fächer</h2>
          <p className="mt-2 text-slate-400">
            Englisch zuerst — Architektur für alle Fächer.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/faecher/${slugForSubject(s.id)}/`}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:border-indigo-400/40"
              >
                {s.labelDe}
                {s.status !== "active" ? " (folgt)" : ""}
              </Link>
            ))}
            <Link
              href="/faecher/deutsch/"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:border-indigo-400/40"
            >
              Deutsch (folgt)
            </Link>
          </div>
        </section>

        {/* Sicherheit */}
        <section className="eq-card my-8 space-y-3 p-6">
          <h2 className="font-display text-2xl font-bold text-white">
            Sicherheit & Datenschutz für Kinder
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Einwilligung der Eltern unter 16 (DSGVO Art. 8) in der Registrierung</li>
            <li>Keine öffentlichen Schülerprofile</li>
            <li>Gast-Probe ohne Namen und E-Mail</li>
            <li>Lehrkraft steuert Live-Stunden und Freigaben</li>
            {showServerDe && <li>Hosting-Standort Deutschland (wenn so betrieben)</li>}
          </ul>
          <Link href="/datenschutz/" className="text-sm text-indigo-300 hover:underline">
            Datenschutzerklärung
          </Link>
        </section>

        {/* Preise kurz */}
        {site.pricingMode !== "hidden" && (
          <section className="py-10">
            <h2 className="font-display text-2xl font-bold text-white">Preise</h2>
            <p className="mt-2 text-slate-300">
              {site.pricingMode === "free_launch"
                ? "Während der Startphase kostenlos — ohne Kreditkarte."
                : site.priceLessonHint ||
                  "Aktuelle Beträge findest du auf der Preisseite."}
            </p>
            <Link
              href="/preise/"
              className="mt-3 inline-block text-indigo-300 hover:underline"
            >
              Zur Preisseite
            </Link>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="py-12">
          <h2 className="font-display text-2xl font-bold text-white">FAQ</h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="eq-card group p-4 open:ring-1 open:ring-indigo-400/30"
              >
                <summary className="cursor-pointer list-none font-semibold text-white">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
          <FaqJsonLd />
        </section>

        {/* Abschluss */}
        <section className="py-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Bereit für die erste Quest?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-slate-400">
            In unter zwei Minuten ausprobieren — ohne Konto.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/ausprobieren/"
              className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-4 text-center font-bold text-white shadow-lg shadow-indigo-500/40 sm:w-auto"
            >
              Jetzt ausprobieren – ohne Anmeldung
            </Link>
            <Link
              href="/register/"
              className="w-full max-w-sm rounded-2xl border border-white/20 px-6 py-4 text-center font-semibold text-white hover:bg-white/5 sm:w-auto"
            >
              Kostenlos registrieren
            </Link>
          </div>
        </section>

        <SiteFooter className="pb-10" />
      </main>
    </div>
  );
}

function slugForSubject(id: string): string {
  if (id === "math") return "mathe";
  if (id === "english") return "englisch";
  if (id === "science") return "naturwissenschaften";
  if (id === "history") return "geschichte";
  return id;
}

function AudienceCard({
  title,
  text,
  href,
  cta,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="eq-card flex flex-col p-5">
      <h3 className="font-display text-lg text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-400">{text}</p>
      <Link
        href={href}
        className="mt-4 text-sm font-semibold text-indigo-300 hover:underline"
      >
        {cta} →
      </Link>
    </div>
  );
}

function UiCapture({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent: "indigo" | "amber" | "cyan" | "violet";
}) {
  const bar =
    accent === "indigo"
      ? "from-indigo-500/40"
      : accent === "amber"
        ? "from-amber-400/40"
        : accent === "cyan"
          ? "from-cyan-400/40"
          : "from-violet-400/40";
  return (
    <div className="eq-card relative overflow-hidden p-4">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bar} to-transparent`}
        aria-hidden
      />
      <div className="relative space-y-2">
        <div className="h-2 w-1/2 rounded bg-white/20" />
        <div className="h-16 rounded-lg border border-white/10 bg-black/30" />
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
