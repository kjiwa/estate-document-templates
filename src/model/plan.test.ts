import { describe, expect, it } from "vitest";

import { Plan } from "./plan";

describe("Plan schema", () => {
  it("applies BLANK_PROFILE-equivalent leaf defaults when every group is present but empty", () => {
    const plan = Plan.parse({
      id: "profile-1",
      label: "Profile 1",
      party: { testator: {}, spouse: {} },
      fiduciaries: {
        guardians: {},
        conservators: {},
        personalRepresentatives: {},
        trustees: {},
        remains: {},
      },
      execution: { executionDate: {}, notary: {} },
      documents: {
        will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
      },
    });
    expect(plan.party.testator.state).toBe("Washington");
    expect(plan.party.maritalStatus).toBe("married");
    expect(plan.party.children).toEqual([]);
    expect(plan.execution.witnesses).toHaveLength(2);
    expect(plan.documents.will.spousalGift).toBe("outright");
    expect(plan.documents.will.survivorshipDays).toBe(60);
    expect(plan.documents.will.communityPropertyAgreement.exists).toBe(false);
  });

  it("requires every group object to be present — group-level fields have no default", () => {
    // Documents `migrate.ts`'s reason for existing: `Plan.parse` alone
    // will not backfill a wholly absent `party`/`fiduciaries`/`execution`/
    // `documents` group, only the leaf fields inside a present group.
    const result = Plan.safeParse({ id: "profile-1", label: "Profile 1" });
    expect(result.success).toBe(false);
  });

  it("rejects children that are not an array", () => {
    const result = Plan.safeParse({
      id: "profile-1",
      label: "Profile 1",
      party: { children: "not-an-array" },
    });
    expect(result.success).toBe(false);
  });

  it("round-trips a fully populated plan", () => {
    const input = {
      id: "profile-1",
      label: "Profile 1",
      party: {
        testator: {
          name: "Jordan",
          gender: "male",
          county: "King",
          state: "WA",
        },
        maritalStatus: "unmarried",
        spouse: { name: "", gender: "" },
        children: ["Rowan"],
      },
      fiduciaries: {
        guardians: { primary: "A", alternate: "B" },
        conservators: { primary: "A", alternate: "B" },
        personalRepresentatives: { primary: "A", alternate: "B" },
        trustees: { primary: "A", alternate: "B" },
        remains: { agent: "A", alternate: "B", preference: "" },
      },
      execution: {
        city: "Tacoma",
        executionDate: { day: "1", month: "March", year: "2026" },
        witnesses: [{ name: "W1", address: "", cityStateZip: "" }],
        notary: { name: "", commissionExpires: "" },
      },
      documents: {
        will: {
          spousalGift: "outright",
          communityPropertyAgreement: { exists: false, date: "" },
          ultimateBeneficiary: { relationship: "", name: "", gender: "" },
          survivorshipDays: 60,
        },
      },
    };
    const plan = Plan.parse(input);
    expect(plan.execution.witnesses).toHaveLength(1);
    expect(plan.party.children).toEqual(["Rowan"]);
  });
});
