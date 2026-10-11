"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { filterLogs } from "@/lib/activity-log";
import type { ActivityLogEntry } from "@/lib/types";

const filters: Array<ActivityLogEntry["category"] | "All"> = [
  "All",
  "Qestra KI",
  "Translator",
  "Activities",
  "Hints",
  "Permissions",
  "Navigation",
  "Warnings",
  "Learning State",
];

const AI_CATS = new Set([
  "Qestra KI",
  "Teacher AI",
  "Student AI",
  "Main AI",
]);

function labelCategory(c: ActivityLogEntry["category"]) {
  if (AI_CATS.has(c)) return "Qestra KI";
  if (c === "Learning State") return "Lernstand";
  return c;
}

export default function ActivityLogPage() {
  const { logs } = useApp();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = useMemo(() => {
    if (filter === "All") return logs;
    if (filter === "Qestra KI") {
      return logs.filter((l) => AI_CATS.has(l.category));
    }
    return filterLogs(logs, filter);
  }, [logs, filter]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Protokoll</h1>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs ${
              filter === f
                ? "bg-indigo-500 text-white"
                : "bg-white/5 text-slate-300"
            }`}
          >
            {f === "Qestra KI" ? "Qestra KI" : f === "All" ? "Alle" : f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {visible.map((log) => (
          <div
            key={log.id}
            className="eq-card flex flex-wrap items-start justify-between gap-2 p-4 text-sm"
          >
            <div>
              <p className="text-xs text-indigo-300">
                {labelCategory(log.category)}
                {log.studentId ? ` · ${log.studentId}` : ""}
              </p>
              <p className="mt-1 text-slate-200">
                {log.message
                  .replace(/Teacher AI/gi, "Qestra KI")
                  .replace(/Student AI/gi, "Qestra KI")
                  .replace(/Main AI/gi, "Qestra KI")}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(log.timestamp).toLocaleString("de-DE")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
