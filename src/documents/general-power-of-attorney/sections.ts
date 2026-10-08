import type { Section } from "../../form/field-spec";

export const GENERAL_POA_SECTIONS: Section[] = [
  {
    id: "principal",
    legend: "Principal & Domicile",
    fields: [
      { kind: "text", path: "party.testator.name", label: "Full Legal Name" },
      {
        kind: "text",
        path: "party.testator.county",
        label: "County of Residence",
      },
      { kind: "text", path: "party.testator.state", label: "State" },
      { kind: "text", path: "execution.city", label: "City of Execution" },
    ],
  },
  {
    id: "agent",
    legend: "Appointment of Attorney-in-Fact",
    guidance: "agent",
    fields: [
      {
        kind: "text",
        path: "fiduciaries.attorneysInFact.primary",
        label: "Attorney-in-Fact",
      },
    ],
  },
  {
    id: "notary",
    legend: "Notary (Acknowledgment)",
    article: "Notarial Acknowledgment",
    guidance: "notary",
    fields: [
      { kind: "text", path: "execution.notary.name", label: "Notary Name" },
      {
        kind: "text",
        path: "execution.notary.commissionExpires",
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
        path: "execution.executionDate",
        label: "Date of Execution",
      },
    ],
  },
];
