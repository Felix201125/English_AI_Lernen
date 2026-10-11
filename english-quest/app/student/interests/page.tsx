"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { interestCatalog } from "@/lib/data/mock-students";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export default function StudentInterestsPage() {
  const { activeStudent, toggleInterest, isLive } = useApp();
  const i18n = t();
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        {i18n.interests.title}
      </h1>
      <p className="text-slate-300">
        {i18n.interests.subtitle}{" "}
        {isLive &&
          "Während der Live-Stunde ändert das nicht die aktuelle Aktivität."}
      </p>
      {toast && (
        <p className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
          {toast}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {interestCatalog.map((item) => {
          const active = activeStudent.interests.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                toggleInterest(item.id);
                setToast(i18n.interests.saved);
                window.setTimeout(() => setToast(null), 2000);
              }}
              className={cn(
                "eq-card p-5 text-left transition hover:scale-[1.02]",
                active && "eq-glow ring-1 ring-indigo-400/50"
              )}
            >
              <div className="text-3xl">{item.emoji}</div>
              <p className="mt-2 font-semibold text-white">{item.id}</p>
              <p className="text-xs text-slate-400">
                {active ? i18n.interests.selected : i18n.interests.tap}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
