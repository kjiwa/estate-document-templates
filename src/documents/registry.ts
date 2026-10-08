import type { ComponentType } from "preact";

import { generateAttorneyMemo } from "../export/attorneyMemo";
import type { ExecuteGroupDef, Section } from "../form/field-spec";
import type { Advisory } from "../model/advisory";
import type { Plan } from "../model/plan";
import type { GuidanceEntry } from "./shared/guidance";
import { Body as DurablePowerOfAttorneyBody } from "./durable-power-of-attorney/Body";
import { DURABLE_POA_EXECUTE_GROUPS } from "./durable-power-of-attorney/executeGroups";
import { DURABLE_POA_GUIDANCE } from "./durable-power-of-attorney/guidance";
import { analyzeDurablePowerOfAttorney } from "./durable-power-of-attorney/review";
import { DURABLE_POA_SECTIONS } from "./durable-power-of-attorney/sections";
import { Body as GeneralPowerOfAttorneyBody } from "./general-power-of-attorney/Body";
import { GENERAL_POA_EXECUTE_GROUPS } from "./general-power-of-attorney/executeGroups";
import { GENERAL_POA_GUIDANCE } from "./general-power-of-attorney/guidance";
import { analyzeGeneralPowerOfAttorney } from "./general-power-of-attorney/review";
import { GENERAL_POA_SECTIONS } from "./general-power-of-attorney/sections";
import { Body as HealthCareDirectiveBody } from "./health-care-directive/Body";
import { HEALTH_CARE_EXECUTE_GROUPS } from "./health-care-directive/executeGroups";
import { HEALTH_CARE_GUIDANCE } from "./health-care-directive/guidance";
import { analyzeHealthCareDirective } from "./health-care-directive/review";
import { HEALTH_CARE_SECTIONS } from "./health-care-directive/sections";
import { Body as RemainsDirectiveBody } from "./remains-directive/Body";
import { DIRECTIVE_EXECUTE_GROUPS } from "./remains-directive/executeGroups";
import { DIRECTIVE_GUIDANCE } from "./remains-directive/guidance";
import { analyzeRemainsDirective } from "./remains-directive/review";
import { DIRECTIVE_SECTIONS } from "./remains-directive/sections";
import { Body } from "./will/Body";
import { WILL_EXECUTE_GROUPS } from "./will/executeGroups";
import { GUIDANCE } from "./will/guidance";
import { analyzeWill } from "./will/review";
import { WILL_SECTIONS } from "./will/sections";

export interface DocumentDefinition {
  id: string;
  title: string;
  // The noun the instrument uses for its own signer — "Testator" for the
  // will, "Declarant" for the remains directive. Needed outside the
  // document body itself (the print checklist's page-footer initials
  // prompt), so it lives on the registry rather than only inside `Body`.
  roleNoun: string;
  executionKey: keyof Plan["executions"];
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

export const DOCUMENTS: DocumentDefinition[] = [
  {
    id: "will",
    title: "Last Will and Testament",
    roleNoun: "Testator",
    executionKey: "will",
    sections: WILL_SECTIONS,
    guidance: GUIDANCE,
    executeGroups: WILL_EXECUTE_GROUPS,
    Body,
    review: analyzeWill,
    memo: generateAttorneyMemo,
  },
  {
    id: "remains-directive",
    title: "Disposition of Remains Directive",
    roleNoun: "Declarant",
    executionKey: "remainsDirective",
    sections: DIRECTIVE_SECTIONS,
    guidance: DIRECTIVE_GUIDANCE,
    executeGroups: DIRECTIVE_EXECUTE_GROUPS,
    Body: RemainsDirectiveBody,
    review: analyzeRemainsDirective,
  },
  {
    id: "health-care-directive",
    title: "Health Care Directive",
    roleNoun: "Declarer",
    executionKey: "healthCareDirective",
    sections: HEALTH_CARE_SECTIONS,
    guidance: HEALTH_CARE_GUIDANCE,
    executeGroups: HEALTH_CARE_EXECUTE_GROUPS,
    Body: HealthCareDirectiveBody,
    review: analyzeHealthCareDirective,
  },
  {
    id: "general-power-of-attorney",
    title: "General Power of Attorney",
    roleNoun: "Principal",
    executionKey: "generalPowerOfAttorney",
    sections: GENERAL_POA_SECTIONS,
    guidance: GENERAL_POA_GUIDANCE,
    executeGroups: GENERAL_POA_EXECUTE_GROUPS,
    Body: GeneralPowerOfAttorneyBody,
    review: analyzeGeneralPowerOfAttorney,
  },
  {
    id: "durable-power-of-attorney",
    title: "Durable Power of Attorney",
    roleNoun: "Principal",
    executionKey: "durablePowerOfAttorney",
    sections: DURABLE_POA_SECTIONS,
    guidance: DURABLE_POA_GUIDANCE,
    executeGroups: DURABLE_POA_EXECUTE_GROUPS,
    Body: DurablePowerOfAttorneyBody,
    review: analyzeDurablePowerOfAttorney,
  },
];
