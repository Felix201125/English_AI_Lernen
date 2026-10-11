"use client";

import { SUBJECTS, type SubjectId } from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  value: SubjectId;
  onChange: (id: SubjectId) => void;
  className?: string;
  compact?: boolean;
};

export function SubjectSwitcher({
  value,
  onChange,
  className,
  compact,
}: Props) {
  const i18n = t();
  const list = Object.values(SUBJECTS);
  if (compact) {
    return (
      <select
        className={cn(
          "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white",
          className
        )}
        value={value}
        onChange={(e) => {
          const id = e.target.value as SubjectId;
          if (SUBJECTS[id].status === "planned") return;
          onChange(id);
        }}
      >
        {list.map((s) => (
          <option key={s.id} value={s.id} disabled={s.status === "planned"}>
            {s.labelDe}
            {s.status === "planned" ? ` (${i18n.subject.comingSoon})` : ""}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {list.map((s) => {
        const active = s.id === value;
        const disabled = s.status === "planned";
        return (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            title={disabled ? i18n.subject.onlyEnglish : undefined}
            onClick={() => {
              if (!disabled) onChange(s.id);
            }}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-xs transition",
              active
                ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                : "border-white/10 bg-white/5 text-slate-300",
              disabled
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-white/10"
            )}
          >
            {s.labelDe}
            {disabled ? ` · ${i18n.subject.comingSoon}` : ""}
          </button>
        );
      })}
    </div>
  );
}
