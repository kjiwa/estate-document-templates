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

  return advisories;
}
