import type { ExecuteGroupDef } from "../../form/field-spec";

export const REVOCABLE_TRUST_EXECUTE_GROUPS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when this Trust is being signed today.",
    paths: [
      "executions.revocableTrust.city",
      "executions.revocableTrust.executionDate",
    ],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the acknowledgment is notarized.",
    paths: [
      "executions.revocableTrust.notary.name",
      "executions.revocableTrust.notary.commissionExpires",
    ],
  },
];
