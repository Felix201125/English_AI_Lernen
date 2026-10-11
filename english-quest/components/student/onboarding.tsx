"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { interestCatalog } from "@/lib/data/mock-students";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StudentOnboarding() {
  const { completeOnboarding, onboardingDone, authUser } = useApp();
  const i18n = t();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [level, setLevel] = useState("A2");
  const [age, setAge] = useState(12);

  if (onboardingDone || authUser?.role !== "student") return null;

  const toggle = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1220]/90 p-4 backdrop-blur">
      <div className="eq-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <h1 className="font-display text-2xl font-bold text-white">
          {i18n.onboarding.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Schritt {step + 1} von 3
        </p>

        {step === 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepInterests}</p>
            <div className="grid grid-cols-2 gap-2">
              {interestCatalog.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left text-sm",
                    interests.includes(item.id)
                      ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                      : "border-white/10 text-slate-300"
                  )}
                >
                  {item.emoji} {item.id}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={interests.length === 0}
              onClick={() => setStep(1)}
            >
              {i18n.common.next}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepLevel}</p>
            <p className="text-sm text-slate-400">
              English: Choose the sentence that feels right for you.
            </p>
            {[
              { id: "A1", label: "I like football." },
              { id: "A2", label: "Yesterday I played football with my friends." },
              { id: "B1", label: "I've been playing football since I was little." },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLevel(opt.id)}
                className={cn(
                  "block w-full rounded-xl border px-4 py-3 text-left text-sm",
                  level === opt.id
                    ? "border-emerald-400/50 bg-emerald-500/15 text-white"
                    : "border-white/10 text-slate-300"
                )}
              >
                <span className="text-xs text-slate-500">{opt.id}</span>
                <br />
                {opt.label}
              </button>
            ))}
            <label className="block text-sm text-slate-300">
              Alter
              <input
                type="number"
                min={8}
                max={99}
                value={age}
                onChange={(e) => setAge(Number(e.target.value) || 12)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              />
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(0)}>
                {i18n.common.back}
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                {i18n.common.next}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-3">
            <p className="text-slate-300">{i18n.onboarding.stepTour}</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>
                <strong className="text-white">Spiele</strong> — Quests ohne Druck
              </li>
              <li>
                <strong className="text-white">KI</strong> — Fragen stellen (Credits)
              </li>
              <li>
                <strong className="text-white">Live</strong> — wenn dein Lehrer startet
              </li>
              <li>
                <strong className="text-white">Pause ist ok</strong> — Fortschritt bleibt
              </li>
            </ul>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                {i18n.common.back}
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  completeOnboarding({
                    interests,
                    cefrLevel: level,
                    age,
                  })
                }
              >
                {i18n.onboarding.finish}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
