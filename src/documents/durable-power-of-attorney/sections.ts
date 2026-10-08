import type { Section } from "../../form/field-spec";
import { GENDER_OPTIONS } from "../shared/genderOptions";

export const DURABLE_POA_SECTIONS: Section[] = [
  {
    id: "principal",
    legend: "Principal & Domicile",
    fields: [
      { kind: "text", path: "party.testator.name", label: "Full Legal Name" },
      {
        kind: "select",
        path: "party.testator.gender",
        optional: true,
        label: "Gender / Pronouns",
        options: GENDER_OPTIONS,
      },
      {
        kind: "text",
        path: "party.testator.county",
        label: "County of Residence",
      },
      { kind: "text", path: "party.testator.state", label: "State" },
      {
        kind: "text",
        path: "executions.durablePowerOfAttorney.city",
        label: "City of Execution",
      },
    ],
  },
  {
    id: "agents",
    legend: "Appointment of Attorney-in-Fact",
    article: "1",
    guidance: "agents",
    fields: [
      {
        kind: "text",
        path: "fiduciaries.attorneysInFact.primary",
        label: "Attorney-in-Fact",
      },
      {
        kind: "text",
        path: "fiduciaries.attorneysInFact.alternate",
        label: "Alternate Attorney-in-Fact",
      },
    ],
  },
  {
    id: "elections",
    legend: "Optional Paragraphs",
    guidance: "elections",
    fields: [
      {
        kind: "checkbox",
        path: "documents.durablePowerOfAttorney.minorChildren",
        label: "Include authority over minor children",
      },
      {
        kind: "checkbox",
        path: "documents.durablePowerOfAttorney.lastGoodbyes",
        label: "Include the Last Goodbyes direction",
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
        path: "executions.durablePowerOfAttorney.notary.name",
        label: "Notary Name",
      },
      {
        kind: "text",
        path: "executions.durablePowerOfAttorney.notary.commissionExpires",
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
        path: "executions.durablePowerOfAttorney.executionDate",
        label: "Date of Execution",
      },
    ],
  },
];
