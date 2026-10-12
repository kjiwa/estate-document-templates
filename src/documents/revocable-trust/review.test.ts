import { describe, expect, it } from "vitest";

import { resolveFieldPath } from "../../form/registry";
import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { analyzeRevocableTrust } from "./review";
import { REVOCABLE_TRUST_SECTIONS } from "./sections";

function planWith(
  overrides: Partial<Plan["documents"]["revocableTrust"]> = {},
  party: Record<string, unknown> = {}
): Plan {
  const result = migrateProfile("profile-1", { label: "Profile 1", ...party });
  if (!result.success) throw new Error(result.error);
  const plan = result.plan;
  return {
    ...plan,
    documents: {
      ...plan.documents,
      revocableTrust: { ...plan.documents.revocableTrust, ...overrides },
    },
  };
}

const COMPLETE = planWith({
  scheduleA: ["Checking account at First Bank"],
  successorTrustees: { primary: "Casey Delacroix", alternate: "" },
  finalTaker: { relationship: "sister", name: "Robin", gender: "" },
});

describe("analyzeRevocableTrust", () => {
  it("raises nothing for a complete single trust", () => {
    expect(analyzeRevocableTrust(COMPLETE)).toEqual([]);
  });

  it("flags an empty Schedule A", () => {
    const plan = planWith({
      ...COMPLETE.documents.revocableTrust,
      scheduleA: [],
    });
    expect(analyzeRevocableTrust(plan).map((a) => a.id)).toEqual([
      "rt-schedule-a-empty",
    ]);
  });

  it("flags a missing successor trustee", () => {
    const plan = planWith({
      ...COMPLETE.documents.revocableTrust,
      successorTrustees: { primary: "", alternate: "" },
    });
    expect(analyzeRevocableTrust(plan).map((a) => a.id)).toEqual([
      "rt-no-successor-trustee",
    ]);
  });

  it("flags a missing final taker", () => {
    const plan = planWith({
      ...COMPLETE.documents.revocableTrust,
      finalTaker: { relationship: "", name: "", gender: "" },
    });
    expect(analyzeRevocableTrust(plan).map((a) => a.id)).toEqual([
      "rt-no-final-taker",
    ]);
  });

  it("flags a joint trust when the spouse name is blank", () => {
    const plan = planWith({
      ...COMPLETE.documents.revocableTrust,
      kind: "joint",
    });
    expect(analyzeRevocableTrust(plan).map((a) => a.id)).toEqual([
      "rt-joint-without-spouse",
    ]);
  });

  it("flags a joint trust when the marital status is unmarried", () => {
    const plan = planWith(
      { ...COMPLETE.documents.revocableTrust, kind: "joint" },
      { maritalStatus: "unmarried", spouse: { name: "Morgan" } }
    );
    expect(analyzeRevocableTrust(plan).map((a) => a.id)).toContain(
      "rt-joint-without-spouse"
    );
  });

  it("accepts a joint trust with a married spouse named", () => {
    const plan = planWith(
      { ...COMPLETE.documents.revocableTrust, kind: "joint" },
      { maritalStatus: "married", spouse: { name: "Morgan" } }
    );
    expect(analyzeRevocableTrust(plan)).toEqual([]);
  });

  it("every advisory's path resolves against the document's own sections", () => {
    const plan = planWith({ kind: "joint" });
    const advisories = analyzeRevocableTrust(plan);
    expect(advisories.length).toBe(4);
    for (const advisory of advisories) {
      expect(
        resolveFieldPath(plan, REVOCABLE_TRUST_SECTIONS, advisory.path)
      ).toBeDefined();
    }
  });
});
