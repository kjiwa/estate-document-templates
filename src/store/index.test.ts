import { beforeEach, describe, expect, it } from "vitest";

import { activePlanId, plans, setField } from "./index";

describe("store", () => {
  beforeEach(() => {
    plans.value = {
      "profile-1": plans.value["profile-1"]!,
    };
    activePlanId.value = "profile-1";
  });

  it("setField updates the active plan immutably", () => {
    const before = plans.value["profile-1"]!;
    setField("party.testator.name", "Jordan");
    const after = plans.value["profile-1"]!;

    expect(after.party.testator.name).toBe("Jordan");
    expect(before.party.testator.name).toBe("");
    expect(after).not.toBe(before);
  });

  it("setField on an array path updates only that element", () => {
    setField("execution.witnesses.0.name", "Alex");
    const plan = plans.value["profile-1"]!;
    expect(plan.execution.witnesses[0]?.name).toBe("Alex");
    expect(plan.execution.witnesses[1]?.name).toBe("");
  });
});
