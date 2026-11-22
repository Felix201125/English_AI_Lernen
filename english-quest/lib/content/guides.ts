export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  body: string[];
};

export const GUIDES: GuideArticle[] = [
  {
    slug: "lernen-mit-ki-eltern",
    title: "Lernen mit KI – was Eltern wissen sollten",
    description:
      "Einordnung ohne Hype: Wozu KI beim Lernen helfen kann — und was sie nicht ersetzt.",
    publishedAt: "2026-03-01",
    body: [
      "KI kann Erklärungen und Übungen anbieten. Sie ersetzt weder Lehrkräfte noch Ihre Begleitung als Elternteil.",
      "Achten Sie darauf, dass das Kind keine persönlichen Daten in Chats eingibt und dass unter 16 Jahren eine Einwilligung vorliegt.",
      "Qestra speichert Lernfortschritt im Konto und bietet eine Probe ohne personenbezogene Daten.",
    ],
  },
  {
    slug: "motivation-7-klasse",
    title: "Motivation in der 7. Klasse",
    description: "Konkrete Tipps für den Lernalltag.",
    publishedAt: "2026-03-01",
    body: [
      "Viele Jugendliche brauchen kurze Erfolge und Themen, die an ihre Interessen anschließen.",
      "Druck und Strafen für Pausen sind oft kontraproduktiv. Besser: klare, erreichbare Mini-Ziele.",
      "Spiele und Quests können den Einstieg erleichtern — ohne den Anspruch, jede Lernsituation zu „gamifizieren“.",
    ],
  },
  {
    slug: "vokabeln-mit-spielen",
    title: "Vokabeln lernen mit Spielen",
    description:
      "Praktische Ideen, um Vokabeln wiederholt und ohne Drill zu üben.",
    publishedAt: "2026-03-01",
    body: [
      "Wiederholung in kurzen Intervallen hilft oft mehr als lange Listen am Stück.",
      "Kombiniert Bild, Klang und eigenen Satz — so bleiben Wörter besser hängen.",
      "In Qestra kannst du Englisch-Quests spielen und später den Fortschritt speichern.",
    ],
  },
  {
    slug: "lernpausen-sinnvoll",
    title: "Lernpausen sinnvoll nutzen",
    description: "Kurze Pausen ohne Schuldgefühl — was wirklich hilft.",
    publishedAt: "2026-03-15",
    body: [
      "Nach 20–30 Minuten konzentriertes Üben sinkt die Aufmerksamkeit bei vielen Kindern — eine kurze Pause ist normal.",
      "Bewegung, Wasser trinken oder ein kurzer Blick aus dem Fenster reicht oft; kein langes Scrollen nötig.",
      "Feste Mini-Ziele („diese drei Aufgaben“) machen den Wiedereinstieg leichter als ein offenes „weiterlernen“.",
    ],
  },
  {
    slug: "hausaufgaben-elternbegleitung",
    title: "Hausaufgaben begleiten ohne Druck",
    description: "Wie Eltern beim Nachfragen helfen, ohne alles vorzusagen.",
    publishedAt: "2026-03-15",
    body: [
      "Fragen wie „Was ist die erste Aufgabe?“ oder „Was hast du schon verstanden?“ öffnen mehr als sofortige Lösungen.",
      "Wenn es stockt: gemeinsam die Aufgabenstellung lesen, nicht den ganzen Satz vorsagen.",
      "Qestra kann Übungen ergänzen — ersetzt aber nicht die Rückmeldung aus der Klasse.",
    ],
  },
];

export function getGuide(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
