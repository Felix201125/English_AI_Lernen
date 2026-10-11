/**
 * Fachstruktur Qestra — Katalog + Hilfsfunktionen.
 * Phase 1: Englisch mit Inhalten; andere Fächer sichtbar/buchbar, Inhalte „in Vorbereitung“.
 */

export type {
  SubjectCategoryId,
  SubjectDefinition,
  SubjectGradeBand,
  SubjectId,
  SubjectSkillAxis,
  SubjectStatus,
} from "./catalog";

export {
  DEFAULT_SUBJECT_ID,
  SUBJECT_CATALOG,
  SUBJECT_CATEGORIES,
  bookableSubjects,
  getSubject,
  getSubjectCatalog,
  selectableSubjects,
} from "./catalog";

import {
  SUBJECT_CATALOG,
  getSubject as getSubjectDef,
  type SubjectDefinition,
  type SubjectId,
} from "./catalog";

/** @deprecated Kompatibilität — nutze SUBJECT_CATALOG */
export const SUBJECTS: Record<string, SubjectDefinition> = Object.fromEntries(
  SUBJECT_CATALOG.map((s) => [s.id, s])
);

export function activeSubjects(): SubjectDefinition[] {
  return SUBJECT_CATALOG.filter((s) => s.status === "active");
}

export function plannedSubjects(): SubjectDefinition[] {
  return SUBJECT_CATALOG.filter((s) => s.status === "preparing");
}

export function isSubjectSelectable(id: SubjectId): boolean {
  return getSubjectDef(id).status === "active";
}

export function isSubjectBookable(id: SubjectId): boolean {
  return getSubjectDef(id).bookable;
}
