import type { ComponentType } from "preact";

import { generateAttorneyMemo } from "../export/attorneyMemo";
import type { Section } from "../form/field-spec";
import type { Plan } from "../model/plan";
import { Body } from "./will/Body";
import { analyzeProfile, type Advisory } from "./will/review";
import { WILL_SECTIONS } from "./will/sections";

export interface DocumentDefinition {
  id: string;
  title: string;
  statutes: readonly string[];
  sections: Section[];
  Body: ComponentType;
  review: (plan: Plan) => Advisory[];
  memo: (plan: Plan) => string;
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

export const DOCUMENTS: DocumentDefinition[] = [
  {
    id: "will",
    title: "Last Will and Testament",
    statutes: WILL_STATUTES,
    sections: WILL_SECTIONS,
    Body,
    review: analyzeProfile,
    memo: generateAttorneyMemo,
  },
];
