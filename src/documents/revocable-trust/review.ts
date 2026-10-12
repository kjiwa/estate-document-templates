import type { Advisory } from "../../model/advisory";
import { normalizeName } from "../../model/names";
import type { Plan } from "../../model/plan";

function scheduleAAdvisories(plan: Plan): Advisory[] {
  if (plan.documents.revocableTrust.scheduleA.some(Boolean)) return [];
  return [
    {
      id: "rt-schedule-a-empty",
      severity: "info",
      title: "Schedule A is empty",
      message:
        "A trust holds only property that has been transferred to the trustee. List the property to be placed in the trust, and retitle each asset to match.",
      path: "documents.revocableTrust.scheduleA",
    },
  ];
}

function successorTrusteeAdvisories(plan: Plan): Advisory[] {
  if (normalizeName(plan.documents.revocableTrust.successorTrustees.primary)) {
    return [];
  }
  return [
    {
      id: "rt-no-successor-trustee",
      severity: "warning",
      title: "No successor trustee named",
      message:
        "Without a named successor trustee, no one is chosen to manage the trust when the trustors cannot, and the beneficiaries or a court must appoint one.",
      path: "documents.revocableTrust.successorTrustees.primary",
    },
  ];
}

function finalTakerAdvisories(plan: Plan): Advisory[] {
  if (normalizeName(plan.documents.revocableTrust.finalTaker.name)) return [];
  return [
    {
      id: "rt-no-final-taker",
      severity: "info",
      title: "No final taker named",
      message:
        "If no spouse or descendant survives the last trustor, the trust property passes to the trustor's heirs at law. Name a final taker to choose who receives it instead.",
      path: "documents.revocableTrust.finalTaker.name",
    },
  ];
}

function jointWithoutSpouseAdvisories(plan: Plan): Advisory[] {
  const joint = plan.documents.revocableTrust.kind === "joint";
  const hasSpouse =
    plan.party.maritalStatus !== "unmarried" &&
    normalizeName(plan.party.spouse.name) !== "";
  if (!joint || hasSpouse) return [];
  return [
    {
      id: "rt-joint-without-spouse",
      severity: "warning",
      title: "Joint trust without a spouse",
      message:
        "A joint trust is created by spouses. Set the marital status to married and enter the spouse's name, or change the kind of trust to single.",
      path: "documents.revocableTrust.kind",
    },
  ];
}

function unusedTrustAdvisories(plan: Plan): Advisory[] {
  const trust = plan.documents.revocableTrust;
  const drafted =
    normalizeName(trust.trustName) !== "" || trust.scheduleA.some(Boolean);
  if (plan.basis === "trust" || !drafted) return [];
  return [
    {
      id: "rt-will-does-not-pour-over",
      severity: "info",
      title: "The Will does not pour over to this trust",
      message:
        "This trust is drafted, but the Will is set to distribute the estate itself. Property not transferred to the trustee during life passes under the Will, not this trust. Set the Will to pour over to the trust if that is intended.",
      path: "basis",
    },
  ];
}

export function analyzeRevocableTrust(plan: Plan): Advisory[] {
  return [
    ...scheduleAAdvisories(plan),
    ...successorTrusteeAdvisories(plan),
    ...finalTakerAdvisories(plan),
    ...jointWithoutSpouseAdvisories(plan),
    ...unusedTrustAdvisories(plan),
  ];
}
