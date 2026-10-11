"use client";

import { useMemo, useState } from "react";
import {
  SUBJECT_CATALOG,
  SUBJECT_CATEGORIES,
  type SubjectCategoryId,
  type SubjectId,
} from "@/lib/subjects";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  value: SubjectId;
  onChange: (id: SubjectId) => void;
  /** Fächer oben anzeigen (z. B. aus Profil) */
  mySubjectIds?: SubjectId[];
  /** Auch „in Vorbereitung“ wählbar (z. B. Buchungsfilter) */
  allowPreparing?: boolean;
  className?: string;
  compact?: boolean;
};

export function SubjectPicker({
  value,
  onChange,
  mySubjectIds = [],
  allowPreparing = false,
  className,
  compact,
}: Props) {
  const i18n = t();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SubjectCategoryId | "all">("all");

  const current = SUBJECT_CATALOG.find((s) => s.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUBJECT_CATALOG.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (!q) return true;
      return (
        s.labelDe.toLowerCase().includes(q) ||
        s.labelEn.toLowerCase().includes(q) ||
        s.id.includes(q)
      );
    });
  }, [query, category]);

  const mySubjects = SUBJECT_CATALOG.filter((s) => mySubjectIds.includes(s.id));

  const pick = (id: SubjectId) => {
    const s = SUBJECT_CATALOG.find((x) => x.id === id);
    if (!s) return;
    if (s.status === "preparing" && !allowPreparing) return;
    onChange(id);
    setOpen(false);
  };

  if (compact) {
    return (
      <select
        className={cn(
          "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white",
          className
        )}
        value={value}
        aria-label={i18n.subject.pick}
        onChange={(e) => pick(e.target.value)}
      >
        {SUBJECT_CATALOG.map((s) => (
          <option
            key={s.id}
            value={s.id}
            disabled={s.status === "preparing" && !allowPreparing}
          >
            {s.icon} {s.labelDe}
            {s.status === "preparing" ? ` (${i18n.subject.preparing})` : ""}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-left text-sm text-white hover:bg-white/5"
      >
        <span>
          {current?.icon} {current?.labelDe ?? i18n.subject.pick}
          {current?.status === "preparing" ? (
            <span className="ml-2 text-xs text-amber-300">
              {i18n.subject.preparing}
            </span>
          ) : null}
        </span>
        <span className="text-slate-500" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1526] shadow-xl"
        >
          <div className="border-b border-white/10 p-3 space-y-2">
            <label className="sr-only" htmlFor="subject-search">
              {i18n.subject.search}
            </label>
            <input
              id="subject-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={i18n.subject.search}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              <CatChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                label={i18n.subject.allCategories}
              />
              {(
                Object.keys(SUBJECT_CATEGORIES) as SubjectCategoryId[]
              ).map((id) => (
                <CatChip
                  key={id}
                  active={category === id}
                  onClick={() => setCategory(id)}
                  label={SUBJECT_CATEGORIES[id].labelDe}
                />
              ))}
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {mySubjects.length > 0 && !query && category === "all" && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-medium text-slate-400">
                  {i18n.subject.mySubjects}
                </p>
                {mySubjects.map((s) => (
                  <SubjectRow
                    key={`my-${s.id}`}
                    subject={s}
                    active={s.id === value}
                    disabled={s.status === "preparing" && !allowPreparing}
                    preparingLabel={i18n.subject.preparing}
                    onPick={pick}
                  />
                ))}
              </div>
            )}

            {(
              Object.keys(SUBJECT_CATEGORIES) as SubjectCategoryId[]
            ).map((catId) => {
              const items = filtered.filter((s) => s.category === catId);
              if (!items.length) return null;
              if (category !== "all" && category !== catId) return null;
              return (
                <div key={catId} className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-slate-400">
                    {SUBJECT_CATEGORIES[catId].labelDe}
                  </p>
                  {items.map((s) => (
                    <SubjectRow
                      key={s.id}
                      subject={s}
                      active={s.id === value}
                      disabled={s.status === "preparing" && !allowPreparing}
                      preparingLabel={i18n.subject.preparing}
                      onPick={pick}
                    />
                  ))}
                </div>
              );
            })}

            {!filtered.length && (
              <p className="px-3 py-6 text-center text-sm text-slate-400">
                {i18n.subject.noResults}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CatChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2 py-1 text-[11px]",
        active
          ? "bg-indigo-500/30 text-white"
          : "bg-white/5 text-slate-400 hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}

function SubjectRow({
  subject,
  active,
  disabled,
  preparingLabel,
  onPick,
}: {
  subject: (typeof SUBJECT_CATALOG)[number];
  active: boolean;
  disabled: boolean;
  preparingLabel: string;
  onPick: (id: SubjectId) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      disabled={disabled}
      onClick={() => onPick(subject.id)}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm",
        active ? "bg-indigo-500/20 text-white" : "text-slate-200 hover:bg-white/5",
        disabled && "cursor-not-allowed opacity-45"
      )}
    >
      <span aria-hidden>{subject.icon}</span>
      <span className="flex-1">{subject.labelDe}</span>
      {subject.status === "preparing" && (
        <span className="text-[10px] text-amber-300">{preparingLabel}</span>
      )}
    </button>
  );
}
