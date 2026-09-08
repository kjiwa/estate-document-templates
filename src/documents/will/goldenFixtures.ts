// Reproduced verbatim from `scripts/capture-goldens.mjs`'s `BASE_OVERLAY`
// and `CASES`, so the golden gate and the attorney-memo golden test pin the
// exact same 23 v2 profiles the goldens were captured from. Not itself a
// test file — imported by `Body.golden.test.tsx` and
// `../../export/attorneyMemo.golden.test.ts`.
//
// BLANK_PROFILE below is inlined from the retired js/config.js (Phase 0's
// v2 shape) rather than imported, now that js/ no longer exists.
const BLANK_PROFILE = {
  testator: {
    name: "",
    gender: "",
    county: "",
    state: "Washington",
  },
  maritalStatus: "married",
  spouse: {
    name: "",
    gender: "",
  },
  children: [],
  guardians: {
    primary: "",
    alternate: "",
  },
  conservators: {
    primary: "",
    alternate: "",
  },
  personalRepresentatives: {
    primary: "",
    alternate: "",
  },
  trustees: {
    primary: "",
    alternate: "",
  },
  ultimateBeneficiary: {
    relationship: "",
    name: "",
    gender: "",
  },
  survivorshipDays: 60,
  spousalGift: "outright",
  communityPropertyAgreement: {
    exists: false,
    date: "",
  },
  remains: {
    agent: "",
    alternate: "",
    preference: "",
  },
  witnesses: [
    { name: "", address: "", cityStateZip: "" },
    { name: "", address: "", cityStateZip: "" },
  ],
  notary: {
    name: "",
    commissionExpires: "",
  },
  city: "",
  executionDate: {
    day: "",
    month: "",
    year: "",
  },
};

export const BASE_OVERLAY = {
  testator: {
    name: "Jordan A. Whitfield",
    gender: "male",
    county: "King",
    state: "Washington",
  },
  maritalStatus: "married",
  spouse: { name: "Taylor B. Whitfield", gender: "female" },
  children: ["Rowan C. Whitfield", "Sage D. Whitfield"],
  guardians: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
  conservators: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
  personalRepresentatives: {
    primary: "Taylor B. Whitfield",
    alternate: "Devin G. Osei",
  },
  trustees: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
  ultimateBeneficiary: {
    relationship: "sister",
    name: "Robin H. Whitfield",
    gender: "female",
  },
  survivorshipDays: 60,
  spousalGift: "outright",
  communityPropertyAgreement: { exists: false, date: "" },
  remains: { agent: "", alternate: "", preference: "" },
  witnesses: [
    {
      name: "Alex I. Kowalski",
      address: "100 Main St",
      cityStateZip: "Tacoma, WA 98402",
    },
    {
      name: "Morgan J. Petrova",
      address: "200 Oak St",
      cityStateZip: "Tacoma, WA 98402",
    },
  ],
  notary: { name: "Jamie K. Okonkwo", commissionExpires: "2028-01-01" },
  city: "Tacoma",
  executionDate: { day: "15", month: "March", year: "2026" },
};

export interface GoldenCase {
  slug: string;
  highlights?: boolean;
  overlay: Record<string, unknown>;
}

export const GOLDEN_CASES: GoldenCase[] = [
  { slug: "01-blank-highlights-on", highlights: true, overlay: {} },
  { slug: "02-blank-highlights-off", highlights: false, overlay: {} },
  { slug: "03-baseline", overlay: BASE_OVERLAY },
  {
    slug: "04-cpa-on",
    overlay: {
      ...BASE_OVERLAY,
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
    },
  },
  {
    slug: "05-disclaimer-trust",
    overlay: { ...BASE_OVERLAY, spousalGift: "disclaimerTrust" },
  },
  {
    slug: "06-disclaimer-trust-cpa",
    overlay: {
      ...BASE_OVERLAY,
      spousalGift: "disclaimerTrust",
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
    },
  },
  {
    slug: "07-unmarried-2-children",
    overlay: { ...BASE_OVERLAY, maritalStatus: "unmarried" },
  },
  {
    slug: "08-unmarried-0-children",
    overlay: { ...BASE_OVERLAY, maritalStatus: "unmarried", children: [] },
  },
  {
    slug: "09-married-0-children",
    overlay: { ...BASE_OVERLAY, children: [] },
  },
  {
    slug: "10-one-child",
    overlay: { ...BASE_OVERLAY, children: ["Rowan C. Whitfield"] },
  },
  {
    slug: "11-three-children",
    overlay: {
      ...BASE_OVERLAY,
      children: ["Rowan C. Whitfield", "Sage D. Whitfield", "Wren E. Ito"],
    },
  },
  { slug: "12-pr-is-spouse", overlay: BASE_OVERLAY },
  {
    slug: "13-pr-not-spouse",
    overlay: {
      ...BASE_OVERLAY,
      personalRepresentatives: {
        primary: "Elliot L. Marsh",
        alternate: "Devin G. Osei",
      },
    },
  },
  {
    slug: "14-unmarried-stale-spouse",
    overlay: {
      ...BASE_OVERLAY,
      maritalStatus: "unmarried",
      personalRepresentatives: {
        primary: "Taylor B. Whitfield",
        alternate: "Devin G. Osei",
      },
    },
  },
  {
    slug: "15-remains-preference",
    overlay: {
      ...BASE_OVERLAY,
      remains: {
        agent: "Casey E. Nolan",
        alternate: "Priya F. Iyer",
        preference: "cremation, with ashes scattered at sea",
      },
    },
  },
  {
    slug: "16a-gender-male",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "male" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "male" },
      ultimateBeneficiary: {
        ...BASE_OVERLAY.ultimateBeneficiary,
        gender: "male",
      },
    },
  },
  {
    slug: "16b-gender-female",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "female" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "female" },
      ultimateBeneficiary: {
        ...BASE_OVERLAY.ultimateBeneficiary,
        gender: "female",
      },
    },
  },
  {
    slug: "16c-gender-nonbinary",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "nonbinary" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "nonbinary" },
      ultimateBeneficiary: {
        ...BASE_OVERLAY.ultimateBeneficiary,
        gender: "nonbinary",
      },
    },
  },
  {
    slug: "16d-gender-unset",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "" },
      ultimateBeneficiary: { ...BASE_OVERLAY.ultimateBeneficiary, gender: "" },
    },
  },
  {
    slug: "17-survivorship-5",
    overlay: { ...BASE_OVERLAY, survivorshipDays: 5 },
  },
  {
    slug: "18-escaping",
    overlay: {
      ...BASE_OVERLAY,
      testator: {
        ...BASE_OVERLAY.testator,
        name: `<script>alert(1)</script> & "quoted" 'quoted'`,
      },
    },
  },
  {
    slug: "19-unmarried-cpa-flag",
    overlay: {
      ...BASE_OVERLAY,
      maritalStatus: "unmarried",
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
    },
  },
  {
    slug: "20-blank-county-state",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, county: "", state: "" },
    },
  },
];

// Mirrors `scripts/capture-goldens.mjs`'s local mutating `deepMerge`
// (replace-wholesale for arrays), used only to build these v2 fixtures.
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (Array.isArray(value)) {
      target[key] = value;
    } else if (value && typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object") target[key] = {};
      deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      target[key] = value;
    }
  }
  return target;
}

// Mirrors `scripts/capture-goldens.mjs`'s `buildProfile`, which always
// carries `label` alongside the merged overlay — `Plan.label` has no
// schema default, so a v2 payload missing it fails `Plan.parse`.
export function buildV2Profile(
  slug: string,
  overlay: Record<string, unknown>
): Record<string, unknown> {
  const profile: Record<string, unknown> = {
    label: slug,
    ...structuredClone(BLANK_PROFILE),
  };
  deepMerge(profile, overlay);
  return profile;
}
