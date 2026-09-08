import { describe, expect, it } from "vitest";

import { migrateProfile } from "./migrate";
import type { Plan } from "./plan";
import { getPath, setPath } from "./paths";

function blankPlan(): Plan {
  const result = migrateProfile("profile-1", { label: "Profile 1" });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

describe("paths", () => {
  it("reads a nested scalar path", () => {
    const plan = blankPlan();
    expect(getPath(plan, "party.testator.state")).toBe("Washington");
  });

  it("reads an array element by numeric path segment", () => {
    const plan = blankPlan();
    expect(getPath(plan, "execution.witnesses.0.name")).toBe("");
  });

  it("returns undefined past a missing branch", () => {
    const plan = blankPlan();
    expect(getPath(plan, "execution.witnesses.5.name")).toBeUndefined();
  });

  it("sets a nested scalar without mutating the source", () => {
    const plan = blankPlan();
    const updated = setPath(plan, "party.testator.name", "Jordan");
    expect(updated.party.testator.name).toBe("Jordan");
    expect(plan.party.testator.name).toBe("");
    expect(updated).not.toBe(plan);
  });

  it("sets an array element without mutating sibling elements", () => {
    const plan = blankPlan();
    const updated = setPath(plan, "execution.witnesses.0.name", "Alex");
    expect(updated.execution.witnesses[0]?.name).toBe("Alex");
    expect(updated.execution.witnesses[1]?.name).toBe("");
    expect(plan.execution.witnesses[0]?.name).toBe("");
  });
});
