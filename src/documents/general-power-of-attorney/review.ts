import type { Advisory } from "../../model/advisory";
import { normalizeName } from "../../model/names";
import type { Plan } from "../../model/plan";

export function analyzeGeneralPowerOfAttorney(plan: Plan): Advisory[] {
  const agent = normalizeName(plan.fiduciaries.attorneysInFact.primary);

  if (!agent) {
    return [
      {
        id: "gpoa-agent-unset",
        severity: "warning",
        title: "No attorney-in-fact named",
        message:
          "Without a named attorney-in-fact, this power of attorney gives no one authority to act and nominates no one as guardian.",
        path: "fiduciaries.attorneysInFact.primary",
      },
    ];
  }

  if (agent === normalizeName(plan.party.testator.name)) {
    return [
      {
        id: "gpoa-agent-is-principal",
        severity: "warning",
        title: "Attorney-in-fact is the principal",
        message:
          "The attorney-in-fact has the same name as the principal. Name a different person to act on your behalf.",
        path: "fiduciaries.attorneysInFact.primary",
      },
    ];
  }

  return [];
}
