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
    description:
      "Allgemeine, vorsichtige Hinweise zu Lernmotivation in der Mittelstufe.",
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
      "Praktische Ideen, Vokabeln wiederholt und ohne Drill zu üben.",
    publishedAt: "2026-03-01",
    body: [
      "Wiederholung in kurzen Intervallen hilft oft mehr als lange Listen am Stück.",
      "Kombiniert Bild, Klang und eigenen Satz — so bleiben Wörter besser hängen.",
      "In Qestra kannst du Englisch-Quests spielen und später den Fortschritt speichern.",
    ],
  },
];

export function getGuide(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
