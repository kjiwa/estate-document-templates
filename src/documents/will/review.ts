import { normalizeName } from "../../model/names";
import type { Plan } from "../../model/plan";
import type { Path } from "../../model/paths";

const RCW_INTERESTED_WITNESS = "RCW 11.12.160";
const RCW_DISCLAIMER_TRUST = "RCW 11.86.031";

export interface Advisory {
  id: string;
  severity: "info" | "warning";
  title: string;
  message: string;
  path: Path<Plan>;
}

interface RoleHolder {
  name: string;
  normalized: string;
  role: string;
  path: Path<Plan>;
}

function collectRoleHolders(plan: Plan): RoleHolder[] {
  const holders: RoleHolder[] = [];
  const add = (name: string | undefined, role: string, path: Path<Plan>) => {
    const normalized = normalizeName(name);
    if (normalized)
      holders.push({ name: String(name).trim(), normalized, role, path });
  };

  add(plan.party.spouse.name, "spouse", "party.spouse.name");
  add(
    plan.documents.will.ultimateBeneficiary.name,
    "ultimate contingent beneficiary",
    "documents.will.ultimateBeneficiary.name"
  );
  add(
    plan.fiduciaries.guardians.primary,
    "primary guardian",
    "fiduciaries.guardians.primary"
  );
  add(
    plan.fiduciaries.guardians.alternate,
    "alternate guardian",
    "fiduciaries.guardians.alternate"
  );
  add(
    plan.fiduciaries.conservators.primary,
    "primary conservator",
    "fiduciaries.conservators.primary"
  );
  add(
    plan.fiduciaries.conservators.alternate,
    "alternate conservator",
    "fiduciaries.conservators.alternate"
  );
  add(
    plan.fiduciaries.personalRepresentatives.primary,
    "primary personal representative",
    "fiduciaries.personalRepresentatives.primary"
  );
  add(
    plan.fiduciaries.personalRepresentatives.alternate,
    "alternate personal representative",
    "fiduciaries.personalRepresentatives.alternate"
  );
  add(
    plan.fiduciaries.trustees.primary,
    "primary trustee",
    "fiduciaries.trustees.primary"
  );
  add(
    plan.fiduciaries.trustees.alternate,
    "alternate trustee",
    "fiduciaries.trustees.alternate"
  );
  add(
    plan.fiduciaries.remains.agent,
    "remains agent",
    "fiduciaries.remains.agent"
  );
  add(
    plan.fiduciaries.remains.alternate,
    "alternate remains agent",
    "fiduciaries.remains.alternate"
  );
  (plan.party.children || []).forEach((child, index) =>
    add(child, "child", `party.children.${index}` as Path<Plan>)
  );

  return holders;
}

function interestedWitnessAdvisories(
  plan: Plan,
  holders: RoleHolder[]
): Advisory[] {
  const advisories: Advisory[] = [];
  (plan.execution.witnesses || []).forEach((witness, index) => {
    const normalized = normalizeName(witness?.name);
    if (!normalized) return;

    const roles = [
      ...new Set(
        holders
          .filter((holder) => holder.normalized === normalized)
          .map((holder) => holder.role)
      ),
    ];
    if (roles.length === 0) return;

    advisories.push({
      id: `interested-witness-${index}`,
      severity: "warning",
      title: "Interested witness",
      message: `Witness ${witness.name} is also named as ${roles.join(", ")}. Under ${RCW_INTERESTED_WITNESS}, an interested witness creates a rebuttable presumption that a gift to them was procured by duress, menace, fraud, or undue influence, unless there are two other disinterested subscribing witnesses; unrebutted, they take only their intestate share.`,
      path: `execution.witnesses.${index}.name` as Path<Plan>,
    });
  });
  return advisories;
}

function multipleRoleAdvisories(holders: RoleHolder[]): Advisory[] {
  const byName = new Map<
    string,
    { name: string; roles: Set<string>; path: Path<Plan> }
  >();
  holders.forEach((holder) => {
    if (!byName.has(holder.normalized)) {
      byName.set(holder.normalized, {
        name: holder.name,
        roles: new Set(),
        path: holder.path,
      });
    }
    byName.get(holder.normalized)!.roles.add(holder.role);
  });

  const advisories: Advisory[] = [];
  byName.forEach((entry, key) => {
    if (entry.roles.size < 2) return;
    advisories.push({
      id: `multi-role-${key}`,
      severity: "info",
      title: "Multiple roles held by one person",
      message: `${entry.name} holds ${entry.roles.size} roles: ${[...entry.roles].join(", ")}. This is lawful and common, but worth confirming it is intentional.`,
      path: entry.path,
    });
  });
  return advisories;
}

function trusteeBeneficiaryAdvisory(plan: Plan): Advisory | null {
  const trusteeNames = [
    plan.fiduciaries.trustees.primary,
    plan.fiduciaries.trustees.alternate,
  ]
    .map(normalizeName)
    .filter(Boolean);
  const beneficiaryNames = [
    plan.documents.will.ultimateBeneficiary.name,
    ...(plan.party.children || []),
  ]
    .map(normalizeName)
    .filter(Boolean);

  const overlaps = trusteeNames.some((name) => beneficiaryNames.includes(name));
  if (!overlaps) return null;

  return {
    id: "trustee-is-beneficiary",
    severity: "info",
    title: "Trustee is also a trust beneficiary",
    message:
      "The named Trustee is also a beneficiary of the trust they would administer. This is a conflict of interest worth conscious acceptance.",
    path: "fiduciaries.trustees.primary",
  };
}

const FIDUCIARY_OFFICES: [
  "guardians" | "conservators" | "personalRepresentatives" | "trustees",
  string,
][] = [
  ["guardians", "guardian"],
  ["conservators", "conservator"],
  ["personalRepresentatives", "personal representative"],
  ["trustees", "trustee"],
];

function missingAlternateAdvisories(plan: Plan): Advisory[] {
  return FIDUCIARY_OFFICES.filter(([key]) => {
    const office = plan.fiduciaries[key];
    return office.primary && !office.alternate;
  }).map(([key, label]) => ({
    id: `no-alternate-${key}`,
    severity: "warning",
    title: `No alternate ${label} named`,
    message: `A primary ${label} is named but no alternate. If the primary is unable or unwilling to serve, there is no named successor.`,
    path: `fiduciaries.${key}.alternate` as Path<Plan>,
  }));
}

function completenessAdvisories(plan: Plan): Advisory[] {
  const advisories: Advisory[] = [];

  const date = plan.execution.executionDate;
  if (!date.day || !date.month || !date.year) {
    advisories.push({
      id: "execution-date-unset",
      severity: "info",
      title: "Execution date unset",
      message:
        "The execution date is not fully set. Expected before signing, but confirm it is completed at execution.",
      path: "execution.executionDate.day",
    });
  }

  if (!plan.party.children || plan.party.children.length === 0) {
    advisories.push({
      id: "children-empty",
      severity: "info",
      title: "No children listed",
      message:
        "No children are listed. Confirm this is accurate before execution.",
      path: "party.children",
    });
  }

  if (
    plan.party.maritalStatus !== "unmarried" &&
    !normalizeName(plan.party.spouse.name)
  ) {
    advisories.push({
      id: "married-no-spouse-name",
      severity: "warning",
      title: "Married with no spouse named",
      message:
        "Marital status is married, but no spouse name is set. Article 1.1 and every spousal gift clause will render against a blank until one is entered.",
      path: "party.spouse.name",
    });
  }

  if (
    plan.documents.will.spousalGift === "disclaimerTrust" &&
    !plan.fiduciaries.trustees.primary
  ) {
    advisories.push({
      id: "disclaimer-trust-no-trustee",
      severity: "warning",
      title: "Disclaimer trust selected with no trustee named",
      message: `The disclaimer trust structure under ${RCW_DISCLAIMER_TRUST} is selected, but no primary Trustee is named to administer the resulting trust.`,
      path: "fiduciaries.trustees.primary",
    });
  }

  return advisories;
}

export function analyzeProfile(plan: Plan): Advisory[] {
  const holders = collectRoleHolders(plan);
  const trusteeAdvisory = trusteeBeneficiaryAdvisory(plan);

  return [
    ...interestedWitnessAdvisories(plan, holders),
    ...multipleRoleAdvisories(holders),
    ...(trusteeAdvisory ? [trusteeAdvisory] : []),
    ...missingAlternateAdvisories(plan),
    ...completenessAdvisories(plan),
  ];
}
