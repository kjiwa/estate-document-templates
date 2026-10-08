import type { Advisory } from "../../model/advisory";
import type { Plan } from "../../model/plan";

// No interested-witness rule here, deliberately: RCW 11.12.160 concerns
// beneficiaries under a will, and a remains agent is not one — the will's
// `collectRoleHolders` (`../will/review.ts`) correctly never adds
// `fiduciaries.remains.*`, and this document has no equivalent rule to add.
export function analyzeDirective(plan: Plan): Advisory[] {
  const advisories: Advisory[] = [];
  const agent = plan.fiduciaries.remains.agent.trim();
  const alternate = plan.fiduciaries.remains.alternate.trim();

  if (!agent) {
    advisories.push({
      id: "remains-agent-unset",
      severity: "warning",
      title: "No agent named",
      message:
        "Without a named agent, the right to control disposition of your remains falls to the statutory priority order in RCW 68.50.160(3) instead of your own choice.",
      path: "fiduciaries.remains.agent",
    });
  } else if (!alternate) {
    advisories.push({
      id: "remains-alternate-unset",
      severity: "info",
      title: "No alternate agent named",
      message:
        "If your named agent is unable or unwilling to act, disposition reverts to the statutory priority order in RCW 68.50.160(3) unless an alternate is named here.",
      path: "fiduciaries.remains.alternate",
    });
  }

  const preference = plan.fiduciaries.remains.preference;
  const method = plan.documents.remainsDirective.method;
  const opposite = method === "burial" ? /cremat/i : /buri/i;
  if (
    (method === "burial" || method === "cremation") &&
    opposite.test(preference)
  ) {
    advisories.push({
      id: "remains-preference-contradiction",
      severity: "info",
      title: "Wishes mention the other method",
      message: `Your wishes mention ${method === "burial" ? "cremation" : "burial"}, but Article 2 directs ${method}. Confirm they agree; wording such as "not cremated" is also flagged. The same wishes text appears in the will's Article 2.`,
      path: "fiduciaries.remains.preference",
    });
  }

  return advisories;
}
