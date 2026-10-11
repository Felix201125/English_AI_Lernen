"use client";

import { SubjectPicker } from "@/components/subject-picker";
import type { SubjectId } from "@/lib/subjects";

type Props = {
  value: SubjectId;
  onChange: (id: SubjectId) => void;
  className?: string;
  compact?: boolean;
  mySubjectIds?: SubjectId[];
  allowPreparing?: boolean;
};

/** Fachauswahl — durchsuchbar mit Kategorien (ersetzt Button-Reihe) */
export function SubjectSwitcher({
  value,
  onChange,
  className,
  compact,
  mySubjectIds,
  allowPreparing,
}: Props) {
  return (
    <SubjectPicker
      value={value}
      onChange={onChange}
      className={className}
      compact={compact}
      mySubjectIds={mySubjectIds}
      allowPreparing={allowPreparing}
    />
  );
}
