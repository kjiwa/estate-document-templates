import type { ExecuteGroupDef } from "../../form/field-spec";

// The Execute flow's four groups (mockup 06: "signing day"), as field paths
// resolved against `WILL_SECTIONS` through `resolveFieldPath` — labels and
// hints come from the one registry rather than being retyped. Moved
// verbatim from `src/ui/execute.ts`, unchanged, when a second document
// needed its own group list.
export const WILL_EXECUTE_GROUPS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when the will is being signed today.",
    paths: ["executions.will.city", "executions.will.executionDate"],
  },
  {
    title: "Witness one",
    lead: "Have your first witness fill in their own name and address.",
    paths: [
      "executions.will.witnesses.0.name",
      "executions.will.witnesses.0.address",
      "executions.will.witnesses.0.cityStateZip",
    ],
  },
  {
    title: "Witness two",
    lead: "Have your second witness fill in their own name and address.",
    paths: [
      "executions.will.witnesses.1.name",
      "executions.will.witnesses.1.address",
      "executions.will.witnesses.1.cityStateZip",
    ],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the self-proving affidavit is notarized.",
    paths: [
      "executions.will.notary.name",
      "executions.will.notary.commissionExpires",
    ],
  },
];
