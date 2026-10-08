import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { analyzeRemainsDirective } from "./review";

// Mirrors `will/review.test.ts`'s `planWith` helper.
function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

// `documents.remainsDirective` is a namespace v2 never had, so `planWith`'s
// overlay cannot reach it; override the migrated plan's values directly.
function withInstructions(
  plan: Plan,
  overrides: Partial<Plan["documents"]["remainsDirective"]>
): Plan {
  return {
    ...plan,
    documents: {
      ...plan.documents,
      remainsDirective: { ...plan.documents.remainsDirective, ...overrides },
    },
  };
}

describe("analyzeRemainsDirective", () => {
  it("warns when no agent is named", () => {
    const plan = planWith({ remains: { agent: "", alternate: "" } });
    const ids = analyzeRemainsDirective(plan).map((a) => a.id);
    expect(ids).toContain("remains-agent-unset");
  });

  it("notes when an agent is named but no alternate", () => {
    const plan = planWith({ remains: { agent: "Robin", alternate: "" } });
    const advisories = analyzeRemainsDirective(plan);
    expect(advisories.map((a) => a.id)).toContain("remains-alternate-unset");
    expect(
      advisories.find((a) => a.id === "remains-alternate-unset")?.severity
    ).toBe("info");
  });

  it("raises nothing when both agent and alternate are named", () => {
    const plan = planWith({
      remains: { agent: "Robin", alternate: "Casey" },
    });
    expect(analyzeRemainsDirective(plan)).toEqual([]);
  });

  it("every advisory's path resolves against the plan", () => {
    const plan = planWith({ remains: { agent: "", alternate: "" } });
    for (const advisory of analyzeRemainsDirective(plan)) {
      expect(advisory.path.startsWith("fiduciaries.remains.")).toBe(true);
    }
  });

  it("warns when the wishes mention the opposite of the elected method", () => {
    const plan = withInstructions(
      planWith({
        remains: { agent: "A", alternate: "B", preference: "Cremation" },
      }),
      { method: "burial" }
    );
    const advisory = analyzeRemainsDirective(plan).find(
      (a) => a.id === "remains-preference-contradiction"
    );
    expect(advisory?.severity).toBe("info");
    expect(advisory?.path).toBe("fiduciaries.remains.preference");
  });

  it("does not warn when the wishes agree with, or no method is elected", () => {
    const remains = { agent: "A", alternate: "B", preference: "Burial" };
    const agrees = withInstructions(planWith({ remains }), {
      method: "burial",
    });
    const unset = withInstructions(planWith({ remains }), { method: "" });
    expect(analyzeRemainsDirective(agrees)).toEqual([]);
    expect(analyzeRemainsDirective(unset)).toEqual([]);
  });
});
