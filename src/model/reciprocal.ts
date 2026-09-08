// Builds the reciprocal spouse's plan from a married plan: identity swap
// (testator <-> spouse) plus name substitution across the ten fiduciary
// slots and the ultimate beneficiary. A flat sequence of named steps, not a
// generic walker — the field set here is closed and enumerated in the
// parent plan's reciprocal-transform table, not something a future field
// addition should silently join by matching a shape.
import { normalizeName } from "./names";
import type { Plan } from "./plan";

// Compares with `normalizeName`; a name matching the old testator becomes
// the old spouse's stored name (verbatim) and vice versa. Anything else is
// left alone.
function substituteName(
  name: string,
  testatorName: string,
  spouseName: string
): string {
  const normalized = normalizeName(name);
  if (normalized && normalized === normalizeName(testatorName)) {
    return spouseName;
  }
  if (normalized && normalized === normalizeName(spouseName)) {
    return testatorName;
  }
  return name;
}

function swapIdentity(plan: Plan): Plan {
  return {
    ...plan,
    party: {
      ...plan.party,
      testator: {
        ...plan.party.testator,
        name: plan.party.spouse.name,
        gender: plan.party.spouse.gender,
      },
      spouse: {
        ...plan.party.spouse,
        name: plan.party.testator.name,
        gender: plan.party.testator.gender,
      },
    },
  };
}

function substituteFiduciaries(
  plan: Plan,
  testatorName: string,
  spouseName: string
): Plan {
  const sub = (name: string) => substituteName(name, testatorName, spouseName);
  return {
    ...plan,
    fiduciaries: {
      ...plan.fiduciaries,
      guardians: {
        primary: sub(plan.fiduciaries.guardians.primary),
        alternate: sub(plan.fiduciaries.guardians.alternate),
      },
      conservators: {
        primary: sub(plan.fiduciaries.conservators.primary),
        alternate: sub(plan.fiduciaries.conservators.alternate),
      },
      personalRepresentatives: {
        primary: sub(plan.fiduciaries.personalRepresentatives.primary),
        alternate: sub(plan.fiduciaries.personalRepresentatives.alternate),
      },
      trustees: {
        primary: sub(plan.fiduciaries.trustees.primary),
        alternate: sub(plan.fiduciaries.trustees.alternate),
      },
      remains: {
        ...plan.fiduciaries.remains,
        agent: sub(plan.fiduciaries.remains.agent),
        alternate: sub(plan.fiduciaries.remains.alternate),
      },
    },
  };
}

// The beneficiary's gender follows the name only when the name actually
// substituted — an unrelated beneficiary keeps their own recorded gender.
// `plan` here is already identity-swapped: `plan.party.testator` holds the
// old spouse's data and `plan.party.spouse` holds the old testator's.
function substituteBeneficiary(
  plan: Plan,
  testatorName: string,
  spouseName: string
): Plan {
  const original = plan.documents.will.ultimateBeneficiary;
  const substituted = substituteName(original.name, testatorName, spouseName);
  const changed = substituted !== original.name;
  const gender = changed
    ? normalizeName(original.name) === normalizeName(testatorName)
      ? plan.party.testator.gender
      : plan.party.spouse.gender
    : original.gender;

  return {
    ...plan,
    documents: {
      ...plan.documents,
      will: {
        ...plan.documents.will,
        ultimateBeneficiary: {
          ...original,
          name: substituted,
          gender,
        },
      },
    },
  };
}

export function reciprocalPlan(plan: Plan, id: string, label: string): Plan {
  const testatorName = plan.party.testator.name;
  const spouseName = plan.party.spouse.name;

  let result = swapIdentity(plan);
  result = substituteFiduciaries(result, testatorName, spouseName);
  result = substituteBeneficiary(result, testatorName, spouseName);

  return {
    ...result,
    id,
    label,
  };
}
