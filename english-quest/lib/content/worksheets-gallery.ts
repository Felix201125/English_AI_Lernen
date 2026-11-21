export type GalleryWorksheet = {
  id: string;
  title: string;
  subject: string;
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
    grade: 5,
    topic: "Wortarten",
    html: `<h1>Wortarten Klasse 5</h1>
<p>Markiere Nomen, Verben und Adjektive in: „Die mutige Katze springt.“</p>
<p>Bilde je einen eigenen Satz mit einem Adjektiv.</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
  {
    id: "englisch-vocab-5",
    title: "School vocabulary",
    subject: "englisch",
    grade: 5,
    topic: "Vocabulary",
    html: `<h1>School vocabulary (Class 5)</h1>
<p>Match: book, pencil, teacher — Buch, Bleistift, Lehrkraft.</p>
<p>Write three sentences with these words.</p>
<p><em>Erstellt mit Qestra</em></p>`,
  },
];

export function getGalleryItem(id: string): GalleryWorksheet | undefined {
  return GALLERY.find((w) => w.id === id);
}
