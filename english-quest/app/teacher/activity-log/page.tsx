"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  categoryLabelDe,
  filterLogs,
  formatLogMessageDe,
  formatLogTimestamp,
  logsToCsv,
} from "@/lib/activity-log";
import { parseLogTimestamp } from "@/lib/format/datetime";
import type { ActivityLogEntry } from "@/lib/types";

const categories: (ActivityLogEntry["category"] | "All")[] = [
  "All",
  "Activities",
  "Qestra KI",
  "Permissions",
  "Navigation",
  "Warnings",
  "Learning State",
  "Translator",
  "Hints",
];

export default function ActivityLogPage() {
  const { logs, learningStates } = useApp();
  const [category, setCategory] =
    useState<ActivityLogEntry["category"] | "All">("All");
  const [studentId, setStudentId] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    let list = filterLogs(logs, category);
    if (studentId !== "all") {
      list = list.filter((l) => l.studentId === studentId);
    }
    if (from) {
      const fromT = new Date(from).getTime();
      list = list.filter((l) => {
        const d = parseLogTimestamp(l.timestamp);
        return d ? d.getTime() >= fromT : true;
      });
    }
    if (to) {
      const toT = new Date(to).getTime() + 86_400_000;
      list = list.filter((l) => {
        const d = parseLogTimestamp(l.timestamp);
        return d ? d.getTime() <= toT : true;
      });
    }
    return list;
  }, [logs, category, studentId, from, to]);

  const exportCsv = () => {
    const csv = logsToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qestra-protokoll.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const studentName = (id?: string) => {
    if (!id) return "—";
    return learningStates[id]?.name ?? id;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-white">Protokoll</h1>
        <Button variant="secondary" onClick={exportCsv}>
          CSV exportieren
        </Button>
      </div>

      <div className="eq-card flex flex-wrap gap-3 p-4 text-sm">
        <label className="text-slate-400">
          Schüler
          <select
            className="mt-1 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="all">Alle</option>
            {Object.values(learningStates).map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-slate-400">
          Kategorie
          <select
            className="mt-1 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ActivityLogEntry["category"] | "All")
            }
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "Alle" : categoryLabelDe(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-slate-400">
          Von
          <input
            type="date"
            className="mt-1 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-slate-400">
          Bis
          <input
            type="date"
            className="mt-1 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>

      <ul className="space-y-2">
        {filtered.map((log) => (
          <li
            key={log.id}
            className="eq-card flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <p className="text-white">{formatLogMessageDe(log)}</p>
              <p className="mt-1 text-xs text-slate-500">
                {studentName(log.studentId)} · {categoryLabelDe(log.category)}
              </p>
            </div>
            <time className="text-xs text-slate-400" dateTime={log.timestamp}>
              {formatLogTimestamp(log.timestamp)}
            </time>
          </li>
        ))}
        {!filtered.length && (
          <li className="text-sm text-slate-400">Keine Einträge für diesen Filter.</li>
        )}
      </ul>
    </div>
  );
}
