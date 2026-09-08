import type { Section, Option } from "../../form/field-spec";

// Populated from today's real form: `js/app.js`'s `FIELD_BINDINGS` (36
// entries) plus its one `CHECKBOX_BINDINGS` entry, grouped by `index.html`'s
// 12 content fieldsets. Article numbers are taken only from legends that
// already name one; "Active Profile" and "Data Management & Export" are
// chrome and do not appear here.
const GENDER_OPTIONS: readonly Option[] = [
  { value: "", label: "Not specified" },
  { value: "male", label: "Male (he / him / his)" },
  { value: "female", label: "Female (she / her / hers)" },
  { value: "nonbinary", label: "Non-binary (they / them / theirs)" },
];

export const WILL_SECTIONS: Section[] = [
  {
    id: "testator",
    legend: "Testator & Domicile",
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
    id: "family",
    legend: "Family",
    guidance: "maritalStatus",
    fields: [
      {
        kind: "select",
        path: "party.maritalStatus",
        label: "Marital Status",
        options: [
          { value: "married", label: "Married" },
          { value: "unmarried", label: "Unmarried" },
        ],
      },
      { kind: "text", path: "party.spouse.name", label: "Spouse Name" },
      {
        kind: "select",
        path: "party.spouse.gender",
        label: "Spouse Gender / Pronouns",
        options: GENDER_OPTIONS,
      },
    ],
  },
  {
    id: "children",
    legend: "Children (Article 1.1)",
    article: "1.1",
    guidance: "children",
    fields: [
      {
        kind: "list",
        path: "party.children",
        label: "Full Name",
        addLabel: "Add Child",
      },
    ],
  },
  {
    id: "guardians-conservators",
    legend: "Guardians and Conservators (Article 1.2–1.3)",
    article: "1.2–1.3",
    guidance: ["guardians", "conservators"],
    fields: [
      {
        kind: "text",
        path: "fiduciaries.guardians.primary",
        label: "Primary Guardian (of the person)",
      },
      {
        kind: "text",
        path: "fiduciaries.guardians.alternate",
        label: "Alternate Guardian",
      },
      {
        kind: "text",
        path: "fiduciaries.conservators.primary",
        label: "Primary Conservator (of the estate)",
      },
      {
        kind: "text",
        path: "fiduciaries.conservators.alternate",
        label: "Alternate Conservator",
      },
    ],
  },
  {
    id: "remains",
    legend: "Disposition of Remains (Article 2)",
    article: "2",
    guidance: "remains",
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
        label: "Preference (optional, non-binding)",
      },
    ],
  },
  {
    id: "property",
    legend: "Disposition of Property (Article 3)",
    article: "3",
    guidance: ["spousalGift", "communityPropertyAgreement"],
    fields: [
      {
        kind: "select",
        path: "documents.will.spousalGift",
        label: "Spousal Gift Structure",
        options: [
          { value: "outright", label: "Outright" },
          { value: "disclaimerTrust", label: "Disclaimer Trust" },
        ],
      },
      {
        kind: "checkbox",
        path: "documents.will.communityPropertyAgreement.exists",
        label: "Community Property Agreement on file",
      },
      {
        kind: "text",
        path: "documents.will.communityPropertyAgreement.date",
        label: "Agreement Date",
      },
    ],
  },
  {
    id: "ultimate-beneficiary",
    legend: "Ultimate Contingent Beneficiary (Article 3.6)",
    article: "3.6",
    guidance: "ultimateBeneficiary",
    fields: [
      {
        kind: "text",
        path: "documents.will.ultimateBeneficiary.relationship",
        label: "Relationship",
      },
      {
        kind: "text",
        path: "documents.will.ultimateBeneficiary.name",
        label: "Name",
      },
      {
        kind: "select",
        path: "documents.will.ultimateBeneficiary.gender",
        label: "Gender / Pronouns",
        options: GENDER_OPTIONS,
      },
    ],
  },
  {
    id: "survivorship",
    legend: "Survivorship Period (Article 7.6)",
    article: "7.6",
    guidance: "survivorship",
    fields: [
      {
        kind: "number",
        path: "documents.will.survivorshipDays",
        label: "Days",
        min: 0,
      },
    ],
  },
  {
    id: "fiduciaries",
    legend: "Fiduciaries (Article 6–7)",
    article: "6–7",
    guidance: ["personalRepresentatives", "trustees"],
    fields: [
      {
        kind: "text",
        path: "fiduciaries.personalRepresentatives.primary",
        label: "Primary Personal Representative",
      },
      {
        kind: "text",
        path: "fiduciaries.personalRepresentatives.alternate",
        label: "Alternate Personal Representative",
      },
      {
        kind: "text",
        path: "fiduciaries.trustees.primary",
        label: "Primary Trustee",
      },
      {
        kind: "text",
        path: "fiduciaries.trustees.alternate",
        label: "Alternate Trustee",
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
    legend: "Notary (Self-Proving Affidavit)",
    article: "Self-Proving Affidavit",
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
