import { beforeEach, describe, expect, it } from "vitest";

import {
  activeDocumentId,
  activePlanId,
  createPlan,
  createReciprocalPlan,
  deletePlan,
  duplicatePlan,
  nextPlanId,
  parsePersisted,
  plans,
  renamePlan,
  setActiveDocument,
  setActivePlan,
  setField,
} from "./index";

// Captured once, before any test mutates `plans.value["profile-1"]` (or, in
// "plan mutations" below, deletes it outright) — the fixture every describe
// block below rebuilds from, so one test's mutation can't corrupt another's
// starting state.
const BASE_PLAN = plans.value["profile-1"]!;

describe("store", () => {
  beforeEach(() => {
    plans.value = {
      "profile-1": BASE_PLAN,
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

describe("plan mutations", () => {
  beforeEach(() => {
    plans.value = {
      "profile-1": { ...BASE_PLAN, id: "profile-1", label: "Profile 1" },
      "profile-2": { ...BASE_PLAN, id: "profile-2", label: "Profile 2" },
    };
    activePlanId.value = "profile-1";
    activeDocumentId.value = "will";
  });

  it("nextPlanId skips ids already present", () => {
    plans.value = { ...plans.value, "plan-1": plans.value["profile-1"]! };
    expect(nextPlanId()).toBe("plan-2");
  });

  it("setActivePlan switches the active plan when it exists", () => {
    setActivePlan("profile-2");
    expect(activePlanId.value).toBe("profile-2");
  });

  it("setActivePlan ignores an unknown id", () => {
    setActivePlan("does-not-exist");
    expect(activePlanId.value).toBe("profile-1");
  });

  it("setActiveDocument switches to a registered document", () => {
    setActiveDocument("remains-directive");
    expect(activeDocumentId.value).toBe("remains-directive");
    setActiveDocument("will");
    expect(activeDocumentId.value).toBe("will");
  });

  it("setActiveDocument ignores an unknown id", () => {
    setActiveDocument("does-not-exist");
    expect(activeDocumentId.value).toBe("will");
  });

  it("createPlan adds a new blank plan and makes it active", () => {
    const id = createPlan("New Plan");
    expect(plans.value[id]?.label).toBe("New Plan");
    expect(plans.value[id]?.party.testator.name).toBe("");
    expect(activePlanId.value).toBe(id);
  });

  it("renamePlan updates only the label", () => {
    renamePlan("profile-1", "Renamed");
    expect(plans.value["profile-1"]?.label).toBe("Renamed");
  });

  it("duplicatePlan copies the plan under a new id with a (copy) label and makes it active", () => {
    setField("party.testator.name", "Jordan");
    const id = duplicatePlan("profile-1")!;
    expect(plans.value[id]?.party.testator.name).toBe("Jordan");
    expect(plans.value[id]?.label).toBe("Profile 1 (copy)");
    expect(activePlanId.value).toBe(id);
  });

  it("deletePlan removes a plan and reassigns activePlanId if it was active", () => {
    deletePlan("profile-1");
    expect(plans.value["profile-1"]).toBeUndefined();
    expect(activePlanId.value).toBe("profile-2");
  });

  it("deletePlan refuses when only one plan remains", () => {
    plans.value = { "profile-1": plans.value["profile-1"]! };
    deletePlan("profile-1");
    expect(plans.value["profile-1"]).toBeDefined();
  });

  it("createReciprocalPlan clones the reciprocal plan and makes it active", () => {
    setField("party.testator.name", "Jordan");
    setField("party.spouse.name", "Taylor");
    setField("party.maritalStatus", "married");
    const id = createReciprocalPlan("profile-1")!;
    expect(plans.value[id]?.party.testator.name).toBe("Taylor");
    expect(plans.value[id]?.party.spouse.name).toBe("Jordan");
    expect(plans.value[id]?.label).toBe("Taylor");
    expect(activePlanId.value).toBe(id);
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

  it("restores a stored activeDocumentId that resolves against DOCUMENTS", () => {
    const persisted = {
      schemaVersion: 3,
      activePlanId: "profile-1",
      activeDocumentId: "remains-directive",
      plans: { "profile-1": plans.value["profile-1"]! },
    };
    const result = parsePersisted(persisted);
    expect(result?.activeDocumentId).toBe("remains-directive");
  });

  it("falls back to the first document when the stored activeDocumentId no longer resolves", () => {
    const persisted = {
      schemaVersion: 3,
      activePlanId: "profile-1",
      activeDocumentId: "some-retired-document",
      plans: { "profile-1": plans.value["profile-1"]! },
    };
    const result = parsePersisted(persisted);
    expect(result?.activeDocumentId).toBe("will");
  });

  it("falls back to the first document when activeDocumentId is absent (a pre-4d export)", () => {
    const persisted = {
      schemaVersion: 3,
      activePlanId: "profile-1",
      plans: { "profile-1": plans.value["profile-1"]! },
    };
    const result = parsePersisted(persisted);
    expect(result?.activeDocumentId).toBe("will");
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

  it("reads the pre-rewrite exportStateAsJson shape: a bare id-to-profile map with no envelope", () => {
    // js/state.js:260 (pre-Phase-3 history) wrote `JSON.stringify(state.profiles)`
    // directly — no `profiles`/`activeProfileId` wrapper. This is the only
    // "Export JSON" format that ever shipped, so invariant 8 (an export
    // written by the previous version still imports) requires it here.
    const persisted = {
      "profile-1": { label: "Profile 1" },
      "profile-2": { label: "Profile 2" },
    };
    const result = parsePersisted(persisted);
    expect(result).not.toBeNull();
    expect(Object.keys(result!.plans).sort()).toEqual([
      "profile-1",
      "profile-2",
    ]);
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
