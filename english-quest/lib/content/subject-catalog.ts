/**
 * Einzige Fach-Quelle für Landing, /faecher/, Sitemap, Bald-verfügbar.
 */
export type SubjectStatus = "verfuegbar" | "bald";

export type CatalogSubject = {
  slug: string;
  title: string;
  status: SubjectStatus;
  summary: string;
};

export const SUBJECT_CATALOG: CatalogSubject[] = [
  {
    slug: "mathe",
    title: "Mathematik",
    status: "verfuegbar",
    summary: "Prozente, Brüche und Größen — spielerisch und Schritt für Schritt.",
  },
  {
    slug: "deutsch",
    title: "Deutsch",
    status: "verfuegbar",
    summary: "Wortarten, Rechtschreibung und kurze Texte verstehen.",
  },
  {
    slug: "englisch",
    title: "Englisch",
    status: "verfuegbar",
    summary: "Im Fach Englisch übst du die Aufgaben auf Englisch.",
  },
  {
    slug: "naturwissenschaften",
    title: "Naturwissenschaften",
    status: "bald",
    summary: "Naturphänomene verstehen und erklären — bald in Qestra.",
  },
  {
    slug: "geschichte",
    title: "Geschichte",
    status: "bald",
    summary: "Epochen und Zusammenhänge — bald in Qestra.",
  },
  {
    slug: "language",
    title: "Weitere Sprachen",
    status: "bald",
    summary: "Weitere Fremdsprachen — bald in Qestra.",
  },
];

export function getCatalogSubject(slug: string): CatalogSubject | undefined {
  return SUBJECT_CATALOG.find((s) => s.slug === slug);
}

export function availableSubjects(): CatalogSubject[] {
  return SUBJECT_CATALOG.filter((s) => s.status === "verfuegbar");
}

export function comingSoonSubjects(): CatalogSubject[] {
  return SUBJECT_CATALOG.filter((s) => s.status === "bald");
}

/** Feature-Flag Marktplatz — Default aus */
export function isTutorMarketplaceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_TUTOR_MARKETPLACE === "1";
}
