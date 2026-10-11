"use client";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cyclePermission } from "@/lib/permissions";
import { modeLabelDe, PERMISSION_META } from "@/lib/permissions/labels";
import { saveTeacherPermissionsRemote } from "@/lib/teacher/persist";
import type { LessonPermissions } from "@/lib/types";

const keys = Object.keys(PERMISSION_META) as (keyof LessonPermissions)[];

export default function PermissionsPage() {
  const {
    permissions,
    learningStates,
    cyclePerm,
    setStudentPermissions,
    setActiveStudentId,
    activeStudentId,
    authUser,
  } = useApp();
  const toast = useToast();
  const teacherId =
    authUser?.marketplaceTeacherId ||
    (authUser?.id ? `teacher-${authUser.id}` : "teacher-local");

  const applyToAll = () => {
    const template = permissions[activeStudentId];
    if (!template) return;
    for (const s of Object.values(learningStates)) {
      setStudentPermissions(s.studentId, { ...template });
      void saveTeacherPermissionsRemote(teacherId, s.studentId, {
        ...template,
      });
    }
    toast.success("Freigaben für alle übernommen und gespeichert.");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Freigaben</h1>
      <p className="text-slate-300">
        Tippe auf den Status zum Wechseln. Änderungen werden sofort gespeichert.
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
        <Button size="sm" variant="secondary" onClick={applyToAll}>
          Für alle übernehmen
        </Button>
      </div>
      <div className="eq-card divide-y divide-white/5">
        {keys.map((key) => {
          const meta = PERMISSION_META[key];
          const mode = permissions[activeStudentId]?.[key] ?? "disabled";
          return (
            <div
              key={key}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">{meta.label}</p>
                <p className="text-xs text-slate-500">{meta.help}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const next = cyclePermission(mode);
                  cyclePerm(activeStudentId, key);
                  void saveTeacherPermissionsRemote(teacherId, activeStudentId, {
                    ...permissions[activeStudentId],
                    [key]: next,
                  });
                  toast.success(`${meta.label}: ${modeLabelDe(next)}`);
                }}
              >
                {modeLabelDe(mode)}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
