import type { ExecuteGroupDef } from "../../form/field-spec";

// The Execute flow's groups for the directive, mirroring
// `will/executeGroups.ts`'s pattern and over its own
// `executions.remainsDirective.*` record. The Execute flow can copy the
// record from a document signed at the same appointment.
export const DIRECTIVE_EXECUTE_GROUPS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when this Directive is being signed today.",
    paths: [
      "executions.remainsDirective.city",
      "executions.remainsDirective.executionDate",
    ],
  },
  {
    title: "Witness one",
    lead: "Have your first witness fill in their own name and address.",
    paths: [
      "executions.remainsDirective.witnesses.0.name",
      "executions.remainsDirective.witnesses.0.address",
      "executions.remainsDirective.witnesses.0.cityStateZip",
    ],
  },
  {
    title: "Witness two",
    lead: "Have your second witness fill in their own name and address.",
    paths: [
      "executions.remainsDirective.witnesses.1.name",
      "executions.remainsDirective.witnesses.1.address",
      "executions.remainsDirective.witnesses.1.cityStateZip",
    ],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the acknowledgment is notarized.",
    paths: [
      "executions.remainsDirective.notary.name",
      "executions.remainsDirective.notary.commissionExpires",
    ],
  },
];
