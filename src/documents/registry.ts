import type { ComponentType } from "preact";

import { generateAttorneyMemo } from "../export/attorneyMemo";
import type { ExecuteGroupDef, Section } from "../form/field-spec";
import type { Advisory } from "../model/advisory";
import type { Plan } from "../model/plan";
import type { GuidanceEntry } from "./shared/guidance";
import { Body as RemainsDirectiveBody } from "./remains-directive/Body";
import { DIRECTIVE_EXECUTE_GROUPS } from "./remains-directive/executeGroups";
import { DIRECTIVE_GUIDANCE } from "./remains-directive/guidance";
import { analyzeDirective } from "./remains-directive/review";
import { DIRECTIVE_SECTIONS } from "./remains-directive/sections";
import { Body } from "./will/Body";
import { WILL_EXECUTE_GROUPS } from "./will/executeGroups";
import { GUIDANCE } from "./will/guidance";
import { analyzeProfile } from "./will/review";
import { WILL_SECTIONS } from "./will/sections";

export interface DocumentDefinition {
  id: string;
  title: string;
  // The noun the instrument uses for its own signer — "Testator" for the
  // will, "Declarant" for the remains directive. Needed outside the
  // document body itself (the print checklist's page-footer initials
  // prompt), so it lives on the registry rather than only inside `Body`.
  roleNoun: string;
  statutes: readonly string[];
  sections: Section[];
  guidance: Record<string, GuidanceEntry>;
  executeGroups: ExecuteGroupDef[];
  Body: ComponentType;
  review: (plan: Plan) => Advisory[];
  // Optional: not every document has an attorney memo. `attorneyMemo.ts`
  // stays will-specific behind this indirection rather than being forced
  // generic before a second caller needs it to be.
  memo?: (plan: Plan) => string;
}

const WILL_STATUTES = [
  "RCW 6.32.250",
  "RCW 11.02.005",
  "RCW 11.12.020",
  "RCW 11.12.091",
  "RCW 11.12.160",
  "RCW 11.12.260",
  "RCW 11.120.070",
  "RCW 11.130.010",
  "RCW 11.20.020",
  "RCW 11.28.120",
  "RCW 11.36.010",
  "RCW 11.68.011",
  "RCW 11.86.031",
  "RCW 11.98.039",
  "RCW 11.98.070",
  "RCW 26.16.030",
  "RCW 26.16.120",
  "RCW 42.45.130",
  "RCW 68.50.160",
];

const DIRECTIVE_STATUTES = ["RCW 11.20.020", "RCW 42.45.130", "RCW 68.50.160"];

export const DOCUMENTS: DocumentDefinition[] = [
  {
    id: "will",
    title: "Last Will and Testament",
    roleNoun: "Testator",
    statutes: WILL_STATUTES,
    sections: WILL_SECTIONS,
    guidance: GUIDANCE,
    executeGroups: WILL_EXECUTE_GROUPS,
    Body,
    review: analyzeProfile,
    memo: generateAttorneyMemo,
  },
  {
    id: "remains-directive",
    title: "Disposition of Remains Directive",
    roleNoun: "Declarant",
    statutes: DIRECTIVE_STATUTES,
    sections: DIRECTIVE_SECTIONS,
    guidance: DIRECTIVE_GUIDANCE,
    executeGroups: DIRECTIVE_EXECUTE_GROUPS,
    Body: RemainsDirectiveBody,
    review: analyzeDirective,
  },
];
