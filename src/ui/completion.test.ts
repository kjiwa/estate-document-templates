import { h } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { DOCUMENTS, type DocumentDefinition } from "../documents/registry";
import { HighlightContext, PlanContext } from "../documents/shared/PlanContext";
import { sectionFields } from "../form/registry";
import { migrateProfile } from "../model/migrate";
import type { Plan } from "../model/plan";
import { getPath } from "../model/paths";
import { isFieldAnswered, isOptional, sectionCompletion } from "./completion";

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

  it("treats the remains directive's optional sections as complete when blank", () => {
    for (const id of ["instructions", "arranger", "notify"]) {
      const section = sectionById("remains-directive", id);
      expect(sectionCompletion(plan, section).complete, id).toBe(true);
    }
  });

  it("does not count a blank health care directive placeOfDeath as unanswered", () => {
    const field = sectionFields(
      sectionById("health-care-directive", "directions")
    ).find(
      (f) =>
        "path" in f && f.path === "documents.healthCareDirective.placeOfDeath"
    );
    expect(field).toBeDefined();
    expect(getPath(plan, "documents.healthCareDirective.placeOfDeath")).toBe(
      ""
    );
    expect(isFieldAnswered(plan, field!)).toBe(true);
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
