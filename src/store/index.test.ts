import { beforeEach, describe, expect, it } from "vitest";

import { activePlanId, parsePersisted, plans, setField } from "./index";

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

describe("parsePersisted", () => {
  it("round-trips the current (v3) persisted shape, including edited fields", () => {
    const edited = {
      ...plans.value["profile-1"]!,
      party: {
        ...plans.value["profile-1"]!.party,
        testator: {
          ...plans.value["profile-1"]!.party.testator,
          name: "Jordan",
        },
      },
    };
    const persisted = {
      schemaVersion: 3,
      activePlanId: "profile-1",
      activeDocumentId: "will",
      plans: {
        "profile-1": edited,
      },
    };
    const result = parsePersisted(persisted);
    expect(result).not.toBeNull();
    expect(result!.activePlanId).toBe("profile-1");
    // A persisted v3 Plan carries no `schemaVersion` field of its own; this
    // guards against `migrateProfile` mistaking it for a v2 profile and
    // blanking every field via `mapV2ToV3`.
    expect(result!.plans["profile-1"]?.party.testator.name).toBe("Jordan");
  });

  it("reads the legacy v2 shape (profiles / activeProfileId)", () => {
    const persisted = {
      profiles: {
        "profile-1": { label: "Profile 1" },
      },
      activeProfileId: "profile-1",
    };
    const result = parsePersisted(persisted);
    expect(result).not.toBeNull();
    expect(result!.activePlanId).toBe("profile-1");
    expect(result!.plans["profile-1"]?.label).toBe("Profile 1");
  });

  it("returns null for unknown or garbage shapes", () => {
    expect(parsePersisted({ foo: "bar" })).toBeNull();
    expect(parsePersisted("garbage")).toBeNull();
    expect(parsePersisted(42)).toBeNull();
    expect(parsePersisted(null)).toBeNull();
  });

  it("returns null for an empty plans/profiles map", () => {
    expect(parsePersisted({ plans: {} })).toBeNull();
    expect(parsePersisted({ profiles: {} })).toBeNull();
  });
});
