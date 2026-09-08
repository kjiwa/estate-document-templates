import type { Section, Option } from "../../form/field-spec";

// Every field the directive's document body reads. Reuses `party.testator`,
// `fiduciaries.remains`, and `execution` — no schema change, so this is the
// sharpest available test of the Phase 3 seam (Phase 5's own framing).
const GENDER_OPTIONS: readonly Option[] = [
  { value: "", label: "Not specified" },
  { value: "male", label: "Male (he / him / his)" },
  { value: "female", label: "Female (she / her / hers)" },
  { value: "nonbinary", label: "Non-binary (they / them / theirs)" },
];

export const DIRECTIVE_SECTIONS: Section[] = [
  {
    id: "declarant",
    legend: "Declarant & Domicile",
    fields: [
      { kind: "text", path: "party.testator.name", label: "Full Legal Name" },
      {
        kind: "select",
        path: "party.testator.gender",
        label: "Gender / Pronouns",
        options: GENDER_OPTIONS,
      },
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
    legend: "Designation of Agent (Article 1)",
    article: "1",
    guidance: "agent",
    fields: [
      {
        kind: "text",
        path: "fiduciaries.remains.agent",
        label: "Agent",
      },
      {
        kind: "text",
        path: "fiduciaries.remains.alternate",
        label: "Alternate Agent",
      },
      {
        kind: "text",
        path: "fiduciaries.remains.preference",
        label: "Wishes (optional, non-binding)",
      },
    ],
  },
  {
    id: "witnesses",
    legend: "Witnesses (Attestation)",
    article: "Attestation",
    guidance: "witnesses",
    fields: [
      {
        kind: "text",
        path: "execution.witnesses.0.name",
        label: "Witness 1 Name",
      },
      {
        kind: "text",
        path: "execution.witnesses.0.address",
        label: "Witness 1 Address",
      },
      {
        kind: "text",
        path: "execution.witnesses.0.cityStateZip",
        label: "Witness 1 City, State, Zip",
      },
      {
        kind: "text",
        path: "execution.witnesses.1.name",
        label: "Witness 2 Name",
      },
      {
        kind: "text",
        path: "execution.witnesses.1.address",
        label: "Witness 2 Address",
      },
      {
        kind: "text",
        path: "execution.witnesses.1.cityStateZip",
        label: "Witness 2 City, State, Zip",
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
        path: "execution.notary.name",
        label: "Notary Name",
      },
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
