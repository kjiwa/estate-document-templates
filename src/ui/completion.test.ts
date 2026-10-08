import { h } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { DOCUMENTS, type DocumentDefinition } from "../documents/registry";
import { HighlightContext, PlanContext } from "../documents/shared/PlanContext";
import { isOptional } from "../form/field-spec";
import type { LeafFieldSpec } from "../form/registry";
import { resolveFieldPath, sectionFields } from "../form/registry";
import { migrateProfile } from "../model/migrate";
import type { Plan } from "../model/plan";
import { getPath, setPath } from "../model/paths";
import {
  documentCompletion,
  documentReadiness,
  flattenFields,
  hasValue,
  isFieldAnswered,
  isRequired,
  sectionCompletion,
  sectionState,
} from "./completion";

function blankPlan(): Plan {
  const result = migrateProfile("profile-1", { label: "Profile 1" });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

function fillInPaths(doc: DocumentDefinition, plan: Plan): Set<string> {
  const html = render(
    h(
      PlanContext.Provider,
      { value: plan },
      h(HighlightContext.Provider, { value: true }, h(doc.Body, {}))
    )
  );
  const { document } = parseHTML(`<body>${html}</body>`);
  const paths = document.querySelectorAll(".fill-in[data-path]");
  return new Set(
    Array.from(paths, (el: Element) => el.getAttribute("data-path") ?? "")
  );
}

function visibleLeaves(doc: DocumentDefinition, plan: Plan) {
  return doc.sections
    .filter((s) => !s.hidden?.(plan))
    .flatMap((s) => sectionFields(s));
}

function sectionById(docId: string, sectionId: string) {
  const section = DOCUMENTS.find((d) => d.id === docId)?.sections.find(
    (s) => s.id === sectionId
  );
  if (!section) throw new Error(`no section ${docId}/${sectionId}`);
  return section;
}

describe("completion matches the rendered fill-ins", () => {
  const plan = blankPlan();

  for (const doc of DOCUMENTS) {
    describe(doc.id, () => {
      const fillIns = fillInPaths(doc, plan);
      const leaves = visibleLeaves(doc, plan);

      it("never prints an optional field as a fill-in", () => {
        const offenders = leaves
          .filter((f) => isOptional(plan, f))
          .map((f) => (f as { path: string }).path)
          .filter((path) => fillIns.has(path));
        expect(offenders).toEqual([]);
      });

      it("counts a text field as required exactly when it prints a fill-in", () => {
        const mismatched = leaves
          .filter((f) => f.kind === "text" && getPath(plan, f.path) === "")
          .filter((f) => !isOptional(plan, f) !== fillIns.has(f.path))
          .map((f) => f.path);
        expect(mismatched).toEqual([]);
      });
    });
  }

  const BLANK_ANSWERED: Record<string, number> = {
    will: 4,
    "remains-directive": 1,
    "health-care-directive": 1,
    "general-power-of-attorney": 1,
    "durable-power-of-attorney": 1,
  };

  for (const doc of DOCUMENTS) {
    it(`counts exactly the required visible leaves of ${doc.id} on a blank plan`, () => {
      const required = visibleLeaves(doc, plan).filter((f) =>
        isRequired(plan, f)
      );
      const prefilled = required.filter((f) => {
        const value = getPath(plan, f.path);
        return (
          typeof value === "number" ||
          (typeof value === "string" && value.trim() !== "")
        );
      });
      const completion = documentCompletion(plan, doc.sections);
      expect(completion.total).toBe(required.length);
      expect(completion.answered).toBe(prefilled.length);
      expect(completion.answered).toBe(BLANK_ANSWERED[doc.id]);
    });

    it(`completes every ${doc.id} section that has no required leaves`, () => {
      const offenders = doc.sections
        .filter((s) => !s.hidden?.(plan) && !s.complete)
        .filter(
          (s) => !flattenFields(s.fields).some((f) => isRequired(plan, f))
        )
        .filter((s) => !sectionCompletion(plan, s).complete)
        .map((s) => s.id);
      expect(offenders).toEqual([]);
    });
  }

  it("treats the remains directive's optional sections as complete when blank", () => {
    for (const id of ["instructions", "arranger", "notify"]) {
      const section = sectionById("remains-directive", id);
      expect(sectionCompletion(plan, section).complete, id).toBe(true);
    }
  });

  it("excludes a blank health care directive placeOfDeath from the total", () => {
    const section = sectionById("health-care-directive", "directions");
    const field = sectionFields(section).find(
      (f) =>
        "path" in f && f.path === "documents.healthCareDirective.placeOfDeath"
    );
    expect(field).toBeDefined();
    expect(getPath(plan, "documents.healthCareDirective.placeOfDeath")).toBe(
      ""
    );
    expect(isRequired(plan, field!)).toBe(false);
    const leaves = flattenFields(section.fields);
    const required = leaves.filter((f) => isRequired(plan, f)).length;
    expect(sectionCompletion(plan, section).total).toBe(required);
    expect(required).toBe(leaves.length - 1);
  });

  it("requires the community property agreement date only when the agreement exists", () => {
    const section = sectionById("will", "property");
    const will = plan.documents.will;
    const withAgreement = (exists: boolean, date: string): Plan => ({
      ...plan,
      documents: {
        ...plan.documents,
        will: { ...will, communityPropertyAgreement: { exists, date } },
      },
    });
    expect(sectionCompletion(withAgreement(false, ""), section).complete).toBe(
      true
    );
    expect(sectionCompletion(withAgreement(true, ""), section).complete).toBe(
      false
    );
    expect(
      sectionCompletion(withAgreement(true, "2020-01-01"), section).complete
    ).toBe(true);
  });

  it("prints the agreement date as a fill-in exactly when it counts as required", () => {
    const will = DOCUMENTS.find((d) => d.id === "will")!;
    const path = "documents.will.communityPropertyAgreement.date";
    const base = blankPlan();
    const withAgreement: Plan = {
      ...base,
      party: { ...base.party, maritalStatus: "married" },
      documents: {
        ...base.documents,
        will: {
          ...base.documents.will,
          communityPropertyAgreement: { exists: true, date: "" },
        },
      },
    };
    const field = sectionFields(sectionById("will", "property")).find(
      (f) => "path" in f && f.path === path
    )!;
    expect(isOptional(withAgreement, field)).toBe(false);
    expect(fillInPaths(will, withAgreement).has(path)).toBe(true);
    expect(isOptional(base, field)).toBe(true);
    expect(fillInPaths(will, base).has(path)).toBe(false);
  });

  it("still counts a blank required text field as unanswered", () => {
    const field = sectionFields(sectionById("will", "testator")).find(
      (f) => "path" in f && f.path === "party.testator.name"
    );
    expect(field).toBeDefined();
    expect(isFieldAnswered(plan, field!)).toBe(false);
  });
});

function sampleValue(field: LeafFieldSpec): unknown {
  switch (field.kind) {
    case "select":
      return field.options.find((o) => o.value !== "")?.value ?? "x";
    case "date":
      return "2020-01-01";
    case "number":
      return Math.max(field.min ?? 0, 1);
    case "executionDate":
      return { day: "1st", month: "January", year: "2030" };
    case "list":
      return [
        Object.fromEntries((field.columns ?? []).map((c) => [c.key, "x"])),
      ];
    default:
      return "x";
  }
}

function fillLeaves(
  doc: DocumentDefinition,
  start: Plan,
  include: (path: string) => boolean
): Plan {
  let plan = start;
  for (let pass = 0; pass < 3; pass++) {
    for (const field of visibleLeaves(doc, plan)) {
      if (
        field.kind !== "checkbox" &&
        isRequired(plan, field) &&
        include(field.path)
      ) {
        plan = setPath(plan, field.path, sampleValue(field));
      }
    }
  }
  return plan;
}

function signingPaths(doc: DocumentDefinition, plan: Plan): Set<string> {
  return new Set(
    doc.executeGroups.flatMap((group) =>
      group.paths.map(
        (path) => resolveFieldPath(plan, doc.sections, path)?.field.path ?? path
      )
    )
  );
}

describe("document readiness", () => {
  const plan = blankPlan();

  for (const doc of DOCUMENTS) {
    describe(doc.id, () => {
      it("resolves every execute-group path to a required leaf", () => {
        const required = new Set(
          visibleLeaves(doc, plan)
            .filter((f) => isRequired(plan, f))
            .map((f) => f.path)
        );
        const offenders = doc.executeGroups
          .flatMap((group) => group.paths)
          .filter((path) => {
            const resolved = resolveFieldPath(plan, doc.sections, path);
            return !resolved || !required.has(resolved.field.path);
          });
        expect(offenders).toEqual([]);
      });

      it("partitions the required leaves into content and signing", () => {
        const { content, signing } = documentReadiness(plan, doc);
        const { total } = documentCompletion(plan, doc.sections);
        expect(content.total + signing.total).toBe(total);
        expect(signing.total).toBeGreaterThan(0);
      });

      it("marks every section without required leaves blank-optional on a blank plan", () => {
        const offenders = doc.sections
          .filter((s) => !s.hidden?.(plan))
          .filter(
            (s) => !flattenFields(s.fields).some((f) => isRequired(plan, f))
          )
          .filter((s) => sectionState(plan, s) !== "blank-optional")
          .map((s) => s.id);
        expect(offenders).toEqual([]);
      });

      it("is ready-to-sign with content filled, ready-to-print with signing filled", () => {
        const signing = signingPaths(doc, plan);
        const contentOnly = fillLeaves(doc, plan, (p) => !signing.has(p));
        const ready = documentReadiness(contentOnly, doc);
        expect(ready.stage).toBe("ready-to-sign");
        expect(ready.remainingSigningGroups.length).toBeGreaterThan(0);
        const all = fillLeaves(doc, contentOnly, () => true);
        const printed = documentReadiness(all, doc);
        expect(printed.stage).toBe("ready-to-print");
        expect(printed.remainingSigningGroups).toEqual([]);
      });

      it("is in-progress on a blank plan", () => {
        expect(documentReadiness(plan, doc).stage).toBe("in-progress");
      });
    });
  }

  it("marks the named optional sections blank-optional on a blank plan", () => {
    const named: [string, string][] = [
      ["health-care-directive", "directions"],
      ["remains-directive", "instructions"],
      ["remains-directive", "arranger"],
      ["remains-directive", "notify"],
    ];
    for (const [docId, id] of named) {
      expect(sectionState(plan, sectionById(docId, id)), id).toBe(
        "blank-optional"
      );
    }
  });

  it("marks will Article 3 done when outright with no community property agreement", () => {
    const section = sectionById("will", "property");
    const will = plan.documents.will;
    const outright: Plan = {
      ...plan,
      documents: {
        ...plan.documents,
        will: {
          ...will,
          spousalGift: "outright",
          communityPropertyAgreement: { exists: false, date: "" },
        },
      },
    };
    expect(sectionState(outright, section)).toBe("done");
  });

  it("marks a section open while a required field is unanswered", () => {
    expect(sectionState(plan, sectionById("will", "testator"))).toBe("open");
  });
});

describe("hasValue", () => {
  it("reads a checked checkbox as a value, so a checkbox-only section is not blank", () => {
    const field: LeafFieldSpec = {
      kind: "checkbox",
      path: "documents.will.communityPropertyAgreement.exists",
      label: "x",
    };
    const plan = migrateProfile("p", { label: "p" });
    if (!plan.success) throw new Error(plan.error);
    expect(hasValue(plan.plan, field)).toBe(false);
    const checked = setPath(plan.plan, field.path, true);
    expect(hasValue(checked, field)).toBe(true);
  });
});
