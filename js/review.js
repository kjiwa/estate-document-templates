// Pure function over a profile: no DOM, no state import, so it is directly
// unit-testable and safe to reuse from the attorney-memo export.

import { normalizeName } from "./utils.js";

const RCW_INTERESTED_WITNESS = "RCW 11.12.160";
const RCW_DISCLAIMER_TRUST = "RCW 11.86.031";

function collectRoleHolders(profile) {
  const holders = [];
  const add = (name, role) => {
    const normalized = normalizeName(name);
    if (normalized)
      holders.push({ name: String(name).trim(), normalized, role });
  };

  add(profile.spouse?.name, "spouse");
  add(profile.ultimateBeneficiary?.name, "ultimate contingent beneficiary");
  add(profile.guardians?.primary, "primary guardian");
  add(profile.guardians?.alternate, "alternate guardian");
  add(profile.conservators?.primary, "primary conservator");
  add(profile.conservators?.alternate, "alternate conservator");
  add(
    profile.personalRepresentatives?.primary,
    "primary personal representative"
  );
  add(
    profile.personalRepresentatives?.alternate,
    "alternate personal representative"
  );
  add(profile.trustees?.primary, "primary trustee");
  add(profile.trustees?.alternate, "alternate trustee");
  add(profile.remains?.agent, "remains agent");
  add(profile.remains?.alternate, "alternate remains agent");
  (profile.children || []).forEach((child) => add(child, "child"));

  return holders;
}

function interestedWitnessAdvisories(profile, holders) {
  const advisories = [];
  (profile.witnesses || []).forEach((witness, index) => {
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
    });
  });
  return advisories;
}

function multipleRoleAdvisories(holders) {
  const byName = new Map();
  holders.forEach((holder) => {
    if (!byName.has(holder.normalized)) {
      byName.set(holder.normalized, { name: holder.name, roles: new Set() });
    }
    byName.get(holder.normalized).roles.add(holder.role);
  });

  const advisories = [];
  byName.forEach((entry, key) => {
    if (entry.roles.size < 2) return;
    advisories.push({
      id: `multi-role-${key}`,
      severity: "info",
      title: "Multiple roles held by one person",
      message: `${entry.name} holds ${entry.roles.size} roles: ${[...entry.roles].join(", ")}. This is lawful and common, but worth confirming it is intentional.`,
    });
  });
  return advisories;
}

function trusteeBeneficiaryAdvisory(profile) {
  const trusteeNames = [profile.trustees?.primary, profile.trustees?.alternate]
    .map(normalizeName)
    .filter(Boolean);
  const beneficiaryNames = [
    profile.ultimateBeneficiary?.name,
    ...(profile.children || []),
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
  };
}

const FIDUCIARY_OFFICES = [
  ["guardians", "guardian"],
  ["conservators", "conservator"],
  ["personalRepresentatives", "personal representative"],
  ["trustees", "trustee"],
];

function missingAlternateAdvisories(profile) {
  return FIDUCIARY_OFFICES.filter(
    ([key]) => profile[key]?.primary && !profile[key]?.alternate
  ).map(([key, label]) => ({
    id: `no-alternate-${key}`,
    severity: "warning",
    title: `No alternate ${label} named`,
    message: `A primary ${label} is named but no alternate. If the primary is unable or unwilling to serve, there is no named successor.`,
  }));
}

function completenessAdvisories(profile) {
  const advisories = [];

  const date = profile.executionDate || {};
  if (!date.day || !date.month || !date.year) {
    advisories.push({
      id: "execution-date-unset",
      severity: "info",
      title: "Execution date unset",
      message:
        "The execution date is not fully set. Expected before signing, but confirm it is completed at execution.",
    });
  }

  if (!profile.children || profile.children.length === 0) {
    advisories.push({
      id: "children-empty",
      severity: "info",
      title: "No children listed",
      message:
        "No children are listed. Confirm this is accurate before execution.",
    });
  }

  if (profile.spousalGift === "disclaimerTrust" && !profile.trustees?.primary) {
    advisories.push({
      id: "disclaimer-trust-no-trustee",
      severity: "warning",
      title: "Disclaimer trust selected with no trustee named",
      message: `The disclaimer trust structure under ${RCW_DISCLAIMER_TRUST} is selected, but no primary Trustee is named to administer the resulting trust.`,
    });
  }

  return advisories;
}

export function analyzeProfile(profile = {}) {
  const holders = collectRoleHolders(profile);
  const trusteeAdvisory = trusteeBeneficiaryAdvisory(profile);

  return [
    ...interestedWitnessAdvisories(profile, holders),
    ...multipleRoleAdvisories(holders),
    ...(trusteeAdvisory ? [trusteeAdvisory] : []),
    ...missingAlternateAdvisories(profile),
    ...completenessAdvisories(profile),
  ];
}
