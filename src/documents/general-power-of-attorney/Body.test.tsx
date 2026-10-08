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

function withAgent(plan: Plan, primary: string): Plan {
  return {
    ...plan,
    fiduciaries: {
      ...plan.fiduciaries,
      attorneysInFact: { ...plan.fiduciaries.attorneysInFact, primary },
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

function textOf(html: string): string {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  return (document.body.textContent ?? "").replace(/\s+/g, " ");
}

describe("general-power-of-attorney Body", () => {
  it("renders a blank plan with blanks and no 'undefined'", () => {
    const html = renderBody(planWith());
    expect(html).not.toContain("undefined");
    expect(html).toContain('data-path="fiduciaries.attorneysInFact.primary"');
  });

  it("names the attorney-in-fact in the appointment and the guardianship nomination", () => {
    const plan = withAgent(
      planWith({ testator: { name: "Alex Rivera" } }),
      "Jordan Lee"
    );
    const text = textOf(renderBody(plan));
    expect(text).toContain("Alex Rivera");
    expect(text).toContain("appoint Jordan Lee, as my attorney-in-fact");
    expect(text).toContain(
      "I nominate my attorney-in-fact, Jordan Lee, as my guardian"
    );
  });

  it("recites RCW 11.125.100 verbatim where the source misquoted it", () => {
    const text = textOf(renderBody(planWith()));
    expect(text).toContain("RCW 11.125.100");
    expect(text).toContain("if the power of attorney is not durable");
    expect(text).toContain("An agent's authority terminates when:");
    expect(text).toContain("under subsection (2)(c) of this section");
  });

  it("cites chapter 11.120 RCW for digital assets", () => {
    expect(textOf(renderBody(planWith()))).toContain("chapter 11.120 RCW");
  });

  it("contains no durability language", () => {
    const text = textOf(renderBody(planWith())).toLowerCase();
    expect(text).not.toContain("not be affected by disability");
  });

  it("acknowledges the principal alone, with no witness lines", () => {
    const html = renderBody(planWith());
    const text = textOf(html);
    expect(text).toContain("Notarial Acknowledgment");
    expect(text).toContain("RCW 11.125.050");
    expect(text).not.toContain("not required");
    expect(text).not.toContain("Witness");
    expect(html).not.toContain("execution.witnesses");
  });
});
