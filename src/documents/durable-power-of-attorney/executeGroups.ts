import type { ExecuteGroupDef } from "../../form/field-spec";

export const DURABLE_POA_EXECUTE_GROUPS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when this Power of Attorney is being signed today.",
    paths: [
      "executions.durablePowerOfAttorney.city",
      "executions.durablePowerOfAttorney.executionDate",
    ],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the acknowledgment is notarized.",
    paths: [
      "executions.durablePowerOfAttorney.notary.name",
      "executions.durablePowerOfAttorney.notary.commissionExpires",
    ],
  },
];
