import type { ExecuteGroupDef } from "../../form/field-spec";

export const GENERAL_POA_EXECUTE_GROUPS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when this Power of Attorney is being signed today.",
    paths: ["execution.city", "execution.executionDate"],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the acknowledgment is notarized.",
    paths: ["execution.notary.name", "execution.notary.commissionExpires"],
  },
];
