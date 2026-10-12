import type { Section } from "../../form/field-spec";
import { GENDER_OPTIONS } from "../shared/genderOptions";

export const REVOCABLE_TRUST_SECTIONS: Section[] = [
  {
    id: "trustors",
    legend: "Trustors & Kind of Trust",
    guidance: "kind",
    fields: [
      {
        kind: "select",
        path: "documents.revocableTrust.kind",
        label: "Kind of Trust",
        options: [
          { value: "single", label: "Single (one trustor)" },
          { value: "joint", label: "Joint (spouses as co-trustors)" },
        ],
      },
      { kind: "text", path: "party.testator.name", label: "Full Legal Name" },
      {
        kind: "text",
        path: "party.testator.county",
        label: "County of Residence",
      },
      {
        kind: "select",
        path: "party.maritalStatus",
        label: "Marital Status",
        options: [
          { value: "married", label: "Married" },
          { value: "unmarried", label: "Unmarried" },
        ],
      },
      {
        kind: "text",
        path: "party.spouse.name",
        optional: (plan) =>
          plan.documents.revocableTrust.kind !== "joint" &&
          plan.party.maritalStatus === "unmarried",
        label: "Spouse Name",
      },
      {
        kind: "select",
        path: "party.spouse.gender",
        optional: true,
        label: "Spouse Gender / Pronouns",
        options: GENDER_OPTIONS,
      },
      {
        kind: "text",
        path: "executions.revocableTrust.city",
        label: "City of Execution",
      },
    ],
  },
  {
    id: "trust-name",
    legend: "Trust Name (Article 1.2)",
    article: "1.2",
    guidance: "trustName",
    fields: [
      {
        kind: "text",
        path: "documents.revocableTrust.trustName",
        label: "Trust Name",
      },
    ],
  },
  {
    id: "successor-trustees",
    legend: "Successor Trustees (Article 5)",
    article: "5",
    guidance: "successorTrustees",
    fields: [
      {
        kind: "text",
        path: "documents.revocableTrust.successorTrustees.primary",
        label: "Primary Successor Trustee",
      },
      {
        kind: "text",
        path: "documents.revocableTrust.successorTrustees.alternate",
        label: "Alternate Successor Trustee",
      },
    ],
  },
  {
    id: "final-taker",
    legend: "Final Taker (Article 6)",
    article: "6",
    guidance: "finalTaker",
    fields: [
      {
        kind: "text",
        path: "documents.revocableTrust.finalTaker.relationship",
        label: "Relationship",
      },
      {
        kind: "text",
        path: "documents.revocableTrust.finalTaker.name",
        label: "Name",
      },
      {
        kind: "select",
        path: "documents.revocableTrust.finalTaker.gender",
        optional: true,
        label: "Gender / Pronouns",
        options: GENDER_OPTIONS,
      },
    ],
  },
  {
    id: "schedule-a",
    legend: "Schedule A (Trust Property)",
    article: "Schedule A",
    guidance: "scheduleA",
    fields: [
      {
        kind: "list",
        path: "documents.revocableTrust.scheduleA",
        optional: true,
        label: "Asset Description",
        addLabel: "Add Asset",
      },
    ],
  },
  {
    id: "notary",
    legend: "Notary (Acknowledgment)",
    article: "Notarial Acknowledgment",
    guidance: "notary",
    fields: [
      {
        kind: "text",
        path: "executions.revocableTrust.notary.name",
        label: "Notary Name",
      },
      {
        kind: "text",
        path: "executions.revocableTrust.notary.commissionExpires",
        label: "Commission Expires",
      },
    ],
  },
  {
    id: "execution-date",
    legend: "Execution Date (Testimonium)",
    article: "Testimonium",
    fields: [
      {
        kind: "executionDate",
        path: "executions.revocableTrust.executionDate",
        label: "Date of Execution",
      },
    ],
  },
];
