import type { ExecuteGroupDef } from "../../form/field-spec";

// The Execute flow's groups for the directive. No notary group — this
// document uses the witness alternative RCW 70.122.030(1) offers, not
// notarization (see the child plan's Decision 3).
export const HEALTH_CARE_EXECUTE_GROUPS: ExecuteGroupDef[] = [
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
];
