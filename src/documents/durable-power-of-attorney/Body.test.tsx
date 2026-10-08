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

function withAgents(plan: Plan, primary: string, alternate: string): Plan {
  return {
    ...plan,
    fiduciaries: {
      ...plan.fiduciaries,
      attorneysInFact: { primary, alternate },
    },
  };
}

function withElections(
  plan: Plan,
  elections: { minorChildren: boolean; lastGoodbyes: boolean }
): Plan {
  return {
    ...plan,
    documents: { ...plan.documents, durablePowerOfAttorney: elections },
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

function numberedTitles(html: string): string[] {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  return [...document.querySelectorAll("div.clause > strong")]
    .map((el) => el.textContent ?? "")
    .filter((title) => /^\d+\. /.test(title));
}

describe("durable-power-of-attorney Body", () => {
  it("renders a blank plan with blanks and no 'undefined'", () => {
    const html = renderBody(planWith());
    expect(html).not.toContain("undefined");
    expect(html).toContain('data-path="fiduciaries.attorneysInFact.primary"');
    expect(html).toContain('data-path="fiduciaries.attorneysInFact.alternate"');
  });

  it("names the primary and alternate attorney-in-fact in paragraph 1", () => {
    const plan = withAgents(
      planWith({ testator: { name: "Alex Rivera" } }),
      "Jordan Lee",
      "Sam Park"
    );
    const text = textOf(renderBody(plan));
    expect(text).toContain("Alex Rivera");
    expect(text).toContain(
      "1. Appointment. I designate and appoint Jordan Lee"
    );
    expect(text).toContain("I appoint Sam Park as my attorney-in-fact");
  });

  it("numbers paragraphs 1-13 with Photocopies at 13 when both elections are off", () => {
    const titles = numberedTitles(renderBody(planWith()));
    expect(titles).toHaveLength(13);
    expect(titles[10]).toBe("11. HIPAA Release Authority.");
    expect(titles[11]).toBe(
      "12. Digital Assets and Electronic Communications."
    );
    expect(titles[12]).toBe("13. Photocopies.");
  });

  it("inserts Minor at 12 and moves Photocopies to 14 when minorChildren is on", () => {
    const plan = withElections(planWith(), {
      minorChildren: true,
      lastGoodbyes: false,
    });
    const titles = numberedTitles(renderBody(plan));
    expect(titles).toHaveLength(14);
    expect(titles[11]).toBe("12. Minor Health Care and Financial Decisions.");
    expect(titles[13]).toBe("14. Photocopies.");
    expect(textOf(renderBody(plan))).toContain("RCW 11.125.410");
  });

  it("appends Last Goodbyes last when lastGoodbyes is on", () => {
    const plan = withElections(planWith(), {
      minorChildren: false,
      lastGoodbyes: true,
    });
    const titles = numberedTitles(renderBody(plan));
    expect(titles).toHaveLength(14);
    expect(titles[13]).toBe("14. Last Goodbyes.");
  });

  it("numbers all fifteen paragraphs when both elections are on", () => {
    const plan = withElections(planWith(), {
      minorChildren: true,
      lastGoodbyes: true,
    });
    const titles = numberedTitles(renderBody(plan));
    expect(titles).toHaveLength(15);
    expect(titles[14]).toBe("15. Last Goodbyes.");
  });

  it("keeps cross-references pointing at fixed paragraphs", () => {
    const text = textOf(renderBody(planWith()));
    expect(text).toContain("circumstances described in Paragraph 2 above");
    expect(text).toContain("as provided in Paragraph 6 hereof");
    expect(text).toContain("except as provided in Paragraph 3.H.8 above");
    expect(text).toContain("2. Effectiveness.");
    expect(text).toContain("6. Revocation and Termination.");
  });

  it("states durability in the words of RCW 11.125.040", () => {
    const text = textOf(renderBody(planWith()));
    expect(text).toContain("RCW 11.125.040");
    expect(text).toContain(
      "This power of attorney shall not be affected by disability of the principal"
    );
  });

  it("cites RCW 11.125.020(5) and chapter 11.120 RCW", () => {
    const text = textOf(renderBody(planWith()));
    expect(text).toContain("within the meaning of RCW 11.125.020(5)");
    expect(text).toContain("chapter 11.120 RCW");
    expect(text).toContain("42 U.S.C. Sec. 1320d");
  });

  it("lists exactly the three RCW 11.130.335(3) exclusions", () => {
    const text = textOf(renderBody(planWith()));
    expect(text).toContain("RCW 11.125.400");
    expect(text).toContain(
      "(1) therapy or other procedure to induce convulsion"
    );
    expect(text).toContain(
      "(2) surgery solely for the purpose of psychosurgery"
    );
    expect(text).toContain("(3) other psychiatric or mental health procedures");
    expect(text).not.toContain("(4) other psychiatric");
    expect(text.toLowerCase()).not.toContain("amputation");
  });

  it("puts the certification on its own page, citing Paragraph 2", () => {
    const html = renderBody(planWith());
    const text = textOf(html);
    expect(html).toContain("page-break-before");
    expect(text).toContain(
      "Do not complete this page at the time of signing. This page to be completed by the physician at the time of incapacity."
    );
    expect(text).toContain("disabled as defined in Paragraph 2");
    expect(text).not.toContain("defined in paragraph 1");
    expect(html.match(/class="no-break"/g)).toHaveLength(3);
  });

  it("acknowledges the principal alone, with no witness lines", () => {
    const html = renderBody(planWith());
    const text = textOf(html);
    expect(text).toContain("Notarial Acknowledgment");
    expect(text).toContain("RCW 11.125.050");
    expect(text).not.toContain("Witness");
    expect(html).not.toContain("execution.witnesses");
  });
});
