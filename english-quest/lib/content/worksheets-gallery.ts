export type GalleryWorksheet = {
  id: string;
  title: string;
  subject: string;
  subjectLabel: "Mathe" | "Deutsch" | "Englisch";
  grade: number;
  topic: string;
  /** Relativer Pfad unter /worksheets/ oder Inline-HTML */
  html: string;
};

export const GALLERY: GalleryWorksheet[] = [
  {
    id: "mathe-prozent-6",
    title: "Prozentrechnung — Übungsblatt",
    subject: "mathe",
    subjectLabel: "Mathe",
    grade: 6,
    topic: "Prozentrechnung",
    html: `<h1>Prozentrechnung Klasse 6</h1>
<p>1) Wie viel Prozent sind 8 von 40?</p>
<p>2) 25 % von 200 sind …?</p>
<p>3) Ein Pullover kostet 40 €, Rabatt 10 %. Neuer Preis?</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
  {
    id: "deutsch-wortarten-5",
    title: "Wortarten erkennen",
    subject: "deutsch",
    subjectLabel: "Deutsch",
    grade: 5,
    topic: "Wortarten",
    html: `<h1>Wortarten Klasse 5</h1>
<p>Markiere Nomen, Verben und Adjektive in: „Die mutige Katze springt.“</p>
<p>Bilde je einen eigenen Satz mit einem Adjektiv.</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
  {
    id: "englisch-vocab-5",
    title: "Vokabeln für die Schule",
    subject: "englisch",
    subjectLabel: "Englisch",
    grade: 5,
    topic: "Vokabeln Schule",
    html: `<h1>Vokabeln für die Schule (Klasse 5)</h1>
<p>Match: book, pencil, teacher — Buch, Bleistift, Lehrkraft.</p>
<p>Write three sentences with these words.</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
  {
    id: "mathe-gleichungen-8",
    title: "Lineare Gleichungen — Kurzübung",
    subject: "mathe",
    subjectLabel: "Mathe",
    grade: 8,
    topic: "Lineare Gleichungen",
    html: `<h1>Lineare Gleichungen Klasse 8</h1>
<p>1) x + 5 = 12</p>
<p>2) 3x = 21</p>
<p>3) 2x − 4 = 10</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
  {
    id: "deutsch-satzglieder-6",
    title: "Satzglieder üben",
    subject: "deutsch",
    subjectLabel: "Deutsch",
    grade: 6,
    topic: "Satzglieder",
    html: `<h1>Satzglieder Klasse 6</h1>
<p>Unterstreiche Subjekt und markiere das Prädikat in zwei Sätzen deiner Wahl.</p>
<p>Beispiel: Der Hund bellt laut.</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
  {
    id: "englisch-past-7",
    title: "Past Simple — Arbeitsblatt",
    subject: "englisch",
    subjectLabel: "Englisch",
    grade: 7,
    topic: "Past Simple",
    html: `<h1>Past Simple (Klasse 7)</h1>
<p>Put the verbs in brackets into past simple:</p>
<p>1) Yesterday I ___ (play) football.</p>
<p>2) She ___ (watch) a film last night.</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
];

export function getGalleryItem(id: string): GalleryWorksheet | undefined {
  return GALLERY.find((w) => w.id === id);
}