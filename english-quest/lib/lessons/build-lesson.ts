import type { LearningState, LessonDraft } from "@/lib/types";
import { getSubject } from "@/lib/subjects";
import { splitDurationExact } from "./duration";
import { callServerAI } from "@/lib/ai/server-client";

type GeneratedJson = {
  title: string;
  learningGoal: string;
  profileReasoning: string;
  methodNote: string;
  activities: {
    title: string;
    weight: number;
    instructions: string;
    tasks: string[];
    solutions: string[];
    materials: string[];
    teacherTips: string[];
  }[];
};

function fallbackLesson(
  state: LearningState,
  goal: string,
  duration: number,
  instruction?: string
): LessonDraft {
  const subject = getSubject(state.subjectId).labelDe;
  const topic = state.interests[0] ?? goal;
  const minutes = splitDurationExact(duration, [2, 5, 2, 1]);
  const now = new Date().toISOString();
  return {
    id: `lesson-${Date.now()}`,
    studentId: state.studentId,
    title: `${topic}: ${goal}`,
    durationMinutes: duration,
    level: state.cefrLevel,
    status: "draft",
    teacherAiNote: `Ziel: ${goal} sicher anwenden — passend zu ${state.name} (${state.cefrLevel}, Klasse/Alter ${state.age}).`,
    studentAiNote:
      `Begründung: ${state.name} mag ${state.interests.slice(0, 2).join(", ") || "allgemeine Themen"}. ` +
      `Stärken: ${state.strengths.slice(0, 2).join(", ") || "noch im Aufbau"}. ` +
      `Fokus: ${state.weaknesses.slice(0, 2).join(", ") || state.currentFocus[0] || "Grundlagen"}. ` +
      `Letzte Fehler: ${state.commonMistakes[0]?.pattern ?? "keine erfasst"}.` +
      (instruction ? ` Lehrerwunsch: ${instruction}` : ""),
    mainAiNote: `Methode: kurze Aktivierung, geführte Übung, Anwendung mit ${topic}, Abschlussreflexion. Fach: ${subject}.`,
    createdAt: now,
    updatedAt: now,
    activities: [
      {
        id: "a1",
        order: 1,
        title: "Warm-up",
        durationMinutes: minutes[0],
        status: "draft",
        instructions: `Kurze Aktivierung zu „${goal}“ mit Bezug zu ${topic}.`,
        tasks: [
          `Nenne 3 Wörter/Ideen zu ${topic}.`,
          `Bilde einen einfachen Satz mit dem Ziel „${goal}“.`,
        ],
        solutions: [
          "Individuelle Antworten akzeptieren.",
          `Beispielsatz passend zu ${goal}.`,
        ],
        materials: ["Whiteboard / Chat", "Wortkarten (optional)"],
        teacherTips: ["Lob für Mut, nicht für Perfektion.", "Tempo anpassen."],
      },
      {
        id: "a2",
        order: 2,
        title: "Geführte Übung",
        durationMinutes: minutes[1],
        status: "draft",
        instructions: `Gemeinsam ${goal} erarbeiten, Fehler aus dem Profil aufgreifen.`,
        tasks: [
          `Erkläre die Regel zu ${goal} in eigenen Worten.`,
          "Löse 4 kurze Aufgaben (von leicht nach mittelschwer).",
          "Korrigiere einen typischen Fehler gemeinsam.",
        ],
        solutions: [
          "Regel kurz und kindgerecht.",
          "Lösungen schrittweise zeigen.",
          state.commonMistakes[0]?.pattern ?? "Häufigen Fehler besprechen.",
        ],
        materials: ["Arbeitsblatt digital", "Beispielsätze"],
        teacherTips: [
          "Bei Unsicherheit Hinweis statt Lösung.",
          "Ein Interesse einbauen.",
        ],
      },
      {
        id: "a3",
        order: 3,
        title: "Anwendung / Quest",
        durationMinutes: minutes[2],
        status: "draft",
        instructions: `Selbstständige Anwendung mit Bezug zu ${topic}.`,
        tasks: [
          `Erstelle 5 eigene Beispiele zu ${goal}.`,
          "Kurze Dialog-/Schreibaufgabe (2–4 Sätze).",
        ],
        solutions: ["Checkliste: Zielstruktur vorhanden?", "Feedback-Rubrik 1–3."],
        materials: ["Timer optional (ohne Druck)", "Interessen-Bilder"],
        teacherTips: ["Differenzierung: weniger Items bei Überforderung."],
      },
      {
        id: "a4",
        order: 4,
        title: "Reflexion",
        durationMinutes: minutes[3],
        status: "draft",
        instructions: "Abschluss ohne Noten-Druck.",
        tasks: [
          "Was kannst du jetzt besser?",
          "Was übst du bis zur nächsten Stunde?",
        ],
        solutions: ["Offene Antworten.", "Hausaufgabe klar und klein."],
        materials: ["Notizen für Eltern/Schüler in Qestra"],
        teacherTips: ["Hausaufgabe als Quest freischalten."],
      },
    ],
  };
}

function validateGenerated(
  data: unknown,
  duration: number
): GeneratedJson | null {
  if (!data || typeof data !== "object") return null;
  const d = data as GeneratedJson;
  if (!d.title || !d.learningGoal || !Array.isArray(d.activities)) return null;
  if (d.activities.length < 3) return null;
  for (const a of d.activities) {
    if (!a.title || !Array.isArray(a.tasks) || a.tasks.length < 1) return null;
  }
  void duration;
  return d;
}

export async function buildLessonDraft(input: {
  state: LearningState;
  goal: string;
  duration: number;
  instruction?: string;
}): Promise<LessonDraft> {
  const { state, goal, duration, instruction } = input;
  const prompt =
    `Erzeuge eine ${duration}-Minuten-Stunde als JSON (kein Markdown) mit Feldern: ` +
    `title, learningGoal, profileReasoning, methodNote, activities[{title,weight,instructions,tasks[],solutions[],materials[],teacherTips[]}]. ` +
    `Genau die Summe der Zeiten später serverseitig — weights relativ. ` +
    `Schüler: ${state.name}, Alter ${state.age}, Niveau ${state.cefrLevel}, ` +
    `Interessen ${state.interests.join(", ")}, Stärken ${state.strengths.join(", ")}, ` +
    `Schwächen ${state.weaknesses.join(", ")}, Fehler ${state.commonMistakes.map((m) => m.pattern).join("; ")}. ` +
    `Ziel: ${goal}. ${instruction ? `Lehrerwunsch: ${instruction}` : ""} ` +
    `Antwort NUR gültiges JSON.`;

  let parsed: GeneratedJson | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callServerAI({
      action: "generate_lesson_json",
      question: prompt,
      student: {
        name: state.name,
        level: state.cefrLevel,
        focus: state.currentFocus,
        interests: state.interests,
        weaknesses: state.weaknesses,
      },
    });
    if (!text) break;
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const slice =
        jsonStart >= 0 ? text.slice(jsonStart, jsonEnd + 1) : text;
      parsed = validateGenerated(JSON.parse(slice), duration);
      if (parsed) break;
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    return fallbackLesson(state, goal, duration, instruction);
  }

  const weights = parsed.activities.map((a) => Math.max(1, a.weight || 1));
  const minutes = splitDurationExact(duration, weights);
  const now = new Date().toISOString();
  return {
    id: `lesson-${Date.now()}`,
    studentId: state.studentId,
    title: parsed.title,
    durationMinutes: duration,
    level: state.cefrLevel,
    status: "draft",
    teacherAiNote: parsed.learningGoal,
    studentAiNote: parsed.profileReasoning,
    mainAiNote: parsed.methodNote,
    createdAt: now,
    updatedAt: now,
    activities: parsed.activities.map((a, i) => ({
      id: `a${i + 1}`,
      order: i + 1,
      title: a.title,
      durationMinutes: minutes[i] ?? 5,
      status: "draft" as const,
      instructions: a.instructions,
      tasks: a.tasks,
      solutions: a.solutions,
      materials: a.materials,
      teacherTips: a.teacherTips,
    })),
  };
}

export async function regenerateActivityLevel(input: {
  state: LearningState;
  activityTitle: string;
  direction: "easier" | "harder";
  goal: string;
}): Promise<{
  title: string;
  instructions: string;
  tasks: string[];
  solutions: string[];
  materials: string[];
  teacherTips: string[];
  levelNote: string;
}> {
  const dirDe = input.direction === "easier" ? "leichter" : "schwerer";
  const text = await callServerAI({
    action: "regenerate_activity",
    question:
      `Schreibe die Aktivität „${input.activityTitle}“ ${dirDe} neu als JSON: ` +
      `{title,instructions,tasks[],solutions[],materials[],teacherTips[],levelNote}. ` +
      `Schüler ${input.state.name} Niveau ${input.state.cefrLevel}, Ziel ${input.goal}. Nur JSON.`,
    student: {
      name: input.state.name,
      level: input.state.cefrLevel,
      interests: input.state.interests,
    },
  });
  if (text) {
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const data = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
        title?: string;
        instructions?: string;
        tasks?: string[];
        solutions?: string[];
        materials?: string[];
        teacherTips?: string[];
        levelNote?: string;
      };
      if (data.title && data.instructions) {
        return {
          title: data.title.replace(/\s*\((easier|harder|leichter|schwerer)\)\s*/gi, "").trim(),
          instructions: data.instructions,
          tasks: data.tasks ?? [],
          solutions: data.solutions ?? [],
          materials: data.materials ?? [],
          teacherTips: data.teacherTips ?? [],
          levelNote: data.levelNote ?? dirDe,
        };
      }
    } catch {
      /* fallback */
    }
  }
  const easier = input.direction === "easier";
  return {
    title: easier
      ? `${input.activityTitle} — vereinfacht`
      : `${input.activityTitle} — vertieft`,
    instructions: easier
      ? "Weniger Items, mehr Beispiele, Schritt-für-Schritt."
      : "Mehr Transfer, offene Produktion, weniger Hilfen.",
    tasks: easier
      ? ["2 leichte Beispiele nachmachen", "1 eigenen Satz bilden"]
      : ["6 gemischte Aufgaben", "Kurzer freier Text/Dialog"],
    solutions: ["Mit Schüler gemeinsam prüfen"],
    materials: ["Digitale Übung in Qestra"],
    teacherTips: [easier ? "Tempo drosseln" : "Herausforderung loben"],
    levelNote: dirDe,
  };
}
