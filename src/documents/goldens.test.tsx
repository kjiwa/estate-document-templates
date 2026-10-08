// Per-document goldens for the four non-will documents (the will's live in
// `will/Body.golden.test.tsx`). Each file holds the flattened
// [tag, class, text] sequence, one element per line. Update with
// `vitest -u` after an intentional change to a document's markup.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { h, type ComponentType } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { migrateProfile } from "../model/migrate";
import type { Plan } from "../model/plan";
import { flatten } from "./goldenFlatten";
import { DOCUMENTS } from "./registry";
import { HighlightContext, PlanContext } from "./shared/PlanContext";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN_DIR = path.resolve(__dirname, "../../test/golden");

const NON_WILL = DOCUMENTS.filter((doc) => doc.id !== "will");

function planFrom(raw: Record<string, unknown>): Plan {
  const result = migrateProfile("profile-1", { schemaVersion: 4, ...raw });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

const BLANK_PLAN = planFrom({
  label: "Blank",
  party: { testator: {}, spouse: {} },
  fiduciaries: {
    guardians: {},
    conservators: {},
    personalRepresentatives: {},
    trustees: {},
    remains: {},
  },
  executions: {},
  documents: {
    will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
  },
});

const SIGNING = {
  city: "Tacoma",
  executionDate: { day: "14", month: "March", year: "2026" },
  witnesses: [
    {
      name: "Jamie Lindqvist",
      address: "12 Elm Way",
      cityStateZip: "Tacoma, WA 98402",
    },
    {
      name: "Noor Haddad",
      address: "48 Oak Court",
      cityStateZip: "Tacoma, WA 98403",
    },
  ],
  notary: { name: "Pat Okonkwo", commissionExpires: "June 30, 2029" },
};

const FILLED_PLAN = planFrom({
  label: "Avery Q. Ramos",
  party: {
    testator: {
      name: "Avery Q. Ramos",
      gender: "male",
      county: "Pierce",
      state: "Washington",
    },
    maritalStatus: "married",
    spouse: { name: "Morgan T. Ramos", gender: "female" },
    children: ["Rowan A. Ramos", "Sage B. Ramos"],
  },
  fiduciaries: {
    guardians: { primary: "Casey Delacroix", alternate: "Priya Nandakumar" },
    conservators: { primary: "Casey Delacroix", alternate: "Priya Nandakumar" },
    personalRepresentatives: {
      primary: "Morgan T. Ramos",
      alternate: "Devin Okafor",
    },
    trustees: { primary: "Casey Delacroix", alternate: "Priya Nandakumar" },
    attorneysInFact: { primary: "Morgan T. Ramos", alternate: "Devin Okafor" },
    remains: {
      agent: "Morgan T. Ramos",
      alternate: "Devin Okafor",
      preference: "cremation",
    },
  },
  executions: {
    will: SIGNING,
    remainsDirective: SIGNING,
    healthCareDirective: SIGNING,
    durablePowerOfAttorney: SIGNING,
    generalPowerOfAttorney: SIGNING,
  },
  documents: {
    will: { communityPropertyAgreement: {}, ultimateBeneficiary: {} },
    healthCareDirective: {
      placeOfDeath: "home",
      artificialNutrition: "doNot",
      artificialHydration: "do",
      cpr: "doNot",
    },
    remainsDirective: {
      arrangementsMade: "yes",
      arrangementsWith: "Harbor Memorial Chapel",
      method: "cremation",
      cremainsDisposition: "scatter",
      cremainsDetail: "Puget Sound, off Point Defiance",
      arranger: {
        name: "Morgan T. Ramos",
        address: "9 Cedar Lane, Tacoma, WA 98402",
        telephone: "253-555-0100",
      },
      notify: [
        {
          name: "Rowan A. Ramos",
          address: "22 Birch Street, Seattle, WA 98101",
          telephone: "206-555-0101",
        },
      ],
    },
    durablePowerOfAttorney: { minorChildren: true, lastGoodbyes: true },
  },
});

function renderFlat(Body: ComponentType, plan: Plan): string {
  const html = render(
    h(
      PlanContext.Provider,
      { value: plan },
      h(HighlightContext.Provider, { value: true }, h(Body, {}))
    )
  );
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  return (
    flatten(document.body)
      .map(([tag, cls, text]) => `${tag}\t${cls}\t${text}`)
      .join("\n") + "\n"
  );
}

describe("non-will document goldens", () => {
  for (const doc of NON_WILL) {
    for (const [name, plan] of [
      ["blank", BLANK_PLAN],
      ["filled", FILLED_PLAN],
    ] as const) {
      it(`${doc.id} ${name} matches its golden`, async () => {
        await expect(renderFlat(doc.Body, plan)).toMatchFileSnapshot(
          path.join(GOLDEN_DIR, doc.id, `${name}.html`)
        );
      });
    }
  }
});
