// One ordered traversal shared by Prev/Next, the panel, and the sheet: every
// field in a document's sections in declaration order, groups flattened,
// hidden sections skipped.
import { flattenFields } from "../ui/completion";
import type { Plan } from "../model/plan";
import type { FieldSpec, Section } from "./field-spec";

export type LeafFieldSpec = Exclude<FieldSpec, { kind: "group" }>;

export interface FieldEntry {
  field: LeafFieldSpec;
  section: Section;
  index: number;
}

export function sectionFields(section: Section): LeafFieldSpec[] {
  return flattenFields(section.fields) as LeafFieldSpec[];
}

export function orderedFields(plan: Plan, sections: Section[]): FieldEntry[] {
  const visible = sections.filter((section) => !section.hidden?.(plan));
  const entries: FieldEntry[] = [];
  let index = 0;
  for (const section of visible) {
    for (const field of sectionFields(section)) {
      entries.push({ field, section, index });
      index++;
    }
  }
  return entries;
}

export function findFieldByPath(
  plan: Plan,
  sections: Section[],
  path: string
): FieldEntry | undefined {
  return orderedFields(plan, sections).find(
    (entry) => entry.field.path === path
  );
}

// `collectRoleHolders` emits paths like `party.children.0` for a child role
// holder, one level deeper than the section registry's declared list field
// (`party.children`) goes. Tries the full path first, then each shorter
// dotted prefix, so an advisory on an array element still resolves to the
// field that renders it.
export function resolveFieldPath(
  plan: Plan,
  sections: Section[],
  path: string
): FieldEntry | undefined {
  const parts = path.split(".");
  for (let length = parts.length; length > 0; length--) {
    const entry = findFieldByPath(
      plan,
      sections,
      parts.slice(0, length).join(".")
    );
    if (entry) return entry;
  }
  return undefined;
}
