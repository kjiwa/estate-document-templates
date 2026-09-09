import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { HEALTH_CARE_SECTIONS } from "./sections";
import { resolveFieldPath } from "../../form/registry";
import { analyzeHealthCareDirective } from "./review";

function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

// See `Body.test.tsx`'s comment: `documents.healthCareDirective` is a
// brand-new namespace `mapV2ToV3` never maps, so overriding the already-
// migrated plan's leaf values directly is how these tests reach it.
function withHealthCareDirective(
  plan: Plan,
  overrides: Partial<Plan["documents"]["healthCareDirective"]>
): Plan {
  return {
    ...plan,
    documents: {
      ...plan.documents,
      healthCareDirective: {
        ...plan.documents.healthCareDirective,
        ...overrides,
      },
    },
  };
}

const ALL_ELECTED = withHealthCareDirective(planWith(), {
  artificialNutrition: "doNot",
  artificialHydration: "doNot",
  cpr: "doNot",
});

describe("analyzeHealthCareDirective", () => {
  it("raises nothing once all three elections are decided and no witness is disqualified", () => {
    expect(analyzeHealthCareDirective(ALL_ELECTED)).toEqual([]);
  });

  it("flags each unset election by its own id", () => {
    const ids = analyzeHealthCareDirective(planWith()).map((a) => a.id);
    expect(ids).toContain("hcd-nutrition-unset");
    expect(ids).toContain("hcd-hydration-unset");
    expect(ids).toContain("hcd-cpr-unset");
  });

  it("does not flag an election once it is decided", () => {
    const plan = withHealthCareDirective(planWith(), {
      artificialNutrition: "do",
    });
    const ids = analyzeHealthCareDirective(plan).map((a) => a.id);
    expect(ids).not.toContain("hcd-nutrition-unset");
  });

  it("warns when a witness is also the spouse", () => {
    const plan = planWith({
      spouse: { name: "Taylor" },
      witnesses: [
        { name: "Taylor", address: "", cityStateZip: "" },
        { name: "", address: "", cityStateZip: "" },
      ],
    });
    const advisories = analyzeHealthCareDirective(plan);
    expect(advisories.map((a) => a.id)).toContain("hcd-disqualified-witness-0");
  });

  it("warns when a witness is also the will's ultimate beneficiary", () => {
    const plan = planWith({
      ultimateBeneficiary: { name: "Robin", relationship: "sister" },
      witnesses: [
        { name: "", address: "", cityStateZip: "" },
        { name: "Robin", address: "", cityStateZip: "" },
      ],
    });
    const advisories = analyzeHealthCareDirective(plan);
    expect(advisories.map((a) => a.id)).toContain("hcd-disqualified-witness-1");
  });

  it("does not warn about a witness with no matching role", () => {
    const plan = planWith({
      spouse: { name: "Taylor" },
      witnesses: [
        { name: "Jordan", address: "", cityStateZip: "" },
        { name: "", address: "", cityStateZip: "" },
      ],
    });
    const advisories = analyzeHealthCareDirective(plan);
    expect(
      advisories.filter((a) => a.id.startsWith("hcd-disqualified-witness"))
    ).toEqual([]);
  });

  it("every advisory's path resolves against the document's own sections", () => {
    const plan = planWith({
      witnesses: [
        { name: "", address: "", cityStateZip: "" },
        { name: "", address: "", cityStateZip: "" },
      ],
    });
    for (const advisory of analyzeHealthCareDirective(plan)) {
      expect(
        resolveFieldPath(plan, HEALTH_CARE_SECTIONS, advisory.path)
      ).toBeDefined();
    }
  });
});
