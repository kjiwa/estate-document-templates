import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { analyzeProfile } from "./review";

// Fixtures go through `migrateProfile` with v2-shaped overlays, since
// `Plan.parse` requires every group object present — see
// `model/plan.test.ts`'s note on that contract.
function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

describe("analyzeProfile", () => {
  it("flags an interested witness (id family interested-witness-N)", () => {
    const plan = planWith({
      spouse: { name: "Taylor" },
      witnesses: [{ name: "Taylor", address: "", cityStateZip: "" }],
    });
    const ids = analyzeProfile(plan).map((a) => a.id);
    expect(ids).toContain("interested-witness-0");
  });

  it("flags multiple roles held by one person (id family multi-role-NAME)", () => {
    const plan = planWith({
      spouse: { name: "Taylor" },
      personalRepresentatives: { primary: "Taylor", alternate: "" },
    });
    const ids = analyzeProfile(plan).map((a) => a.id);
    expect(ids).toContain("multi-role-taylor");
  });

  it("flags a trustee who is also a beneficiary", () => {
    const plan = planWith({
      trustees: { primary: "Robin", alternate: "" },
      ultimateBeneficiary: {
        relationship: "sister",
        name: "Robin",
        gender: "",
      },
    });
    const ids = analyzeProfile(plan).map((a) => a.id);
    expect(ids).toContain("trustee-is-beneficiary");
  });

  it("flags a missing alternate for each fiduciary office", () => {
    const plan = planWith({
      guardians: { primary: "A", alternate: "" },
      conservators: { primary: "B", alternate: "" },
      personalRepresentatives: { primary: "C", alternate: "" },
      trustees: { primary: "D", alternate: "" },
    });
    const ids = analyzeProfile(plan).map((a) => a.id);
    expect(ids).toContain("no-alternate-guardians");
    expect(ids).toContain("no-alternate-conservators");
    expect(ids).toContain("no-alternate-personalRepresentatives");
    expect(ids).toContain("no-alternate-trustees");
  });

  it("flags an unset execution date", () => {
    const ids = analyzeProfile(planWith()).map((a) => a.id);
    expect(ids).toContain("execution-date-unset");
  });

  it("flags an empty children list", () => {
    const ids = analyzeProfile(planWith()).map((a) => a.id);
    expect(ids).toContain("children-empty");
  });

  it("flags married with no spouse named", () => {
    const ids = analyzeProfile(planWith()).map((a) => a.id);
    expect(ids).toContain("married-no-spouse-name");
  });

  it("does not flag missing spouse name when unmarried", () => {
    const ids = analyzeProfile(planWith({ maritalStatus: "unmarried" })).map(
      (a) => a.id
    );
    expect(ids).not.toContain("married-no-spouse-name");
  });

  it("flags a disclaimer trust with no trustee", () => {
    const ids = analyzeProfile(
      planWith({ spousalGift: "disclaimerTrust" })
    ).map((a) => a.id);
    expect(ids).toContain("disclaimer-trust-no-trustee");
  });

  it("attaches a Path<Plan> to every advisory", () => {
    const advisories = analyzeProfile(planWith());
    expect(advisories.length).toBeGreaterThan(0);
    for (const advisory of advisories) {
      expect(typeof advisory.path).toBe("string");
      expect(advisory.path.length).toBeGreaterThan(0);
    }
  });
});
