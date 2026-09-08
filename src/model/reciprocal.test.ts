import { describe, expect, it } from "vitest";

import { migrateProfile } from "./migrate";
import type { Plan } from "./plan";
import { reciprocalPlan } from "./reciprocal";

function marriedPlan(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Jordan A. Whitfield",
    testator: {
      name: "Jordan A. Whitfield",
      gender: "male",
      county: "King",
      state: "Washington",
    },
    maritalStatus: "married",
    spouse: {
      name: "Taylor B. Whitfield",
      gender: "female",
    },
    children: ["Rowan C. Whitfield", "Sage D. Whitfield"],
    guardians: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
    conservators: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
    personalRepresentatives: {
      primary: "Jordan A. Whitfield",
      alternate: "Devin G. Okafor",
    },
    trustees: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
    remains: {
      agent: "Jordan A. Whitfield",
      alternate: "Devin G. Okafor",
      preference: "Cremation",
    },
    city: "Seattle",
    executionDate: { day: "1st", month: "September", year: "2026" },
    witnesses: [
      {
        name: "Alex H. Kowalski",
        address: "1 Main St",
        cityStateZip: "Seattle, WA 98101",
      },
      {
        name: "Sam I. Reyes",
        address: "2 Oak St",
        cityStateZip: "Seattle, WA 98102",
      },
    ],
    notary: { name: "Morgan J. Park", commissionExpires: "2028" },
    spousalGift: "outright",
    communityPropertyAgreement: { exists: true, date: "2020-01-01" },
    ultimateBeneficiary: {
      relationship: "sister",
      name: "Robin K. Whitfield",
      gender: "female",
    },
    survivorshipDays: 60,
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

describe("reciprocalPlan", () => {
  it("assigns the given id", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "label");
    expect(clone.id).toBe("plan-3");
  });

  it("uses the given label", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "Taylor B. Whitfield");
    expect(clone.label).toBe("Taylor B. Whitfield");
  });

  it("swaps testator and spouse name/gender", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.party.testator.name).toBe("Taylor B. Whitfield");
    expect(clone.party.testator.gender).toBe("female");
    expect(clone.party.spouse.name).toBe("Jordan A. Whitfield");
    expect(clone.party.spouse.gender).toBe("male");
  });

  it("leaves testator county/state and marital status alone", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.party.testator.county).toBe("King");
    expect(clone.party.testator.state).toBe("Washington");
    expect(clone.party.maritalStatus).toBe("married");
  });

  it("leaves children alone, never substituted", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.party.children).toEqual([
      "Rowan C. Whitfield",
      "Sage D. Whitfield",
    ]);
  });

  it("substitutes fiduciary names that match testator/spouse, leaving third parties alone", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    // Third-party guardian/conservator/trustee names are untouched.
    expect(clone.fiduciaries.guardians.primary).toBe("Casey E. Nolan");
    expect(clone.fiduciaries.guardians.alternate).toBe("Priya F. Iyer");
    expect(clone.fiduciaries.conservators.primary).toBe("Casey E. Nolan");
    expect(clone.fiduciaries.trustees.primary).toBe("Casey E. Nolan");
    // The PR primary was the old testator's own name — it substitutes to
    // the old spouse's name.
    expect(clone.fiduciaries.personalRepresentatives.primary).toBe(
      "Taylor B. Whitfield"
    );
    expect(clone.fiduciaries.personalRepresentatives.alternate).toBe(
      "Devin G. Okafor"
    );
    // The remains agent was the old testator's own name too.
    expect(clone.fiduciaries.remains.agent).toBe("Taylor B. Whitfield");
    expect(clone.fiduciaries.remains.alternate).toBe("Devin G. Okafor");
  });

  it("leaves the remains preference alone", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.fiduciaries.remains.preference).toBe("Cremation");
  });

  it("carries execution details over unchanged", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.execution.city).toBe("Seattle");
    expect(clone.execution.executionDate).toEqual({
      day: "1st",
      month: "September",
      year: "2026",
    });
    expect(clone.execution.notary).toEqual({
      name: "Morgan J. Park",
      commissionExpires: "2028",
    });
  });

  it("leaves witnesses alone even when a witness name matches the old testator or spouse", () => {
    const plan = marriedPlan({
      witnesses: [
        {
          name: "Jordan A. Whitfield",
          address: "1 Main St",
          cityStateZip: "Seattle, WA 98101",
        },
        {
          name: "Sam I. Reyes",
          address: "2 Oak St",
          cityStateZip: "Seattle, WA 98102",
        },
      ],
    });
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.execution.witnesses[0]?.name).toBe("Jordan A. Whitfield");
  });

  it("leaves the will document's non-beneficiary fields alone", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.documents.will.spousalGift).toBe("outright");
    expect(clone.documents.will.communityPropertyAgreement).toEqual({
      exists: true,
      date: "2020-01-01",
    });
    expect(clone.documents.will.survivorshipDays).toBe(60);
    expect(clone.documents.will.ultimateBeneficiary.relationship).toBe(
      "sister"
    );
  });

  it("leaves an unrelated ultimate beneficiary's name and gender alone", () => {
    const plan = marriedPlan();
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.documents.will.ultimateBeneficiary.name).toBe(
      "Robin K. Whitfield"
    );
    expect(clone.documents.will.ultimateBeneficiary.gender).toBe("female");
  });

  it("substitutes the ultimate beneficiary's name and follows it with the swapped party's gender", () => {
    const plan = marriedPlan({
      ultimateBeneficiary: {
        relationship: "spouse's sibling",
        name: "Jordan A. Whitfield",
        gender: "male",
      },
    });
    const clone = reciprocalPlan(plan, "plan-3", "x");
    expect(clone.documents.will.ultimateBeneficiary.name).toBe(
      "Taylor B. Whitfield"
    );
    expect(clone.documents.will.ultimateBeneficiary.gender).toBe("female");
  });
});
