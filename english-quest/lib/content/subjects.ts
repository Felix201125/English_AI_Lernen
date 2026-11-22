export type TopicExercise = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TopicReviewStatus = "needs_operator_review" | "reviewed";

export type SubjectTopic = {
  slug: string;
  title: string;
  grade: number;
  summary: string;
  exercise: TopicExercise;
  review_status?: TopicReviewStatus;
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
        slug: "natuerliche-zahlen-klasse-5",
        title: "Natürliche Zahlen",
        grade: 5,
        summary: "Große Zahlen lesen, schreiben und runden.",
        review_status: "reviewed",
        exercise: {
          prompt: "Runde 3 847 auf die nächsten Hunderter.",
          options: ["3 800", "3 850", "3 900", "4 000"],
          correctIndex: 0,
          explanation: "Die Zehnerstelle ist 4 (< 5), also bleiben die Hunderter bei 3 800.",
        },
      },
      {
        slug: "dezimalzahlen-klasse-5",
        title: "Dezimalzahlen",
        grade: 5,
        summary: "Kommazahlen vergleichen und im Alltag nutzen.",
        review_status: "reviewed",
        exercise: {
          prompt: "Was ist größer: 2,45 oder 2,5?",
          options: ["2,45", "2,5", "gleich groß", "nicht vergleichbar"],
          correctIndex: 1,
          explanation: "2,5 = 2,50 — damit ist 2,5 größer als 2,45.",
        },
      },
      {
        slug: "bruchrechnung-klasse-6",
        title: "Bruchrechnung",
        grade: 6,
        summary: "Brüche vergleichen und vereinfachen.",
        review_status: "reviewed",
        exercise: {
          prompt: "Welcher Bruch ist größer: 1/2 oder 2/5?",
          options: ["1/2", "2/5", "gleich groß", "nicht entscheidbar"],
          correctIndex: 0,
          explanation: "1/2 = 0,5 und 2/5 = 0,4 — also ist 1/2 größer.",
        },
      },
      {
        slug: "prozentrechnung-klasse-6",
        title: "Prozentrechnung",
        grade: 6,
        summary: "Anteile in Prozent umrechnen und im Alltag anwenden.",
        review_status: "reviewed",
        exercise: {
          prompt: "Wie viel Prozent sind 15 von 60?",
          options: ["15 %", "25 %", "40 %", "60 %"],
          correctIndex: 1,
          explanation: "15 ÷ 60 = 0,25 → 25 %.",
        },
      },
      {
        slug: "geometrie-winkel-klasse-7",
        title: "Winkel messen",
        grade: 7,
        summary: "Scharfe, stumpfe und rechte Winkel erkennen.",
        review_status: "reviewed",
        exercise: {
          prompt: "Ein Winkel misst 90°. Wie heißt er?",
          options: ["spitzer Winkel", "stumpfer Winkel", "rechter Winkel", "gestreckter Winkel"],
          correctIndex: 2,
          explanation: "90° ist ein rechter Winkel — wie an einer Tischkante.",
        },
      },
      {
        slug: "gleichungen-klasse-8",
        title: "Lineare Gleichungen",
        grade: 8,
        summary: "Einfache Gleichungen mit einer Unbekannten lösen.",
        review_status: "needs_operator_review",
        exercise: {
          prompt: "Löse: x + 7 = 19",
          options: ["x = 10", "x = 12", "x = 26", "x = 7"],
          correctIndex: 1,
          explanation: "19 − 7 = 12, also x = 12.",
        },
      },
      {
        slug: "lineare-funktionen-klasse-9",
        title: "Lineare Funktionen",
        grade: 9,
        summary: "Steigung und y-Achsenabschnitt im Koordinatensystem.",
        review_status: "reviewed",
        exercise: {
          prompt: "Bei y = 2x + 3: Wie groß ist der y-Achsenabschnitt?",
          options: ["2", "3", "5", "x"],
          correctIndex: 1,
          explanation: "In y = mx + b ist b = 3 der y-Achsenabschnitt.",
        },
      },
      {
        slug: "wahrscheinlichkeit-klasse-10",
        title: "Wahrscheinlichkeit",
        grade: 10,
        summary: "Zufallsexperimente und relative Häufigkeit.",
        review_status: "reviewed",
        exercise: {
          prompt: "Ein Würfel ist fair. Wie groß ist P(gerade Zahl)?",
          options: ["1/6", "1/3", "1/2", "2/3"],
          correctIndex: 2,
          explanation: "Gerade: 2, 4, 6 — drei von sechs Möglichkeiten → 1/2.",
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
        review_status: "reviewed",
        exercise: {
          prompt: "Welches Wort ist ein Adjektiv? „Der schnelle Fuchs rennt.“",
          options: ["Fuchs", "rennt", "schnelle", "Der"],
          correctIndex: 2,
          explanation: "„schnelle“ beschreibt den Fuchs — Adjektiv.",
        },
      },
      {
        slug: "rechtschreibung-ie-klasse-5",
        title: "Rechtschreibung: ie und ieh",
        grade: 5,
        summary: "Lange Vokale mit ie schreiben und Merkregeln nutzen.",
        review_status: "reviewed",
        exercise: {
          prompt: "Welche Schreibweise ist richtig?",
          options: ["líeben", "lieben", "liben", "liieben"],
          correctIndex: 1,
          explanation: "Nach langer ie schreibt man „ie“: lieben.",
        },
      },
      {
        slug: "satzglieder-klasse-6",
        title: "Satzglieder",
        grade: 6,
        summary: "Subjekt, Prädikat und Objekt in Aussagesätzen finden.",
        review_status: "reviewed",
        exercise: {
          prompt: "Was ist das Prädikat in: „Die Katze schläft auf dem Sofa.“?",
          options: ["Die Katze", "schläft", "auf dem Sofa", "Sofa"],
          correctIndex: 1,
          explanation: "Das Prädikat ist die gebeugte Verbform: schläft.",
        },
      },
      {
        slug: "maerchen-klasse-6",
        title: "Märchen verstehen",
        grade: 6,
        summary: "Typische Merkmale und einfache Textanalyse.",
        review_status: "reviewed",
        exercise: {
          prompt: "Was kennzeichnet viele Märchen?",
          options: ["wissenschaftliche Fachsprache", "Zauber und typische Anfänge", "nur Gegenwart", "keine Hauptfiguren"],
          correctIndex: 1,
          explanation: "Märchen nutzen oft Formeln wie „Es war einmal“ und magische Elemente.",
        },
      },
      {
        slug: "zeitformen-klasse-7",
        title: "Zeitformen",
        grade: 7,
        summary: "Präsens, Präteritum und Perfekt unterscheiden.",
        review_status: "reviewed",
        exercise: {
          prompt: "Welche Form ist Perfekt? „Er ___ den Bus verpasst.“",
          options: ["verpasst", "verpasste", "hat", "hatte"],
          correctIndex: 2,
          explanation: "Perfekt: Hilfsverb „hat“ + Partizip II — „Er hat … verpasst.“",
        },
      },
      {
        slug: "argumentieren-klasse-8",
        title: "Argumentieren",
        grade: 8,
        summary: "These, Begründung und Beispiel in einem Kurztext.",
        review_status: "needs_operator_review",
        exercise: {
          prompt: "Was gehört zu einer Argumentation?",
          options: ["nur eine Aufzählung", "These und Begründung", "reine Beschreibung ohne Stellung", "Zufallszahlen"],
          correctIndex: 1,
          explanation: "Argumentieren heißt: Behauptung (These) mit Gründen stützen.",
        },
      },
      {
        slug: "balladen-klasse-9",
        title: "Balladen",
        grade: 9,
        summary: "Spannung, Refrain und Erzählstruktur in Balladen.",
        review_status: "reviewed",
        exercise: {
          prompt: "Balladen sind oft …",
          options: ["reine Fachtexte", "erzählende Gedichte mit Handlung", "nur Reime ohne Inhalt", "Werbetexte"],
          correctIndex: 1,
          explanation: "Balladen erzählen häufig eine dramatische Geschichte in Versform.",
        },
      },
      {
        slug: "medien-klasse-10",
        title: "Medien kritisch lesen",
        grade: 10,
        summary: "Quellen prüfen und Meinung von Fakten trennen.",
        review_status: "reviewed",
        exercise: {
          prompt: "Was hilft beim Prüfen einer Online-Quelle?",
          options: ["nur die Überschrift", "Autor, Datum und Hintergrund", "Kommentaranzahl", "Länge des Textes allein"],
          correctIndex: 1,
          explanation: "Seriöse Einordnung braucht Wer, Wann und in welchem Kontext.",
        },
      },
    ],
  },
  {
    slug: "englisch",
    title: "Englisch",
    summary: "Im Fach Englisch übst du die Aufgaben auf Englisch.",
    topics: [
      {
        slug: "vokabeln-schule-klasse-5",
        title: "Vokabeln für die Schule",
        grade: 5,
        summary: "Wörter für Klassenraum und Schultag.",
        review_status: "reviewed",
        exercise: {
          prompt: "What is „book“ in German?",
          options: ["Heft", "Buch", "Tafel", "Stift"],
          correctIndex: 1,
          explanation: "book = Buch.",
        },
      },
      {
        slug: "alltagswortschatz-klasse-5",
        title: "Alltagswortschatz",
        grade: 5,
        summary: "Einfache Wörter für Freizeit und Familie.",
        review_status: "reviewed",
        exercise: {
          prompt: "Choose the correct word: I ___ to music every evening.",
          options: ["listen", "listening", "listens", "listened"],
          correctIndex: 0,
          explanation: "Simple present with I: listen.",
        },
      },
      {
        slug: "simple-present-klasse-6",
        title: "Simple Present",
        grade: 6,
        summary: "Regelmäßige Verben in einfachen Sätzen.",
        review_status: "reviewed",
        exercise: {
          prompt: "She ___ football on Saturdays.",
          options: ["play", "plays", "playing", "played"],
          correctIndex: 1,
          explanation: "Third person singular: she plays.",
        },
      },
      {
        slug: "fragen-antworten-klasse-6",
        title: "Fragen und Antworten",
        grade: 6,
        summary: "Yes/no questions und kurze Antworten.",
        review_status: "reviewed",
        exercise: {
          prompt: "Which question is correct?",
          options: ["Do you like pizza?", "You like pizza?", "Likes you pizza?", "Pizza you like?"],
          correctIndex: 0,
          explanation: "Yes/no questions start with do/does + subject + verb.",
        },
      },
      {
        slug: "past-simple-klasse-7",
        title: "Past Simple",
        grade: 7,
        summary: "Regelmäßige Verben in der Vergangenheit.",
        review_status: "reviewed",
        exercise: {
          prompt: "Yesterday I ___ (walk) to school.",
          options: ["walk", "walks", "walked", "walking"],
          correctIndex: 2,
          explanation: "Past simple of walk: walked.",
        },
      },
      {
        slug: "lesen-kurztexte-klasse-7",
        title: "Kurztexte lesen",
        grade: 7,
        summary: "Hauptinformationen aus kurzen englischen Texten.",
        review_status: "needs_operator_review",
        exercise: {
          prompt: "Read: „Tom has two sisters.“ How many sisters does Tom have?",
          options: ["one", "two", "three", "none"],
          correctIndex: 1,
          explanation: "The text says two sisters.",
        },
      },
      {
        slug: "email-schreiben-klasse-8",
        title: "E-Mail schreiben",
        grade: 8,
        summary: "Begrüßung, Hauptteil und verbindlicher Schluss.",
        review_status: "reviewed",
        exercise: {
          prompt: "Which closing fits an informal email to a friend?",
          options: ["Yours faithfully,", "Best wishes,", "See you soon,", "Dear Sir or Madam,"],
          correctIndex: 2,
          explanation: "„See you soon“ passt zu einer informellen Mail an Freund:innen.",
        },
      },
      {
        slug: "conditional-klasse-9",
        title: "If-Sätze (Typ 1)",
        grade: 9,
        summary: "Reale Bedingungen mit if + present, will + infinitive.",
        review_status: "reviewed",
        exercise: {
          prompt: "If it ___ tomorrow, we will stay at home.",
          options: ["rain", "rains", "will rain", "rained"],
          correctIndex: 1,
          explanation: "First conditional: if + present simple (rains), will + verb.",
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