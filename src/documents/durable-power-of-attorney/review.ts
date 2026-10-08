import type { Advisory } from "../../model/advisory";
import { normalizeName } from "../../model/names";
import type { Plan } from "../../model/plan";

const PRIMARY_PATH = "fiduciaries.attorneysInFact.primary";
const ALTERNATE_PATH = "fiduciaries.attorneysInFact.alternate";

export function analyzeDurablePowerOfAttorney(plan: Plan): Advisory[] {
  const primary = normalizeName(plan.fiduciaries.attorneysInFact.primary);
  const alternate = normalizeName(plan.fiduciaries.attorneysInFact.alternate);

  if (!primary) {
    return [
      {
        id: "dpoa-agent-unset",
        severity: "warning",
        title: "No attorney-in-fact named",
        message:
          "Without a named attorney-in-fact, this power of attorney gives no one authority to act when you are incapacitated.",
        path: PRIMARY_PATH,
      },
    ];
  }

  const advisories: Advisory[] = [];

  if (primary === normalizeName(plan.party.testator.name)) {
    advisories.push({
      id: "dpoa-agent-is-principal",
      severity: "warning",
      title: "Attorney-in-fact is the principal",
      message:
        "The attorney-in-fact has the same name as the principal. Name a different person to act on your behalf.",
      path: PRIMARY_PATH,
    });
  }

  if (alternate && alternate === primary) {
    advisories.push({
      id: "dpoa-alternate-equals-primary",
      severity: "warning",
      title: "Alternate is the same as the primary",
      message:
        "The alternate attorney-in-fact has the same name as the primary, so no one else can step in. Name a different person.",
      path: ALTERNATE_PATH,
    });
  }

  return advisories;
}
