import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CURRENT_SCHEMA_VERSION } from "../model/migrate";
import {
  activeDocumentId,
  activePlanId,
  createPlan,
  createReciprocalPlan,
  deletePlan,
  duplicatePlan,
  installStorageSync,
  loadFromStorage,
  nextPlanId,
  parsePersisted,
  plans,
  renamePlan,
  setActiveDocument,
  setActivePlan,
  setField,
  storageNotice,
} from "./index";

const STORAGE_KEY = "estate_templates_state_v1";

// A minimal `Storage` stand-in — Vitest's `node` environment has no
// `window`/`localStorage` at all (see `src/ui/files.test.ts`'s `stubDom`
// helper for the same problem elsewhere).
function fakeLocalStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  } as Storage;
}

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

  it("rejects an envelope with a schemaVersion newer than the code understands", () => {
    const persisted = {
      schemaVersion: CURRENT_SCHEMA_VERSION + 1,
      activePlanId: "profile-1",
      activeDocumentId: "will",
      plans: { "profile-1": plans.value["profile-1"]! },
    };
    expect(parsePersisted(persisted)).toBeNull();
  });
});

describe("loadFromStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("does not let the module's initial autosave schedule overwrite the real stored state before loadFromStorage finishes", async () => {
    vi.useFakeTimers();
    const storage = fakeLocalStorage();
    const originalRaw = "{not valid json";
    storage.setItem(STORAGE_KEY, originalRaw);
    vi.stubGlobal("window", { localStorage: storage });

    vi.resetModules();
    const mod = await import("./index");

    // Real code calls `loadFromStorage()` immediately after importing this
    // module (see `main.tsx`), but the module's own top-level effect already
    // ran, with the blank-plan signal defaults, before that call — any delay
    // between the two, real or simulated here via the fake clock, opens the
    // race: past the 250ms debounce, an ungated effect's pending write fires
    // with those blanks before the load ever gets a chance to run.
    vi.advanceTimersByTime(1000);
    expect(storage.getItem(STORAGE_KEY)).toBe(originalRaw);

    expect(mod.loadFromStorage()).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe(originalRaw);
  });

  it("preserves the raw stored value under a backup key when parsing fails", () => {
    const storage = fakeLocalStorage();
    const originalRaw = "{not valid json";
    storage.setItem(STORAGE_KEY, originalRaw);
    vi.stubGlobal("window", { localStorage: storage });

    expect(loadFromStorage()).toBe(false);

    expect(storage.getItem(`${STORAGE_KEY}__unparsed`)).toBe(originalRaw);
  });

  it("preserves the raw stored value under a backup key when migration fails for every plan", () => {
    const storage = fakeLocalStorage();
    const originalRaw = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      activePlanId: "profile-1",
      plans: { "profile-1": { not: "a plan" } },
    });
    storage.setItem(STORAGE_KEY, originalRaw);
    vi.stubGlobal("window", { localStorage: storage });

    expect(loadFromStorage()).toBe(false);

    expect(storage.getItem(`${STORAGE_KEY}__unparsed`)).toBe(originalRaw);
  });
});

describe("storage failures", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function throwingStorage(): Storage {
    const fail = () => {
      throw new Error("SecurityError");
    };
    return {
      getItem: fail,
      setItem: fail,
      removeItem: fail,
      clear: fail,
      key: () => null,
      length: 0,
    } as Storage;
  }

  it("loadFromStorage does not throw when reading is blocked", () => {
    vi.stubGlobal("window", { localStorage: throwingStorage() });
    expect(loadFromStorage()).toBe(false);
  });

  it("sets the storage notice when a write fails", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { localStorage: throwingStorage() });
    vi.resetModules();
    const mod = await import("./index");

    mod.loadFromStorage();
    mod.setField("party.testator.name", "Jordan");
    vi.advanceTimersByTime(1000);

    expect(mod.storageNotice.value).toMatch(/aren't being saved/);
  });

  it("backs up the raw value and sets the notice when only some plans fail to migrate", () => {
    const storage = fakeLocalStorage();
    const good = JSON.parse(JSON.stringify(BASE_PLAN));
    const originalRaw = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      activePlanId: "profile-1",
      plans: { "profile-1": good, "profile-2": { not: "a plan" } },
    });
    storage.setItem(STORAGE_KEY, originalRaw);
    vi.stubGlobal("window", { localStorage: storage });

    expect(loadFromStorage()).toBe(true);

    expect(Object.keys(plans.value)).toEqual(["profile-1"]);
    expect(storage.getItem(`${STORAGE_KEY}__unparsed`)).toBe(originalRaw);
    expect(storageNotice.value).toMatch(/couldn't be read/);
  });

  it("reloads state when another tab writes the storage key", async () => {
    const listeners: Record<string, (event: unknown) => void> = {};
    const storage = fakeLocalStorage();
    vi.stubGlobal("window", {
      localStorage: storage,
      addEventListener: (name: string, fn: (event: unknown) => void) => {
        listeners[name] = fn;
      },
      removeEventListener: () => {},
    });
    installStorageSync();
    await new Promise((resolve) => setTimeout(resolve, 300));

    const other = JSON.parse(JSON.stringify(BASE_PLAN));
    other.label = "From another tab";
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        activePlanId: "profile-1",
        plans: { "profile-1": other },
      })
    );
    listeners.storage!({ key: STORAGE_KEY });

    expect(plans.value["profile-1"]!.label).toBe("From another tab");
  });
});
