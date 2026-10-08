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

// `documents.remainsDirective` is a namespace v2 never had, so `planWith`'s
// overlay cannot reach it; override the migrated plan's values directly.
function withInstructions(
  plan: Plan,
  overrides: Partial<Plan["documents"]["remainsDirective"]>
): Plan {
  return {
    ...plan,
    documents: {
      ...plan.documents,
      remainsDirective: { ...plan.documents.remainsDirective, ...overrides },
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

  function articleHeadings(html: string): string[] {
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    return Array.from(document.querySelectorAll("h2.article-header")).map(
      (el) => el.textContent ?? ""
    );
  }

  it("renders three articles and no Article 4 when no instruction is set", () => {
    const html = renderBody(planWith());
    const headings = articleHeadings(html);
    expect(headings.length).toBe(3);
    expect(html).not.toContain("Funeral and Disposition Instructions");
    expect(html).not.toContain("4.1");
  });

  it("renders four articles numbered 1-4 when an instruction is set", () => {
    const html = renderBody(withInstructions(planWith(), { method: "burial" }));
    const headings = articleHeadings(html);
    expect(headings.length).toBe(4);
    expect(headings[1]).toContain("Funeral and Disposition Instructions");
    headings.forEach((heading, i) => {
      expect(heading).toContain(`Article ${i + 1}:`);
    });
    expect(html).toContain("RCW 68.50.160(1)");
  });

  it("omits the cremains clause under burial and renders it under cremation", () => {
    const base = {
      cremainsDisposition: "scattered",
      cremainsDetail: "Place Alpha",
    };
    const burial = renderBody(
      withInstructions(planWith(), { ...base, method: "burial" })
    );
    expect(burial).not.toContain("Cremated Remains");
    const cremation = renderBody(
      withInstructions(planWith(), { ...base, method: "cremation" })
    );
    expect(cremation).toContain("Cremated Remains");
    expect(cremation).toContain("Place Alpha");
  });

  it("skips blank notify rows and keeps cell paths on the original index", () => {
    const blank = { name: "", address: "", telephone: "" };
    const html = renderBody(
      withInstructions(planWith(), {
        notify: [
          blank,
          { name: "Person Beta", address: "", telephone: "555-0100" },
        ],
      })
    );
    expect(html).toContain("Persons to Notify");
    expect(html).toContain("Person Beta</mark>, <mark");
    expect(html).toContain(
      'data-path="documents.remainsDirective.notify.1.name"'
    );
    expect(html).not.toContain("notify.0");
  });

  it("omits the Persons to Notify clause when every row is blank", () => {
    const html = renderBody(
      withInstructions(planWith(), {
        method: "burial",
        notify: [{ name: "", address: "", telephone: "" }],
      })
    );
    expect(html).not.toContain("Persons to Notify");
  });

  it("omits the arrangements clause when the arranger name is blank", () => {
    const html = renderBody(
      withInstructions(planWith(), {
        method: "burial",
        arranger: { name: "", address: "Addr", telephone: "555-0101" },
      })
    );
    expect(html).not.toContain("Arrangements.");
    const named = renderBody(
      withInstructions(planWith(), {
        arranger: { name: "Firm Gamma", address: "", telephone: "" },
      })
    );
    expect(named).toContain("Firm Gamma");
  });

  it("cites 68.50.160(2) when prearrangements were made", () => {
    const html = renderBody(
      withInstructions(planWith(), {
        arrangementsMade: "yes",
        arrangementsWith: "Home Delta",
      })
    );
    expect(html).toContain("Home Delta");
    expect(html).toContain("RCW 68.50.160(2)");
  });
});
