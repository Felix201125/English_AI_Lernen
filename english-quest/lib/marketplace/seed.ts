/**
 * DEV-SEED — klar gekennzeichnet, getrennt von Produktiv-Laufzeit.
 * Wird von PHP einmalig in data/marketplace geschrieben, wenn leer.
 */
import type {
  AvailabilitySlot,
  TeacherPublicProfile,
} from "./types";

export const MARKETPLACE_SEED_VERSION = 1;

export const SEED_TEACHERS: TeacherPublicProfile[] = [
  {
    id: "seed-teacher-lena",
    firstName: "Lena",
    lastInitial: "M",
    photoUrl: null,
    bioShort: "Englisch und Mathe — ruhig, spielerisch, ohne Druck.",
    bioLong:
      "Ich unterrichte seit mehreren Jahren Nachhilfe und arbeite gerne mit Spielen und kurzen Quests. Kontakt nur über Qestra.",
    videoUrl: null,
    subjects: ["english", "math"],
    gradeLevels: [5, 6, 7, 8, 9, 10],
    languagesSpoken: ["de", "en"],
    focusTags: ["exam", "gaps", "speaking"],
    style: "Spielerisch, kurze Erklärungen, viel Übung",
    verified: true,
    ratingAvg: 4.8,
    ratingCount: 24,
    lessonsTaught: 180,
    priceCreditsPerHour: 40,
    currencyNote: "credits-placeholder",
    trialMinutes: 25,
    nextFreeSlotIso: null,
    approved: true,
  },
  {
    id: "seed-teacher-jonas",
    firstName: "Jonas",
    lastInitial: "K",
    photoUrl: null,
    bioShort: "Mathe und Physik für Mittelstufe — klar und geduldig.",
    bioLong:
      "Schwerpunkt Rechenwege und Verständnis. Hausaufgaben und Prüfungsvorbereitung möglich.",
    videoUrl: null,
    subjects: ["math", "physics", "exam-prep"],
    gradeLevels: [7, 8, 9, 10, 11, 12],
    languagesSpoken: ["de"],
    focusTags: ["exam", "homework", "gaps"],
    style: "Schritt-für-Schritt, Visualisierungen",
    verified: true,
    ratingAvg: 4.6,
    ratingCount: 18,
    lessonsTaught: 120,
    priceCreditsPerHour: 45,
    currencyNote: "credits-placeholder",
    trialMinutes: 25,
    nextFreeSlotIso: null,
    approved: true,
  },
  {
    id: "seed-teacher-sara",
    firstName: "Sara",
    lastInitial: "H",
    photoUrl: null,
    bioShort: "Deutsch, DaZ und Lerntechniken — freundlich und strukturiert.",
    bioLong:
      "Ich helfe beim Lesen, Schreiben und Organisieren von Lernstoff. Alles bleibt in der Plattform.",
    videoUrl: null,
    subjects: ["german", "daz", "study-skills", "literacy-support"],
    gradeLevels: [3, 4, 5, 6, 7, 8],
    languagesSpoken: ["de", "en", "tr"],
    focusTags: ["homework", "gaps", "fun"],
    style: "Lob und klare kleine Ziele",
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 31,
    lessonsTaught: 210,
    priceCreditsPerHour: null,
    currencyNote: "credits-placeholder",
    trialMinutes: 25,
    nextFreeSlotIso: null,
    approved: true,
  },
];

/** Wiederkehrende Wochenzeiten Europe/Berlin (Seed) */
export const SEED_AVAILABILITY: AvailabilitySlot[] = [
  {
    id: "seed-slot-lena-tue",
    teacherId: "seed-teacher-lena",
    weekday: "tue",
    startMinutes: 15 * 60,
    endMinutes: 18 * 60,
    timezone: "Europe/Berlin",
  },
  {
    id: "seed-slot-lena-thu",
    teacherId: "seed-teacher-lena",
    weekday: "thu",
    startMinutes: 16 * 60,
    endMinutes: 19 * 60,
    timezone: "Europe/Berlin",
  },
  {
    id: "seed-slot-jonas-wed",
    teacherId: "seed-teacher-jonas",
    weekday: "wed",
    startMinutes: 14 * 60,
    endMinutes: 17 * 60,
    timezone: "Europe/Berlin",
  },
  {
    id: "seed-slot-jonas-fri",
    teacherId: "seed-teacher-jonas",
    weekday: "fri",
    startMinutes: 15 * 60,
    endMinutes: 18 * 60,
    timezone: "Europe/Berlin",
  },
  {
    id: "seed-slot-sara-mon",
    teacherId: "seed-teacher-sara",
    weekday: "mon",
    startMinutes: 15 * 60,
    endMinutes: 18 * 60,
    timezone: "Europe/Berlin",
  },
  {
    id: "seed-slot-sara-sat",
    teacherId: "seed-teacher-sara",
    weekday: "sat",
    startMinutes: 10 * 60,
    endMinutes: 13 * 60,
    timezone: "Europe/Berlin",
  },
];
