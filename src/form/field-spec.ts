import type { Plan } from "../model/plan";
import type { Path } from "../model/paths";

export interface Option {
  value: string;
  label: string;
}

// A blank optional field never counts as unanswered. A predicate makes the
// field optional only while it holds, for fields the document prints only
// under some other field's value.
export type Optional = true | ((plan: Plan) => boolean);

export function isOptional(plan: Plan, field: FieldSpec): boolean {
  if (!("optional" in field) || field.optional === undefined) return false;
  return field.optional === true || field.optional(plan);
}

// A closed set of input kinds, not a plugin point — adding a kind means
// extending this union and every switch over it.
export type FieldSpec =
  | {
      kind: "text";
      path: Path<Plan>;
      label: string;
      hint?: string;
      optional?: Optional;
    }
  | { kind: "number"; path: Path<Plan>; label: string; min?: number }
  | { kind: "date"; path: Path<Plan>; label: string }
  | { kind: "executionDate"; path: Path<Plan>; label: string }
  | {
      kind: "select";
      path: Path<Plan>;
      label: string;
      options: readonly Option[];
      optional?: Optional;
    }
  | { kind: "checkbox"; path: Path<Plan>; label: string }
  | {
      kind: "list";
      path: Path<Plan>;
      label: string;
      addLabel: string;
      columns?: readonly { key: string; label: string }[];
      optional?: Optional;
    }
  | { kind: "group"; label: string; fields: FieldSpec[] };

export type GuidanceId = string;

export interface Section {
  id: string;
  legend: string;
  article?: string;
  guidance?: GuidanceId | readonly GuidanceId[];
  fields: FieldSpec[];
  hidden?: (plan: Plan) => boolean;
  complete?: (plan: Plan) => boolean;
}

// One step of the Execute flow (mockup 06: "signing day") — a title, lead
// copy, and the field paths it covers, resolved against the active
// document's sections through `resolveFieldPath`.
export interface ExecuteGroupDef {
  title: string;
  lead: string;
  paths: string[];
}
