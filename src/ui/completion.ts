import type { DocumentDefinition } from "../documents/registry";
import { isOptional, type FieldSpec, type Section } from "../form/field-spec";
import { resolveFieldPath, type LeafFieldSpec } from "../form/registry";
import { toIsoDate, type StoredExecutionDate } from "../model/dates";
import { getPath } from "../model/paths";
import type { Plan } from "../model/plan";

export function flattenFields(fields: FieldSpec[]): FieldSpec[] {
  return fields.flatMap((field) =>
    field.kind === "group" ? flattenFields(field.fields) : [field]
  );
}

export function isRequired(plan: Plan, field: FieldSpec): boolean {
  return (
    field.kind !== "group" &&
    field.kind !== "checkbox" &&
    !isOptional(plan, field)
  );
}

export function isFieldAnswered(plan: Plan, field: FieldSpec): boolean {
  if (field.kind === "group") {
    return flattenFields(field.fields).every((f) => isFieldAnswered(plan, f));
  }
  if (field.kind === "checkbox") return true;
  if (isOptional(plan, field)) return true;
  return hasValue(plan, field);
}

export function hasValue(plan: Plan, field: LeafFieldSpec): boolean {
  const value = getPath(plan, field.path);
  if (field.kind === "checkbox") return false;
  if (field.kind === "list") {
    return Array.isArray(value) && value.length > 0;
  }
  if (field.kind === "executionDate") {
    const stored = (value ?? {}) as Partial<StoredExecutionDate>;
    return (
      toIsoDate({
        day: stored.day ?? "",
        month: stored.month ?? "",
        year: stored.year ?? "",
      }) !== ""
    );
  }
  if (typeof value === "number") return true;
  return typeof value === "string" && value.trim() !== "";
}

// A section's own `complete` overrides the field-derived count when present
// — some sections' "done" state depends on cross-field logic no per-field
// scan can express (e.g. a spousal-gift section only some of whose fields
// apply, depending on another field's value).
export function sectionCompletion(
  plan: Plan,
  section: Section
): { answered: number; total: number; complete: boolean } {
  const fields = flattenFields(section.fields).filter((f) =>
    isRequired(plan, f)
  );
  const answered = fields.filter((f) => isFieldAnswered(plan, f)).length;
  const total = fields.length;
  const complete = section.complete
    ? section.complete(plan)
    : answered === total;
  return { answered, total, complete };
}

export function documentCompletion(
  plan: Plan,
  sections: Section[]
): { answered: number; total: number } {
  const visibleSections = sections.filter((s) => !s.hidden?.(plan));
  return visibleSections.reduce(
    (acc, section) => {
      const { answered, total } = sectionCompletion(plan, section);
      return { answered: acc.answered + answered, total: acc.total + total };
    },
    { answered: 0, total: 0 }
  );
}

export type SectionState = "done" | "open" | "blank-optional";

export function sectionState(plan: Plan, section: Section): SectionState {
  const { total, complete } = sectionCompletion(plan, section);
  if (!complete) return "open";
  const leaves = flattenFields(section.fields) as LeafFieldSpec[];
  if (total === 0 && !leaves.some((f) => hasValue(plan, f))) {
    return "blank-optional";
  }
  return "done";
}

export type ReadinessStage = "in-progress" | "ready-to-sign" | "ready-to-print";

export const STAGE_LABELS: Record<ReadinessStage, string> = {
  "in-progress": "In progress",
  "ready-to-sign": "Ready to sign",
  "ready-to-print": "Ready to print",
};

export interface DocumentReadiness {
  stage: ReadinessStage;
  content: { answered: number; total: number };
  signing: { answered: number; total: number };
  blankOptionalSections: Section[];
  remainingSigningGroups: string[];
}

function tally(
  plan: Plan,
  fields: LeafFieldSpec[]
): { answered: number; total: number } {
  return {
    answered: fields.filter((f) => isFieldAnswered(plan, f)).length,
    total: fields.length,
  };
}

function signingPathSet(plan: Plan, document: DocumentDefinition): Set<string> {
  return new Set(
    document.executeGroups.flatMap((group) =>
      group.paths.flatMap((path) => {
        const entry = resolveFieldPath(plan, document.sections, path);
        return entry ? [entry.field.path] : [];
      })
    )
  );
}

function remainingGroupTitles(
  plan: Plan,
  document: DocumentDefinition
): string[] {
  return document.executeGroups
    .filter((group) =>
      group.paths.some((path) => {
        const entry = resolveFieldPath(plan, document.sections, path);
        return entry && !isFieldAnswered(plan, entry.field);
      })
    )
    .map((group) => group.title);
}

function readinessStage(
  content: { answered: number; total: number },
  remaining: string[]
): ReadinessStage {
  if (content.answered < content.total) return "in-progress";
  return remaining.length > 0 ? "ready-to-sign" : "ready-to-print";
}

export function documentReadiness(
  plan: Plan,
  document: DocumentDefinition
): DocumentReadiness {
  const visible = document.sections.filter((s) => !s.hidden?.(plan));
  const required = visible
    .flatMap((s) => flattenFields(s.fields) as LeafFieldSpec[])
    .filter((f) => isRequired(plan, f));
  const signingPaths = signingPathSet(plan, document);
  const content = tally(
    plan,
    required.filter((f) => !signingPaths.has(f.path))
  );
  const signing = tally(
    plan,
    required.filter((f) => signingPaths.has(f.path))
  );
  const remainingSigningGroups = remainingGroupTitles(plan, document);
  return {
    stage: readinessStage(content, remainingSigningGroups),
    content,
    signing,
    blankOptionalSections: visible.filter(
      (s) => sectionState(plan, s) === "blank-optional"
    ),
    remainingSigningGroups,
  };
}
