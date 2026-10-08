import { describe, expect, it } from "vitest";

import { resolveFieldPath } from "../../form/registry";
import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { analyzeDurablePowerOfAttorney } from "./review";
import { DURABLE_POA_SECTIONS } from "./sections";

function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

function withAgents(plan: Plan, primary: string, alternate: string): Plan {
  return {
    ...plan,
    fiduciaries: {
      ...plan.fiduciaries,
      attorneysInFact: { primary, alternate },
    },
  };
}

function ids(plan: Plan): string[] {
  return analyzeDurablePowerOfAttorney(plan).map((a) => a.id);
}

describe("analyzeDurablePowerOfAttorney", () => {
  it("warns when no attorney-in-fact is named", () => {
    const advisories = analyzeDurablePowerOfAttorney(planWith());
    expect(advisories.map((a) => a.id)).toEqual(["dpoa-agent-unset"]);
    expect(advisories[0]!.severity).toBe("warning");
  });

  it("warns when the primary is the principal, ignoring case and spacing", () => {
    const plan = withAgents(
      planWith({ testator: { name: "Alex Rivera" } }),
      "  alex RIVERA ",
      ""
    );
    expect(ids(plan)).toEqual(["dpoa-agent-is-principal"]);
  });

  it("warns when the alternate equals the primary", () => {
    const plan = withAgents(
      planWith({ testator: { name: "Alex Rivera" } }),
      "Jordan Lee",
      " jordan LEE "
    );
    expect(ids(plan)).toEqual(["dpoa-alternate-equals-primary"]);
  });

  it("raises nothing for distinct primary and alternate, or no alternate", () => {
    const base = planWith({ testator: { name: "Alex Rivera" } });
    expect(ids(withAgents(base, "Jordan Lee", "Sam Park"))).toEqual([]);
    expect(ids(withAgents(base, "Jordan Lee", ""))).toEqual([]);
  });

  it("every advisory's path resolves against the document's own sections", () => {
    const base = planWith({ testator: { name: "Alex" } });
    const plans = [
      planWith(),
      withAgents(base, "Alex", "Alex"),
      withAgents(base, "Jordan", "Jordan"),
    ];
    for (const plan of plans) {
      const advisories = analyzeDurablePowerOfAttorney(plan);
      expect(advisories.length).toBeGreaterThan(0);
      for (const advisory of advisories) {
        expect(
          resolveFieldPath(plan, DURABLE_POA_SECTIONS, advisory.path)
        ).toBeDefined();
      }
    }
  });
});
