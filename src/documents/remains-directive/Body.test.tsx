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

function renderBody(plan: Plan): string {
  return render(
    h(
      PlanContext.Provider,
      { value: plan },
      h(HighlightContext.Provider, { value: true }, h(Body, {}))
    )
  );
}

describe("remains-directive Body", () => {
  it("cites RCW 68.50.160 and names the agent and alternate", () => {
    const plan = planWith({
      testator: { name: "Alex Rivera", county: "King", state: "Washington" },
      remains: { agent: "Robin Doe", alternate: "Casey Doe" },
    });
    const html = renderBody(plan);
    expect(html).toContain("RCW 68.50.160");
    expect(html).toContain("Robin Doe");
    expect(html).toContain("Casey Doe");
    expect(html).toContain("Alex Rivera");
  });

  it("suppresses the Wishes clause when preference is blank, without leaving a numbering gap", () => {
    const plan = planWith({ remains: { preference: "" } });
    const html = renderBody(plan);
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    const clauseTitles = Array.from(
      document.querySelectorAll("p.clause strong")
    ).map((el) => el.textContent);
    // Article 1 has exactly one clause (1.1) when there is no preference —
    // no "1.2" appears, and no gap is left for Article 2's "2.1".
    expect(clauseTitles.some((t) => t?.includes("1.1"))).toBe(true);
    expect(clauseTitles.some((t) => t?.includes("1.2"))).toBe(false);
    expect(clauseTitles.some((t) => t?.includes("2.1"))).toBe(true);
  });

  it("renders the Wishes clause when preference is set", () => {
    const plan = planWith({ remains: { preference: "Cremation, please." } });
    const html = renderBody(plan);
    expect(html).toContain("Wishes");
    expect(html).toContain("Cremation, please.");
  });

  it("does not claim the notarial acknowledgment is required", () => {
    const html = renderBody(planWith());
    expect(html).toContain("not required by RCW 68.50.160");
  });

  it("states the designation takes priority over the statutory order in 68.50.160(3)(c)-(g)", () => {
    const html = renderBody(planWith());
    expect(html).toContain("68.50.160(3)(c)");
  });

  it("uses Declarant, not Testator, as the signer role", () => {
    const html = renderBody(planWith());
    expect(html).toContain(", Declarant");
    expect(html).not.toContain(", Testator");
  });

  // Same discipline 4b/4c apply: `EditingContext` defaults to inert, so a
  // render with no `EditingContext.Provider` (this test, every golden, and
  // `standaloneHtml.ts`) must emit no editing affordances and no advisory
  // markers.
  it("renders inert with no EditingContext.Provider", () => {
    const plan = planWith({ remains: { agent: "" } }); // would otherwise advise
    const html = renderBody(plan);
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    expect(document.querySelectorAll("[tabindex]").length).toBe(0);
    expect(document.querySelectorAll('[role="button"]').length).toBe(0);
    expect(document.querySelectorAll(".advisory-inline").length).toBe(0);
  });
});
