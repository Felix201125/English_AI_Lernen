"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";

export default function TeacherStudentsPage() {
  const { learningStates } = useApp();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Students</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(learningStates).map((s) => (
          <Link
            key={s.studentId}
            href={`/teacher/students/${s.studentId}`}
            className="eq-card p-5 transition hover:eq-glow"
          >
            <h2 className="font-display text-xl">{s.name}</h2>
            <p className="text-sm text-slate-400">
              {s.age} · {s.cefrLevel} · {s.interests.join(", ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
