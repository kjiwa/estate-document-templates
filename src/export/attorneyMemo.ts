import type { DocumentDefinition } from "../documents/registry";
import { analyzeWill } from "../documents/will/review";
import { flattenFields, hasValue } from "../ui/completion";
import type { LeafFieldSpec } from "../form/registry";
import type { Advisory } from "../model/advisory";
import { getPath } from "../model/paths";
import type { Plan } from "../model/plan";

const OPEN_QUESTIONS_FOR_COUNSEL = [
  "Credit shelter / QTIP formula funding under chapter 11.108 RCW, if the disclaimer approach proves insufficient — deliberately out of scope for this template.",
  "The estate tax exclusion figures used in guidance are point-in-time and indexed annually; confirm the current-year figure before relying on them.",
  "No-contest clause enforceability is subject to judicially developed limits, not a statute this template can check.",
];

function formatChoice(label: string, value: unknown): string {
  const unset = value === undefined || value === null || value === "";
  return `- ${label}: ${unset ? "(unset)" : value}`;
}

function advisoryLines(advisories: Advisory[]): string[] {
  const lines = ["ADVISORIES RAISED"];
  if (advisories.length === 0) {
    lines.push("- None raised by automated review.");
  } else {
    advisories.forEach((advisory) => {
      lines.push(
        `- [${advisory.severity}] ${advisory.title}: ${advisory.message}`
      );
    });
  }
  return lines;
}

// A plain-text companion document listing every choice made and every
// advisory raised, meant to be handed to counsel alongside the draft.
// Generated from the same plan and the same `analyzeWill()` the Review
// panel uses, so it never says anything the editor didn't already surface.
export function generateAttorneyMemo(plan: Plan): string {
  const advisories = analyzeWill(plan);
  const lines: string[] = [];

  lines.push("ATTORNEY MEMORANDUM");
  lines.push(
    `Draft prepared for: ${plan.party.testator.name || "(unnamed testator)"}`
  );
  lines.push("");

  lines.push("CHOICES MADE");
  lines.push(formatChoice("Marital status", plan.party.maritalStatus));
  lines.push(
    formatChoice("Spousal gift structure", plan.documents.will.spousalGift)
  );
  lines.push(
    formatChoice(
      "Survivorship period (days)",
      plan.documents.will.survivorshipDays
    )
  );
  lines.push(
    formatChoice(
      "Guardian of the person (primary / alternate)",
      `${plan.fiduciaries.guardians.primary || "(unset)"} / ${plan.fiduciaries.guardians.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Conservator of the estate (primary / alternate)",
      `${plan.fiduciaries.conservators.primary || "(unset)"} / ${plan.fiduciaries.conservators.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Personal Representative (primary / alternate)",
      `${plan.fiduciaries.personalRepresentatives.primary || "(unset)"} / ${plan.fiduciaries.personalRepresentatives.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Trustee (primary / alternate)",
      `${plan.fiduciaries.trustees.primary || "(unset)"} / ${plan.fiduciaries.trustees.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Disposition of remains (agent / alternate)",
      `${plan.fiduciaries.remains.agent || "(unset)"} / ${plan.fiduciaries.remains.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Ultimate contingent beneficiary",
      plan.documents.will.ultimateBeneficiary.name
        ? `${plan.documents.will.ultimateBeneficiary.name} (${plan.documents.will.ultimateBeneficiary.relationship || "relationship unset"})`
        : ""
    )
  );
  lines.push(
    formatChoice(
      "Community property agreement on file",
      plan.documents.will.communityPropertyAgreement.exists ? "yes" : "no"
    )
  );
  lines.push("");

  lines.push(...advisoryLines(advisories));
  lines.push("");

  lines.push("OPEN QUESTIONS FOR COUNSEL");
  OPEN_QUESTIONS_FOR_COUNSEL.forEach((question) => lines.push(`- ${question}`));

  return lines.join("\n");
}

function formatListRow(row: unknown): string {
  if (typeof row === "string") return row.trim();
  if (row === null || typeof row !== "object") return "";
  return Object.values(row)
    .filter((cell) => typeof cell === "string" && cell.trim() !== "")
    .join(", ");
}

function formatFieldValue(field: LeafFieldSpec, value: unknown): string {
  if (field.kind === "checkbox") return "yes";
  if (field.kind === "list") {
    return (value as unknown[])
      .map(formatListRow)
      .filter((row) => row !== "")
      .join("; ");
  }
  if (field.kind === "select") {
    return field.options.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}

function sectionLines(
  plan: Plan,
  document: Pick<DocumentDefinition, "sections">
): string[] {
  const lines: string[] = [];
  for (const section of document.sections) {
    if (section.hidden?.(plan)) continue;
    const answered = (flattenFields(section.fields) as LeafFieldSpec[]).filter(
      (field) => !field.path.startsWith("executions.") && hasValue(plan, field)
    );
    if (answered.length === 0) continue;
    lines.push(section.legend.toUpperCase());
    answered.forEach((field) =>
      lines.push(
        `- ${field.label}: ${formatFieldValue(field, getPath(plan, field.path))}`
      )
    );
    lines.push("");
  }
  return lines;
}

// The memo for every document but the will: each section's answered fields,
// then the document's own review advisories. The signing-day record is left
// out; it is not a drafting choice.
export function documentMemo(
  document: Pick<DocumentDefinition, "title" | "sections" | "review">,
  plan: Plan
): string {
  return [
    "ATTORNEY MEMORANDUM",
    document.title,
    `Draft prepared for: ${plan.party.testator.name || "(unnamed)"}`,
    "",
    ...sectionLines(plan, document),
    ...advisoryLines(document.review(plan)),
  ].join("\n");
}
