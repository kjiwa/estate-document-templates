import type { Advisory } from "../../model/advisory";
import { normalizeName } from "../../model/names";
import type { Path } from "../../model/paths";
import type { Plan } from "../../model/plan";

const RCW_WITNESS_QUALIFICATION = "RCW 70.122.030";

type ElectionKey = "artificialNutrition" | "artificialHydration" | "cpr";

interface ElectionField {
  id: string;
  key: ElectionKey;
  path: Path<Plan>;
  label: string;
}

const ELECTION_FIELDS: ElectionField[] = [
  {
    id: "hcd-nutrition-unset",
    key: "artificialNutrition",
    path: "documents.healthCareDirective.artificialNutrition",
    label: "Artificial nutrition",
  },
  {
    id: "hcd-hydration-unset",
    key: "artificialHydration",
    path: "documents.healthCareDirective.artificialHydration",
    label: "Artificial hydration",
  },
  {
    id: "hcd-cpr-unset",
    key: "cpr",
    path: "documents.healthCareDirective.cpr",
    label: "CPR",
  },
];

function unsetElectionAdvisories(plan: Plan): Advisory[] {
  return ELECTION_FIELDS.filter(
    (field) => plan.documents.healthCareDirective[field.key] === ""
  ).map((field) => ({
    id: field.id,
    severity: "info",
    title: `${field.label} undecided`,
    message: `This row is undecided, so the attending physician has no direction for ${field.label.toLowerCase()} if you are ever diagnosed with a terminal condition or a permanent unconscious condition.`,
    path: field.path,
  }));
}

// RCW 70.122.030(1)'s disqualifications differ from the will's interested-
// witness rule (RCW 11.12.160): a taker under the Will is disqualified here
// only if also related to the Declarer by blood or marriage, or entitled to
// a share of the estate — a personal representative or trustee named but
// unrelated and with no share is not disqualified. So this check is
// computed locally against its own, smaller set of takers, rather than
// reusing `will/review.ts`'s `collectRoleHolders`.
function disqualifiedTakers(plan: Plan): Set<string> {
  const takers = new Set<string>();
  const add = (name: string | undefined) => {
    const normalized = normalizeName(name);
    if (normalized) takers.add(normalized);
  };
  add(plan.party.spouse.name);
  (plan.party.children || []).forEach(add);
  add(plan.documents.will.ultimateBeneficiary.name);
  return takers;
}

function disqualifiedWitnessAdvisories(plan: Plan): Advisory[] {
  const takers = disqualifiedTakers(plan);
  const advisories: Advisory[] = [];

  (plan.execution.witnesses || []).forEach((witness, index) => {
    const normalized = normalizeName(witness?.name);
    if (!normalized || !takers.has(normalized)) return;

    advisories.push({
      id: `hcd-disqualified-witness-${index}`,
      severity: "warning",
      title: "Disqualified witness",
      message: `Witness ${witness.name} appears to be related to you or entitled to a share of your estate. Under ${RCW_WITNESS_QUALIFICATION}, a witness to this Directive must not be related to you by blood or marriage, or entitled to any portion of your estate.`,
      path: `execution.witnesses.${index}.name` as Path<Plan>,
    });
  });

  return advisories;
}

export function analyzeHealthCareDirective(plan: Plan): Advisory[] {
  return [
    ...unsetElectionAdvisories(plan),
    ...disqualifiedWitnessAdvisories(plan),
  ];
}
