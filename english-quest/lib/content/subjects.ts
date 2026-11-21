export type TopicExercise = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type SubjectTopic = {
  slug: string;
  title: string;
  grade: number;
  summary: string;
  exercise: TopicExercise;
};

export type PublicSubject = {
  slug: string;
  title: string;
  summary: string;
  topics: SubjectTopic[];
};

export const PUBLIC_SUBJECTS: PublicSubject[] = [
  {
    slug: "mathe",
    title: "Mathematik",
    summary:
      "Prozente, Brüche und Größen — spielerisch und Schritt für Schritt.",
    topics: [
      {
        slug: "prozentrechnung-klasse-6",
        title: "Prozentrechnung",
        grade: 6,
        summary: "Anteile in Prozent umrechnen und im Alltag anwenden.",
        exercise: {
          prompt: "Wie viel Prozent sind 15 von 60?",
          options: ["15 %", "25 %", "40 %", "60 %"],
          correctIndex: 1,
          explanation: "15 ÷ 60 = 0,25 → 25 %.",
        },
      },
      {
        slug: "bruchrechnung-klasse-6",
        title: "Bruchrechnung",
        grade: 6,
        summary: "Brüche vergleichen und vereinfachen.",
        exercise: {
          prompt: "Welcher Bruch ist größer: 1/2 oder 2/5?",
          options: ["1/2", "2/5", "gleich groß", "nicht entscheidbar"],
          correctIndex: 0,
          explanation: "1/2 = 0,5 und 2/5 = 0,4 — also ist 1/2 größer.",
        },
      },
    ],
  },
  {
    slug: "deutsch",
    title: "Deutsch",
    summary: "Wortarten, Rechtschreibung und kurze Texte verstehen.",
    topics: [
      {
        slug: "wortarten-klasse-5",
        title: "Wortarten",
        grade: 5,
        summary: "Nomen, Verben und Adjektive unterscheiden.",
        exercise: {
          prompt: "Welches Wort ist ein Adjektiv? „Der schnelle Fuchs rennt.“",
          options: ["Fuchs", "rennt", "schnelle", "Der"],
          correctIndex: 2,
          explanation: "„schnelle“ beschreibt den Fuchs — Adjektiv.",
        },
      },
    ],
  },
  {
    slug: "englisch",
    title: "Englisch",
    summary: "Vokabeln und einfache Sätze — im Fach Englisch auf Englisch.",
    topics: [
      {
        slug: "vocabulary-klasse-5",
        title: "Everyday vocabulary",
        grade: 5,
        summary: "Basic words for school and free time.",
        exercise: {
          prompt: "What does „apple“ mean in German?",
          options: ["Banane", "Apfel", "Birne", "Traube"],
          correctIndex: 1,
          explanation: "apple = Apfel.",
        },
      },
    ],
  },
];

export function getSubject(slug: string): PublicSubject | undefined {
  return PUBLIC_SUBJECTS.find((s) => s.slug === slug);
}

export function getTopic(
  subjectSlug: string,
  topicSlug: string
): { subject: PublicSubject; topic: SubjectTopic } | undefined {
  const subject = getSubject(subjectSlug);
  if (!subject) return undefined;
  const topic = subject.topics.find((t) => t.slug === topicSlug);
  if (!topic) return undefined;
  return { subject, topic };
}
