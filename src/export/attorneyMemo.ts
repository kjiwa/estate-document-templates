import { analyzeProfile } from "../documents/will/review";
import type { Plan } from "../model/plan";

const OPEN_QUESTIONS_FOR_COUNSEL = [
  "Credit shelter / QTIP formula funding under chapter 11.108 RCW, if the disclaimer approach proves insufficient — deliberately out of scope for this template.",
  "The estate tax exclusion figures used in guidance are point-in-time and indexed annually; confirm the current-year figure before relying on them.",
  "No-contest clause enforceability is subject to judicially developed limits, not a statute this template can check.",
];

function formatChoice(label: string, value: unknown): string {
  return `- ${label}: ${value || "(unset)"}`;
}

// A plain-text companion document listing every choice made and every
// advisory raised, meant to be handed to counsel alongside the draft.
// Generated from the same plan and the same `analyzeProfile()` the Review
// panel uses, so it never says anything the editor didn't already surface.
export function generateAttorneyMemo(plan: Plan): string {
  const advisories = analyzeProfile(plan);
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

  lines.push("ADVISORIES RAISED");
  if (advisories.length === 0) {
    lines.push("- None raised by automated review.");
  } else {
    advisories.forEach((advisory) => {
      lines.push(
        `- [${advisory.severity}] ${advisory.title}: ${advisory.message}`
      );
    });
  }
  lines.push("");

  lines.push("OPEN QUESTIONS FOR COUNSEL");
  OPEN_QUESTIONS_FOR_COUNSEL.forEach((question) => lines.push(`- ${question}`));

  return lines.join("\n");
}
