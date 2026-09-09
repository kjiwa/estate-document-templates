import { h } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { HighlightContext, PlanContext } from "../shared/PlanContext";
import { Body } from "./Body";

function planWith(overlay: Record<string, unknown> = {}): Plan {
  const result = migrateProfile("profile-1", {
    label: "Profile 1",
    ...overlay,
  });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

// `documents.healthCareDirective` is a brand-new namespace v2 never had, so
// `mapV2ToV3` (deliberately) does not map it — an overlay under that key
// would be silently dropped by `planWith`. Overriding the already-migrated
// plan's leaf values directly is how this document's own tests reach them,
// same as any other Plan value a test needs beyond what migration maps.
function withHealthCareDirective(
  plan: Plan,
  overrides: Partial<Plan["documents"]["healthCareDirective"]>
): Plan {
  return {
    ...plan,
    documents: {
      ...plan.documents,
      healthCareDirective: {
        ...plan.documents.healthCareDirective,
        ...overrides,
      },
    },
  };
}

function renderBody(plan: Plan): string {
  return render(
    h(
      PlanContext.Provider,
      { value: plan },
      h(HighlightContext.Provider, { value: true }, h(Body, {}))
    )
  );
}

describe("health-care-directive Body", () => {
  it("cites RCW 70.122.030 and interpolates the declarer's name", () => {
    const plan = planWith({ testator: { name: "Alex Rivera" } });
    const html = renderBody(plan);
    expect(html).toContain("RCW 70.122.030");
    expect(html).toContain("Alex Rivera");
  });

  it("renders an X on the DO side and a blank on the DO NOT side when elected 'do'", () => {
    const plan = withHealthCareDirective(planWith(), { cpr: "do" });
    const html = renderBody(plan);
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    const marks = Array.from(
      document.querySelectorAll(".election-mark-cell")
    ).map((el) => el.textContent?.trim());
    // Rows are nutrition, hydration, cpr — cpr is the third row's two cells.
    expect(marks[4]).toBe("X");
    expect(marks[5]).toBe("");
  });

  it("renders an X on the DO NOT side when elected 'doNot'", () => {
    const plan = withHealthCareDirective(planWith(), {
      artificialNutrition: "doNot",
    });
    const html = renderBody(plan);
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    const marks = Array.from(
      document.querySelectorAll(".election-mark-cell")
    ).map((el) => el.textContent?.trim());
    expect(marks[0]).toBe("");
    expect(marks[1]).toBe("X");
  });

  it("renders no mark on either side of an unset election", () => {
    const plan = planWith({ testator: { name: "Alex" } });
    const html = renderBody(plan);
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    const marks = Array.from(
      document.querySelectorAll(".election-mark-cell")
    ).map((el) => el.textContent?.trim());
    expect(marks.every((mark) => mark === "")).toBe(true);
  });

  it("renders the home preference and not the hospital phrasing", () => {
    const plan = withHealthCareDirective(planWith(), { placeOfDeath: "home" });
    const html = renderBody(plan);
    expect(html).toContain("permitted to die naturally at home");
    expect(html).not.toContain("easier for my loved ones");
  });

  it("renders the hospital preference", () => {
    const plan = withHealthCareDirective(planWith(), {
      placeOfDeath: "hospital",
    });
    const html = renderBody(plan);
    expect(html).toContain(
      "in the hospital, if that makes executing the funeral arrangements easier"
    );
  });

  it("uses Declarer, not Testator or Declarant, as the signer role", () => {
    const html = renderBody(planWith());
    expect(html).toContain(", Declarer");
    expect(html).not.toContain(", Testator");
    expect(html).not.toContain(", Declarant");
  });

  it("renders inert with no EditingContext.Provider", () => {
    const plan = planWith(); // would otherwise advise on every unset election
    const html = renderBody(plan);
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    expect(document.querySelectorAll("[tabindex]").length).toBe(0);
    expect(document.querySelectorAll('[role="button"]').length).toBe(0);
    expect(document.querySelectorAll(".advisory-inline").length).toBe(0);
  });
});
