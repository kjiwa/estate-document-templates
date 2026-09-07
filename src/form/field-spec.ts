import type { Plan } from "../model/plan";
import type { Path } from "../model/paths";

export interface Option {
  value: string;
  label: string;
}

// A closed set of input kinds, not a plugin point — adding a kind means
// extending this union and every switch over it.
export type FieldSpec =
  | { kind: "text"; path: Path<Plan>; label: string; hint?: string }
  | { kind: "number"; path: Path<Plan>; label: string; min?: number }
  | { kind: "date"; path: Path<Plan>; label: string }
  | {
      kind: "select";
      path: Path<Plan>;
      label: string;
      options: readonly Option[];
    }
  | { kind: "checkbox"; path: Path<Plan>; label: string }
  | { kind: "list"; path: Path<Plan>; label: string; addLabel: string }
  | { kind: "group"; label: string; fields: FieldSpec[] };

export type GuidanceId = string;

export interface Section {
  id: string;
  legend: string;
  article?: string;
  guidance?: GuidanceId;
  fields: FieldSpec[];
  hidden?: (plan: Plan) => boolean;
  complete?: (plan: Plan) => boolean;
}
