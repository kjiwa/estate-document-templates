import type { ExecuteGroupDef } from "../../form/field-spec";

// The Execute flow's groups for the directive, mirroring
// `will/executeGroups.ts`'s pattern and reusing the same `execution.*`
// paths — this document is typically signed at the same appointment as the
// will, using the same witnesses and notary.
export const DIRECTIVE_EXECUTE_GROUPS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when this Directive is being signed today.",
    paths: ["execution.city", "execution.executionDate"],
  },
  {
    title: "Witness one",
    lead: "Have your first witness fill in their own name and address.",
    paths: [
      "execution.witnesses.0.name",
      "execution.witnesses.0.address",
      "execution.witnesses.0.cityStateZip",
    ],
  },
  {
    title: "Witness two",
    lead: "Have your second witness fill in their own name and address.",
    paths: [
      "execution.witnesses.1.name",
      "execution.witnesses.1.address",
      "execution.witnesses.1.cityStateZip",
    ],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the acknowledgment is notarized.",
    paths: ["execution.notary.name", "execution.notary.commissionExpires"],
  },
];
