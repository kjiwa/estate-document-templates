import { h } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { DOCUMENTS } from "../documents/registry";
import { PlanContext } from "../documents/shared/PlanContext";
import { migrateProfile } from "../model/migrate";
import type { Plan } from "../model/plan";
import { Field, parseNumberInput } from "./Field";
import { sectionFields, type LeafFieldSpec } from "./registry";

function blankPlan(): Plan {
  const result = migrateProfile("profile-1", { label: "Profile 1" });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

function findField(docId: string, sectionId: string, path: string) {
  const section = DOCUMENTS.find((d) => d.id === docId)?.sections.find(
    (s) => s.id === sectionId
  );
  const field = section && sectionFields(section).find((f) => f.path === path);
  if (!field) throw new Error(`no field ${path}`);
  return field as LeafFieldSpec;
}

function labelText(plan: Plan, field: LeafFieldSpec) {
  const html = render(
    h(PlanContext.Provider, { value: plan }, h(Field, { field }))
  );
  const { document } = parseHTML(`<body>${html}</body>`);
  return {
    text: document.querySelector("label")?.textContent ?? "",
    suffix: document.querySelector("label .field-optional") !== null,
  };
}

describe("Field optional suffix", () => {
  const plan = blankPlan();

  it("marks an optional text field", () => {
    const field = findField(
      "remains-directive",
      "agent",
      "fiduciaries.remains.preference"
    );
    expect(labelText(plan, field)).toEqual({
      text: "Non-binding wishes (optional)",
      suffix: true,
    });
  });

  it("does not mark a required text field", () => {
    const field = findField("will", "testator", "party.testator.name");
    expect(labelText(plan, field).suffix).toBe(false);
  });

  it("marks the agreement date only without an agreement", () => {
    const path = "documents.will.communityPropertyAgreement.date";
    const field = findField("will", "property", path);
    const withAgreement: Plan = {
      ...plan,
      party: { ...plan.party, maritalStatus: "married" },
      documents: {
        ...plan.documents,
        will: {
          ...plan.documents.will,
          communityPropertyAgreement: { exists: true, date: "" },
        },
      },
    };
    expect(labelText(plan, field).suffix).toBe(true);
    expect(labelText(withAgreement, field).suffix).toBe(false);
  });
});

describe("parseNumberInput", () => {
  it("stores a cleared number field as unset, not zero", () => {
    expect(parseNumberInput("")).toBeUndefined();
    expect(parseNumberInput("  ")).toBeUndefined();
  });

  it("keeps zero and other entered numbers", () => {
    expect(parseNumberInput("0")).toBe(0);
    expect(parseNumberInput("90")).toBe(90);
  });
});
