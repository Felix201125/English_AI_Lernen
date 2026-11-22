import { describe, expect, it } from "vitest";
import { PUBLIC_SUBJECTS } from "./subjects";

describe("PUBLIC_SUBJECTS", () => {
  const required = ["mathe", "deutsch", "englisch"] as const;

  it.each(required)(
    "%s hat mindestens 8 Themen mit vollständiger Übung",
    (slug) => {
      const subject = PUBLIC_SUBJECTS.find((s) => s.slug === slug);
      expect(subject).toBeDefined();
      expect(subject!.topics.length).toBeGreaterThanOrEqual(8);
      for (const topic of subject!.topics) {
        expect(topic.exercise.prompt.length).toBeGreaterThan(0);
        expect(topic.exercise.options.length).toBeGreaterThanOrEqual(2);
        expect(topic.exercise.correctIndex).toBeGreaterThanOrEqual(0);
        expect(topic.exercise.correctIndex).toBeLessThan(
          topic.exercise.options.length
        );
        expect(topic.exercise.explanation.length).toBeGreaterThan(0);
      }
    }
  );
});