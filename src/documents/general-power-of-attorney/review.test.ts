import { describe, expect, it } from "vitest";

import { resolveFieldPath } from "../../form/registry";
import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { analyzeGeneralPowerOfAttorney } from "./review";
import { GENERAL_POA_SECTIONS } from "./sections";

function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

function withAgent(plan: Plan, primary: string): Plan {
  return {
    ...plan,
    fiduciaries: {
      ...plan.fiduciaries,
      attorneysInFact: { ...plan.fiduciaries.attorneysInFact, primary },
    },
  };
}

describe("analyzeGeneralPowerOfAttorney", () => {
  it("warns when no attorney-in-fact is named", () => {
    const advisories = analyzeGeneralPowerOfAttorney(planWith());
    expect(advisories.map((a) => a.id)).toEqual(["gpoa-agent-unset"]);
    expect(advisories[0]!.severity).toBe("warning");
  });

  it("warns when the attorney-in-fact is the principal, ignoring case and spacing", () => {
    const plan = withAgent(
      planWith({ testator: { name: "Alex Rivera" } }),
      "  alex RIVERA "
    );
    expect(analyzeGeneralPowerOfAttorney(plan).map((a) => a.id)).toEqual([
      "gpoa-agent-is-principal",
    ]);
  });

  it("raises nothing for a distinct named attorney-in-fact", () => {
    const plan = withAgent(
      planWith({ testator: { name: "Alex Rivera" } }),
      "Jordan Lee"
    );
    expect(analyzeGeneralPowerOfAttorney(plan)).toEqual([]);
  });

  it("every advisory's path resolves against the document's own sections", () => {
    const plans = [
      planWith(),
      withAgent(planWith({ testator: { name: "Alex" } }), "Alex"),
    ];
    for (const plan of plans) {
      const advisories = analyzeGeneralPowerOfAttorney(plan);
      expect(advisories.length).toBeGreaterThan(0);
      for (const advisory of advisories) {
        expect(
          resolveFieldPath(plan, GENERAL_POA_SECTIONS, advisory.path)
        ).toBeDefined();
      }
    }
  });
});
