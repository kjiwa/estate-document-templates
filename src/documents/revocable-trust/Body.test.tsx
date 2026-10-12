import { h } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { HighlightContext, PlanContext } from "../shared/PlanContext";
import { Body } from "./Body";

function planWith(
  overrides: Partial<Plan["documents"]["revocableTrust"]> = {},
  party: Record<string, unknown> = {}
): Plan {
  const result = migrateProfile("profile-1", { label: "Profile 1", ...party });
  if (!result.success) throw new Error(result.error);
  const plan = result.plan;
  return {
    ...plan,
    documents: {
      ...plan.documents,
      revocableTrust: { ...plan.documents.revocableTrust, ...overrides },
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

const JOINT_PARTY = {
  testator: { name: "Alex Rivera" },
  maritalStatus: "married",
  spouse: { name: "Taylor Rivera" },
};

describe("revocable-trust Body", () => {
  it("cites the confirmed statutes and interpolates the trustor's name", () => {
    const html = renderBody(
      planWith({}, { testator: { name: "Alex Rivera" } })
    );
    for (const cite of [
      "RCW 11.103.020",
      "RCW 11.103.030",
      "RCW 11.103.040",
      "RCW 11.98.011",
      "RCW 11.98.070",
      "RCW 6.32.250",
    ]) {
      expect(html).toContain(cite);
    }
    expect(html).toContain("Alex Rivera");
  });

  it("does not cite the unverified pour-over statute", () => {
    expect(renderBody(planWith())).not.toContain("11.12.250");
  });

  it("renders the joint rules and both trustors for a joint trust", () => {
    const html = renderBody(planWith({ kind: "joint" }, JOINT_PARTY));
    expect(html).toContain("Joint Trust Rules");
    expect(html).toContain("Taylor Rivera");
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    expect(document.querySelectorAll(".notary-block").length).toBe(2);
  });

  it("omits the joint rules, the second signature, and the second acknowledgment for a single trust", () => {
    const html = renderBody(planWith({}, JOINT_PARTY));
    expect(html).not.toContain("Joint Trust Rules");
    expect(html).not.toContain("Taylor Rivera, Trustor");
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    expect(document.querySelectorAll(".notary-block").length).toBe(1);
  });

  it("leaves the spouse out of a single, unmarried trust's disposition", () => {
    const html = renderBody(planWith({}, { maritalStatus: "unmarried" }));
    expect(html).not.toContain("Gift to Spouse");
  });

  it("gives a married single trustor's spouse the first gift", () => {
    const html = renderBody(planWith({}, JOINT_PARTY));
    expect(html).toContain("Gift to Spouse");
  });

  it("lists Schedule A assets", () => {
    const html = renderBody(
      planWith({ scheduleA: ["Checking account at First Bank"] })
    );
    expect(html).toContain("Checking account at First Bank");
  });

  it("makes no validity or compliance claim", () => {
    const html = renderBody(planWith({ kind: "joint" }, JOINT_PARTY));
    expect(html).not.toMatch(/compliant|attorney[- ]reviewed|legally\s+valid/i);
  });

  it("renders inert with no EditingContext.Provider", () => {
    const html = renderBody(planWith());
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    expect(document.querySelectorAll("[tabindex]").length).toBe(0);
    expect(document.querySelectorAll('[role="button"]').length).toBe(0);
    expect(document.querySelectorAll(".advisory-inline").length).toBe(0);
  });
});
