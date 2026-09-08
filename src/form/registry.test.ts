import { describe, expect, it } from "vitest";

import { migrateProfile } from "../model/migrate";
import type { Plan } from "../model/plan";
import type { Section } from "./field-spec";
import {
  findFieldByPath,
  isKnownPath,
  orderedFields,
  resolveFieldPath,
  sectionFields,
} from "./registry";

function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

const sectionA: Section = {
  id: "a",
  legend: "Section A",
  fields: [
    { kind: "text", path: "party.testator.name", label: "Name" },
    {
      kind: "group",
      label: "Domicile",
      fields: [
        { kind: "text", path: "party.testator.county", label: "County" },
        { kind: "text", path: "party.testator.state", label: "State" },
      ],
    },
  ],
};

const sectionHidden: Section = {
  id: "hidden",
  legend: "Hidden Section",
  hidden: () => true,
  fields: [{ kind: "text", path: "party.spouse.name", label: "Spouse" }],
};

const sectionB: Section = {
  id: "b",
  legend: "Section B",
  fields: [
    { kind: "number", path: "documents.will.survivorshipDays", label: "Days" },
    {
      kind: "list",
      path: "party.children",
      label: "Children",
      addLabel: "Add",
    },
  ],
};

const SECTIONS: Section[] = [sectionA, sectionHidden, sectionB];

describe("orderedFields", () => {
  it("flattens groups and preserves declaration order across sections", () => {
    const plan = planWith();
    const entries = orderedFields(plan, SECTIONS);
    expect(entries.map((e) => e.field.path)).toEqual([
      "party.testator.name",
      "party.testator.county",
      "party.testator.state",
      "documents.will.survivorshipDays",
      "party.children",
    ]);
    expect(entries.map((e) => e.index)).toEqual([0, 1, 2, 3, 4]);
  });

  it("skips hidden sections entirely", () => {
    const plan = planWith();
    const entries = orderedFields(plan, SECTIONS);
    expect(entries.some((e) => e.section.id === "hidden")).toBe(false);
  });
});

describe("findFieldByPath / isKnownPath", () => {
  it("finds a known path, including one nested in a group, and its section", () => {
    const plan = planWith();
    const entry = findFieldByPath(plan, SECTIONS, "party.testator.county");
    expect(entry?.section.id).toBe("a");
  });

  it("returns undefined/false for a path from a hidden section", () => {
    const plan = planWith();
    expect(
      findFieldByPath(plan, SECTIONS, "party.spouse.name")
    ).toBeUndefined();
    expect(isKnownPath(plan, SECTIONS, "party.spouse.name")).toBe(false);
  });

  it("returns undefined/false for a path not in the registry at all", () => {
    const plan = planWith();
    expect(findFieldByPath(plan, SECTIONS, "not.a.real.path")).toBeUndefined();
    expect(isKnownPath(plan, SECTIONS, "not.a.real.path")).toBe(false);
  });

  it("narrows a known path", () => {
    const plan = planWith();
    expect(isKnownPath(plan, SECTIONS, "party.testator.name")).toBe(true);
  });
});

describe("resolveFieldPath", () => {
  it("resolves a path present verbatim, same as findFieldByPath", () => {
    const plan = planWith();
    const entry = resolveFieldPath(plan, SECTIONS, "party.testator.county");
    expect(entry?.section.id).toBe("a");
  });

  it("falls back to a shorter dotted prefix when the full path has no entry, e.g. an array element under a list field", () => {
    const plan = planWith();
    const entry = resolveFieldPath(plan, SECTIONS, "party.children.0");
    expect(entry?.field.path).toBe("party.children");
    expect(entry?.section.id).toBe("b");
  });

  it("returns undefined when no prefix resolves", () => {
    const plan = planWith();
    expect(
      resolveFieldPath(plan, SECTIONS, "not.a.real.path.at.all")
    ).toBeUndefined();
  });
});

describe("sectionFields", () => {
  it("flattens a single section's own fields, groups included", () => {
    expect(sectionFields(sectionA).map((f) => f.path)).toEqual([
      "party.testator.name",
      "party.testator.county",
      "party.testator.state",
    ]);
  });
});
