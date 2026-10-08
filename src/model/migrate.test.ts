import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { migrateProfile, CURRENT_SCHEMA_VERSION, MIGRATIONS } from "./migrate";
import type { Plan } from "./plan";

describe("migrateProfile", () => {
  // 1. Already v3-shaped: pass through, but still `Plan.parse`.
  it("validates an already-v3 payload rather than assuming it is valid", () => {
    const result = migrateProfile("profile-1", {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      label: "Profile 1",
      party: {
        testator: { name: "Jordan", state: "Washington" },
        spouse: {},
        children: [],
      },
      fiduciaries: {
        guardians: {},
        conservators: {},
        personalRepresentatives: {},
        trustees: {},
        remains: {},
      },
      executions: { will: { executionDate: {}, notary: {} } },
      documents: {
        will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.plan.party.testator.name).toBe("Jordan");
      expect(result.plan.id).toBe("profile-1");
    }
  });

  it("rejects an already-v3 payload missing a required group, rather than defaulting it", () => {
    const result = migrateProfile("profile-1", {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      label: "Profile 1",
      party: { testator: { name: "Jordan" } },
    });
    expect(result.success).toBe(false);
  });

  // 2. v2 payload with all 24 fields present.
  it("maps a fully populated v2 payload field by field", () => {
    const v2 = {
      label: "Profile 1",
      testator: { name: "Jordan", gender: "male", county: "King", state: "WA" },
      maritalStatus: "married",
      spouse: { name: "Taylor", gender: "female" },
      children: ["Rowan"],
      guardians: { primary: "A", alternate: "B" },
      conservators: { primary: "C", alternate: "D" },
      personalRepresentatives: { primary: "E", alternate: "F" },
      trustees: { primary: "G", alternate: "H" },
      remains: { agent: "I", alternate: "J", preference: "cremation" },
      city: "Tacoma",
      executionDate: { day: "1", month: "March", year: "2026" },
      witnesses: [
        { name: "W1", address: "Addr1", cityStateZip: "Tacoma, WA" },
        { name: "W2", address: "Addr2", cityStateZip: "Tacoma, WA" },
      ],
      notary: { name: "Notary", commissionExpires: "2028-01-01" },
      spousalGift: "disclaimerTrust",
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
      ultimateBeneficiary: {
        relationship: "sister",
        name: "Robin",
        gender: "female",
      },
      survivorshipDays: 90,
    };
    const result = migrateProfile("profile-1", v2);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const plan = result.plan;
    expect(plan.party.testator).toEqual({
      name: "Jordan",
      gender: "male",
      county: "King",
      state: "WA",
    });
    expect(plan.party.spouse.name).toBe("Taylor");
    expect(plan.fiduciaries.guardians).toEqual({
      primary: "A",
      alternate: "B",
    });
    expect(plan.executions.will.city).toBe("Tacoma");
    expect(plan.executions.will.notary.name).toBe("Notary");
    expect(plan.documents.will.spousalGift).toBe("disclaimerTrust");
    expect(plan.documents.will.survivorshipDays).toBe(90);
  });

  // 3. v2 payload missing a field entirely falls back to the v3 default.
  it("falls back to the schema default for a field missing from v2", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      testator: { name: "Jordan" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.party.testator.state).toBe("Washington");
    expect(result.plan.documents.will.survivorshipDays).toBe(60);
    expect(result.plan.executions.will.witnesses).toHaveLength(2);
  });

  // 4. Unrecognized top-level id: preserved verbatim as `Plan.id`.
  it("preserves an unrecognized id verbatim", () => {
    const result = migrateProfile("imported-abc123", {
      label: "Imported",
      testator: { name: "Jordan" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.id).toBe("imported-abc123");
  });

  // 5. `schemaVersion` absent: treat as v2.
  it("treats a payload with no schemaVersion as v2", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      testator: { name: "Jordan", state: "Washington" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.party.testator.name).toBe("Jordan");
  });

  it("surfaces a shape error rather than a zod stack trace when v2 mapping still fails", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      children: "not-an-array",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).not.toMatch(/ZodError|issues/i);
    expect(result.error).toContain("profile-1");
  });

  // 6. `witnesses` of length 1 and of length 3: copied verbatim.
  it("copies a witnesses array of length 1 verbatim, no padding", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      witnesses: [{ name: "Solo", address: "", cityStateZip: "" }],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.executions.will.witnesses).toHaveLength(1);
  });

  it("copies a witnesses array of length 3 verbatim, no truncation", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      witnesses: [
        { name: "A", address: "", cityStateZip: "" },
        { name: "B", address: "", cityStateZip: "" },
        { name: "C", address: "", cityStateZip: "" },
      ],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.executions.will.witnesses).toHaveLength(3);
  });

  // 7. `children` present but not an array: reject, do not coerce.
  it("rejects a non-array children field instead of coercing it", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      children: "Rowan",
    });
    expect(result.success).toBe(false);
  });

  // 8. A v2 payload has no `healthCareDirective` key at all — every leaf
  // defaults blank rather than failing to parse.
  it("defaults the health care directive namespace for a v2 payload", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      testator: { name: "Jordan" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.documents.healthCareDirective).toEqual({
      placeOfDeath: "",
      artificialNutrition: "",
      artificialHydration: "",
      cpr: "",
    });
  });

  // Invariant 8: a v3 export written before this namespace existed has
  // `documents.will` but no `documents.healthCareDirective` key, and must
  // still import.
  it("imports a pre-existing v3 export with no healthCareDirective key", () => {
    const result = migrateProfile("profile-1", {
      schemaVersion: 3,
      label: "Profile 1",
      party: {
        testator: { name: "Jordan", state: "Washington" },
        spouse: {},
        children: [],
      },
      fiduciaries: {
        guardians: {},
        conservators: {},
        personalRepresentatives: {},
        trustees: {},
        remains: {},
      },
      execution: { executionDate: {}, notary: {} },
      documents: {
        will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.documents.healthCareDirective.cpr).toBe("");
  });

  const DEFAULT_REMAINS_DIRECTIVE = {
    arrangementsMade: "",
    arrangementsWith: "",
    method: "",
    cremainsDisposition: "",
    cremainsDetail: "",
    arranger: { name: "", address: "", telephone: "" },
    notify: [],
  };

  it("defaults the remains directive namespace for a v2 payload", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      testator: { name: "Jordan" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.documents.remainsDirective).toEqual(
      DEFAULT_REMAINS_DIRECTIVE
    );
  });

  it("imports a pre-existing v3 export with no remainsDirective key", () => {
    const result = migrateProfile("profile-1", {
      schemaVersion: 3,
      label: "Profile 1",
      party: {
        testator: { name: "Jordan", state: "Washington" },
        spouse: {},
        children: [],
      },
      fiduciaries: {
        guardians: {},
        conservators: {},
        personalRepresentatives: {},
        trustees: {},
        remains: {},
      },
      execution: { executionDate: {}, notary: {} },
      documents: {
        will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.documents.remainsDirective).toEqual(
      DEFAULT_REMAINS_DIRECTIVE
    );
  });

  const DEFAULT_DURABLE_POWER_OF_ATTORNEY = {
    minorChildren: false,
    lastGoodbyes: false,
  };

  it("defaults the durable power of attorney namespace for a v2 payload", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      testator: { name: "Jordan" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.documents.durablePowerOfAttorney).toEqual(
      DEFAULT_DURABLE_POWER_OF_ATTORNEY
    );
  });

  it("imports a pre-existing v3 export with no durablePowerOfAttorney key", () => {
    const result = migrateProfile("profile-1", {
      schemaVersion: 3,
      label: "Profile 1",
      party: {
        testator: { name: "Jordan", state: "Washington" },
        spouse: {},
        children: [],
      },
      fiduciaries: {
        guardians: {},
        conservators: {},
        personalRepresentatives: {},
        trustees: {},
        remains: {},
      },
      execution: { executionDate: {}, notary: {} },
      documents: {
        will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.documents.durablePowerOfAttorney).toEqual(
      DEFAULT_DURABLE_POWER_OF_ATTORNEY
    );
  });

  it("defaults attorneysInFact for a v2 payload", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      testator: { name: "Jordan" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.fiduciaries.attorneysInFact).toEqual({
      primary: "",
      alternate: "",
    });
  });

  it("imports a pre-existing v3 export with no attorneysInFact key", () => {
    const result = migrateProfile("profile-1", {
      schemaVersion: 3,
      label: "Profile 1",
      party: {
        testator: { name: "Jordan", state: "Washington" },
        spouse: {},
        children: [],
      },
      fiduciaries: {
        guardians: {},
        conservators: {},
        personalRepresentatives: {},
        trustees: {},
        remains: {},
      },
      execution: { executionDate: {}, notary: {} },
      documents: {
        will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.fiduciaries.attorneysInFact).toEqual({
      primary: "",
      alternate: "",
    });
  });

  const EXECUTION_KEYS = [
    "will",
    "remainsDirective",
    "healthCareDirective",
    "durablePowerOfAttorney",
    "generalPowerOfAttorney",
  ] as const;

  async function readV3Plan(): Promise<Record<string, unknown>> {
    const raw = await readFile("test/data/v3-export.json", "utf8");
    const envelope = JSON.parse(raw) as {
      plans: Record<string, Record<string, unknown>>;
    };
    return envelope.plans["profile-1"]!;
  }

  it("copies a v3 shared execution record into all five documents", async () => {
    const v3 = await readV3Plan();
    const result = migrateProfile("profile-1", { ...v3, schemaVersion: 3 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    for (const key of EXECUTION_KEYS) {
      expect(result.plan.executions[key].city).toBe("Spokane");
      expect(result.plan.executions[key].witnesses[0]?.name).toBe(
        "Lena Brandt"
      );
      expect(result.plan.executions[key].notary.name).toBe("Greta Holm");
    }
    expect("execution" in result.plan).toBe(false);
  });

  it("migrates a v2 payload through to the per-document records", () => {
    const result = migrateProfile("profile-1", {
      label: "Profile 1",
      city: "Tacoma",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    for (const key of EXECUTION_KEYS) {
      expect(result.plan.executions[key].city).toBe("Tacoma");
    }
  });

  it("round-trips a current-version plan through JSON unchanged", async () => {
    const v3 = await readV3Plan();
    const first = migrateProfile("profile-1", { ...v3, schemaVersion: 3 });
    if (!first.success) throw new Error(first.error);
    const second = migrateProfile("profile-1", {
      ...(JSON.parse(JSON.stringify(first.plan)) as Plan),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });
    expect(second.success && second.plan).toEqual(first.plan);
  });

  it("has a step and a fixture for every version before the current one", async () => {
    const fixtures: Record<number, Record<string, unknown>> = {
      2: { label: "Profile 1" },
      3: { ...(await readV3Plan()), schemaVersion: 3 },
    };
    for (let version = 2; version < CURRENT_SCHEMA_VERSION; version++) {
      expect(MIGRATIONS[version - 2], `step from v${version}`).toBeDefined();
      expect(fixtures[version], `fixture for v${version}`).toBeDefined();
      expect(migrateProfile("profile-1", fixtures[version]).success).toBe(true);
    }
    expect(MIGRATIONS).toHaveLength(CURRENT_SCHEMA_VERSION - 2);
  });
});
