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

const ARRANGEMENTS_OPTIONS: readonly Option[] = [
  { value: "", label: "Not specified" },
  { value: "no", label: "No prearrangements made" },
  { value: "yes", label: "Prearrangements made" },
];

const METHOD_OPTIONS: readonly Option[] = [
  { value: "", label: "Not specified" },
  { value: "burial", label: "Burial" },
  { value: "cremation", label: "Cremation" },
];

const CREMAINS_OPTIONS: readonly Option[] = [
  { value: "", label: "Not specified" },
  { value: "columbarium", label: "Placed in a columbarium" },
  { value: "scattered", label: "Scattered" },
  { value: "interred", label: "Interred" },
  { value: "heldBy", label: "Held by a person" },
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
    id: "instructions",
    legend: "Funeral and Disposition Instructions (Article 2)",
    article: "2",
    guidance: "instructions",
    fields: [
      {
        kind: "select",
        path: "documents.remainsDirective.arrangementsMade",
        label: "Prearrangements Made",
        options: ARRANGEMENTS_OPTIONS,
      },
      {
        kind: "text",
        path: "documents.remainsDirective.arrangementsWith",
        label: "Prearranged With (establishment)",
      },
      {
        kind: "select",
        path: "documents.remainsDirective.method",
        label: "Method of Disposition",
        options: METHOD_OPTIONS,
      },
    ],
  },
  {
    id: "cremains",
    legend: "Cremated Remains (Article 2)",
    article: "2",
    guidance: "cremains",
    hidden: (plan) => plan.documents.remainsDirective.method !== "cremation",
    fields: [
      {
        kind: "select",
        path: "documents.remainsDirective.cremainsDisposition",
        label: "Disposition of Cremated Remains",
        options: CREMAINS_OPTIONS,
      },
      {
        kind: "text",
        path: "documents.remainsDirective.cremainsDetail",
        label: "Place, or Person Holding the Remains",
      },
    ],
  },
  {
    id: "arranger",
    legend: "Arrangements (Article 2)",
    article: "2",
    guidance: "arranger",
    fields: [
      {
        kind: "text",
        path: "documents.remainsDirective.arranger.name",
        label: "Arranger Name",
      },
      {
        kind: "text",
        path: "documents.remainsDirective.arranger.address",
        label: "Arranger Address",
      },
      {
        kind: "text",
        path: "documents.remainsDirective.arranger.telephone",
        label: "Arranger Telephone",
      },
    ],
  },
  {
    id: "notify",
    legend: "Persons to Notify (Article 2)",
    article: "2",
    guidance: "notify",
    fields: [
      {
        kind: "list",
        path: "documents.remainsDirective.notify",
        label: "Persons to Notify",
        addLabel: "Add person",
        columns: [
          { key: "name", label: "Name" },
          { key: "address", label: "Address" },
          { key: "telephone", label: "Telephone" },
        ],
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
