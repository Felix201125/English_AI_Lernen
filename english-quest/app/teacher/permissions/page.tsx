"use client";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { permissionLabel } from "@/lib/permissions";
import type { LessonPermissions } from "@/lib/types";

const keys: (keyof LessonPermissions)[] = [
  "activityAccess",
  "aiActivities",
  "studentAIChat",
  "translator",
  "hints",
  "answers",
  "skipActivity",
  "externalLinks",
  "speechAnalysis",
  "audioRecording",
  "aiProfileUpdates",
  "studentRequests",
];

export default function PermissionsPage() {
  const { permissions, learningStates, cyclePerm, setActiveStudentId, activeStudentId } =
    useApp();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Permissions</h1>
      <p className="text-slate-300">
        Tippe auf einen Modus zum Wechseln. Action-Handler prüfen Permissions —
        nicht nur Button-Sichtbarkeit.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(learningStates).map((s) => (
          <Button
            key={s.studentId}
            size="sm"
            variant={activeStudentId === s.studentId ? "primary" : "secondary"}
            onClick={() => setActiveStudentId(s.studentId)}
          >
            {s.name}
          </Button>
        ))}
      </div>
      <div className="eq-card divide-y divide-white/5">
        {keys.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <span className="text-sm text-slate-200">{key}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => cyclePerm(activeStudentId, key)}
            >
              {permissionLabel(permissions[activeStudentId][key])}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
