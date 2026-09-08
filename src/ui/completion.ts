import type { FieldSpec, Section } from "../form/field-spec";
import { toIsoDate, type StoredExecutionDate } from "../model/dates";
import { getPath } from "../model/paths";
import type { Plan } from "../model/plan";

export function flattenFields(fields: FieldSpec[]): FieldSpec[] {
  return fields.flatMap((field) =>
    field.kind === "group" ? flattenFields(field.fields) : [field]
  );
}

export function isFieldAnswered(plan: Plan, field: FieldSpec): boolean {
  if (field.kind === "group") {
    return flattenFields(field.fields).every((f) => isFieldAnswered(plan, f));
  }
  const value = getPath(plan, field.path);
  if (field.kind === "checkbox") return true;
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
  const fields = flattenFields(section.fields);
  const answered = fields.filter((f) => isFieldAnswered(plan, f)).length;
  const total = fields.length;
  const complete = section.complete
    ? section.complete(plan)
    : total > 0 && answered === total;
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
