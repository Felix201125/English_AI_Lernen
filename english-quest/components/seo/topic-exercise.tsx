"use client";

import { useState } from "react";
import type { TopicExercise } from "@/lib/content/subjects";

export function TopicExercisePlayer({ exercise }: { exercise: TopicExercise }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="eq-card space-y-3 p-5">
      <h2 className="font-display text-lg text-white">Kurze Übung</h2>
      <p className="text-slate-200">{exercise.prompt}</p>
      <div className="grid gap-2">
        {exercise.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            className="rounded-xl border border-white/15 px-3 py-2 text-left text-slate-100 hover:border-indigo-400/50"
            onClick={() =>
              setFeedback(
                i === exercise.correctIndex
                  ? `Richtig! ${exercise.explanation}`
                  : `Nicht ganz — Tipp: ${exercise.explanation}`
              )
            }
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && (
        <p className="text-sm text-emerald-300" aria-live="polite">
          {feedback}
        </p>
      )}
    </div>
  );
}
