import type { Section, Option } from "../../form/field-spec";

// Election fields are tri-state selects — "" (unset) prints as ruled blanks
// on both sides of the boxed table, matching the app's blank-form behavior
// everywhere else.
const ELECTION_OPTIONS: readonly Option[] = [
  { value: "", label: "Not yet decided" },
  { value: "do", label: "DO" },
  { value: "doNot", label: "DO NOT" },
];

const PLACE_OF_DEATH_OPTIONS: readonly Option[] = [
  { value: "", label: "No preference stated" },
  { value: "home", label: "At home, if reasonable" },
  {
    value: "hospital",
    label: "In the hospital, if that eases funeral arrangements",
  },
];

export const HEALTH_CARE_SECTIONS: Section[] = [
  {
    id: "declarer",
    legend: "Declarer & Domicile",
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
    id: "directions",
    legend: "Health Care Directions (Paragraph A)",
    article: "A",
    guidance: "directions",
    fields: [
      {
        kind: "select",
        path: "documents.healthCareDirective.placeOfDeath",
        label: "Place of Death Preference",
        options: PLACE_OF_DEATH_OPTIONS,
      },
    ],
  },
  {
    id: "elections",
    legend: "Elections (Paragraph C)",
    article: "C",
    guidance: "elections",
    fields: [
      {
        kind: "select",
        path: "documents.healthCareDirective.artificialNutrition",
        label: "Artificial Nutrition",
        options: ELECTION_OPTIONS,
      },
      {
        kind: "select",
        path: "documents.healthCareDirective.artificialHydration",
        label: "Artificial Hydration",
        options: ELECTION_OPTIONS,
      },
      {
        kind: "select",
        path: "documents.healthCareDirective.cpr",
        label: "CPR",
        options: ELECTION_OPTIONS,
      },
    ],
  },
  {
    id: "witnesses",
    legend: "Witnesses (Declaration)",
    article: "Witness Declaration",
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
