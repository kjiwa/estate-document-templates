import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { countWord, formatList, isMarried, isSpouse } from "./Body";

// Fixtures go through `migrateProfile` with v2-shaped overlays (the same
// shape `mapV2ToV3` expects), since `Plan.parse` itself requires every
// group object present — see `model/plan.test.ts`'s note on that contract.
function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

describe("countWord", () => {
  it("spells out zero through ten", () => {
    expect(countWord(0)).toBe("no");
    expect(countWord(1)).toBe("one");
    expect(countWord(10)).toBe("ten");
  });

  it("falls back to the numeral past ten", () => {
    expect(countWord(11)).toBe("11");
  });
});

describe("formatList", () => {
  it("handles zero, one, two, and three-or-more items", () => {
    expect(formatList([])).toBe("");
    expect(formatList(["Rowan"])).toBe("Rowan");
    expect(formatList(["Rowan", "Sage"])).toBe("Rowan and Sage");
    expect(formatList(["Rowan", "Sage", "Wren"])).toBe("Rowan, Sage, and Wren");
  });
});

describe("isMarried", () => {
  it("defaults to married for an absent or unrecognized status", () => {
    expect(isMarried(planWith())).toBe(true);
  });

  it("is false only when maritalStatus is exactly unmarried", () => {
    expect(isMarried(planWith({ maritalStatus: "unmarried" }))).toBe(false);
  });
});

describe("isSpouse", () => {
  it("is true when the name matches the declared spouse and the testator is married", () => {
    const plan = planWith({
      maritalStatus: "married",
      spouse: { name: "Taylor" },
    });
    expect(isSpouse(plan, "Taylor")).toBe(true);
    expect(isSpouse(plan, "  taylor  ")).toBe(true);
  });

  it("is false for an unmarried testator even with a stale matching spouse name", () => {
    const plan = planWith({
      maritalStatus: "unmarried",
      spouse: { name: "Taylor" },
    });
    expect(isSpouse(plan, "Taylor")).toBe(false);
  });

  it("is false for an empty or non-matching name", () => {
    const plan = planWith({
      maritalStatus: "married",
      spouse: { name: "Taylor" },
    });
    expect(isSpouse(plan, "")).toBe(false);
    expect(isSpouse(plan, "Someone Else")).toBe(false);
  });
});
