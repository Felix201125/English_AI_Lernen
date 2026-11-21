export type GuestQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  xp: number;
};

export type GuestQuest = {
  id: string;
  interestId: string;
  subject: "mathe" | "deutsch";
  title: string;
  questions: GuestQuestion[];
};

const QUESTS: GuestQuest[] = [
  {
    id: "guest-mathe-fussball",
    interestId: "Football",
    subject: "mathe",
    title: "Fußball-Statistik: Prozente",
    questions: [
      {
        id: "q1",
        prompt: "Ein Team schießt 20 Tore. 5 davon waren Elfmeter. Wie viel Prozent waren Elfmeter?",
        options: ["15 %", "20 %", "25 %", "40 %"],
        correctIndex: 2,
        xp: 20,
      },
      {
        id: "q2",
        prompt: "Bei einem Spiel waren 80 % der 200 Fans mit Schal. Wie viele Fans hatten einen Schal?",
        options: ["80", "120", "160", "180"],
        correctIndex: 2,
        xp: 25,
      },
      {
        id: "q3",
        prompt: "Ein Spieler trifft in 3 von 12 Schüssen. Wie viel Prozent ist das?",
        options: ["12 %", "25 %", "30 %", "33 %"],
        correctIndex: 1,
        xp: 25,
      },
      {
        id: "q4",
        prompt: "Die Halbzeit dauert 45 Minuten. Nach 15 Minuten: wie viel Prozent der Halbzeit ist vorbei?",
        options: ["15 %", "25 %", "33 %", "45 %"],
        correctIndex: 2,
        xp: 30,
      },
    ],
  },
  {
    id: "guest-mathe-gaming",
    interestId: "Gaming",
    subject: "mathe",
    title: "Gaming: Level & Prozent",
    questions: [
      {
        id: "q1",
        prompt: "Du brauchst 100 XP fürs nächste Level und hast 40. Wie viel Prozent fehlen noch?",
        options: ["40 %", "50 %", "60 %", "70 %"],
        correctIndex: 2,
        xp: 20,
      },
      {
        id: "q2",
        prompt: "Ein Bundle kostet 20 €, Rabatt 25 %. Was zahlst du?",
        options: ["5 €", "10 €", "15 €", "18 €"],
        correctIndex: 2,
        xp: 25,
      },
      {
        id: "q3",
        prompt: "Von 50 Gegnern hast du 10 besiegt. Welcher Bruchteil ist das?",
        options: ["1/2", "1/4", "1/5", "1/10"],
        correctIndex: 2,
        xp: 25,
      },
      {
        id: "q4",
        prompt: "Dein Highscore steigt von 200 auf 250. Um wie viel Prozent?",
        options: ["20 %", "25 %", "50 %", "250 %"],
        correctIndex: 1,
        xp: 30,
      },
    ],
  },
  {
    id: "guest-deutsch-musik",
    interestId: "Music",
    subject: "deutsch",
    title: "Musik: Wortarten",
    questions: [
      {
        id: "q1",
        prompt: "Welches Wort ist ein Verb? „Die Band spielt laut.“",
        options: ["Band", "spielt", "laut", "Die"],
        correctIndex: 1,
        xp: 20,
      },
      {
        id: "q2",
        prompt: "Welcher Satz ist korrekt?",
        options: [
          "Die Konzert war toll.",
          "Das Konzert war toll.",
          "Der Konzert war toll.",
          "Den Konzert war toll.",
        ],
        correctIndex: 1,
        xp: 25,
      },
      {
        id: "q3",
        prompt: "Was ist das Adjektiv? „Der laute Song rockt.“",
        options: ["Song", "rockt", "laute", "Der"],
        correctIndex: 2,
        xp: 25,
      },
      {
        id: "q4",
        prompt: "Plural von „Lied“?",
        options: ["Lieds", "Liederen", "Lieder", "Liedes"],
        correctIndex: 2,
        xp: 30,
      },
    ],
  },
  {
    id: "guest-mathe-weltall",
    interestId: "Space",
    subject: "mathe",
    title: "Weltall: Größenordnungen",
    questions: [
      {
        id: "q1",
        prompt: "Ein Planet braucht 10 Tage für eine Umlaufbahn. Nach 4 Tagen: wie viel Prozent?",
        options: ["4 %", "10 %", "40 %", "60 %"],
        correctIndex: 2,
        xp: 20,
      },
      {
        id: "q2",
        prompt: "3 von 12 Sternbildern kennst du. Welcher Anteil?",
        options: ["1/2", "1/3", "1/4", "1/6"],
        correctIndex: 2,
        xp: 25,
      },
      {
        id: "q3",
        prompt: "Die Rakete fliegt 300 km/h. In 2 Stunden?",
        options: ["150 km", "300 km", "600 km", "900 km"],
        correctIndex: 2,
        xp: 25,
      },
      {
        id: "q4",
        prompt: "Von 50 Asteroiden sind 20 % groß. Wie viele?",
        options: ["5", "10", "15", "20"],
        correctIndex: 1,
        xp: 30,
      },
    ],
  },
];

const FALLBACK = QUESTS[0];

export function pickGuestQuest(interestId: string, _grade: number): GuestQuest {
  void _grade;
  return QUESTS.find((q) => q.interestId === interestId) ?? FALLBACK;
}

export function getGuestQuest(questId: string): GuestQuest | null {
  return QUESTS.find((q) => q.id === questId) ?? null;
}

export function listGuestQuests(): GuestQuest[] {
  return QUESTS;
}
