export const SCHEMA_VERSION = 2;

// Non-empty defaults here are template behaviour, not personal data:
// survivorshipDays/spousalGift/state reflect the drafting defaults this app
// ships, and the two witnesses exist because js/app.js binds witnesses.0.*
// and witnesses.1.* by fixed index. Two profiles, not one, because the
// reciprocal-spousal-pair workflow is a shipped feature and there is no
// profile-create UI.
export const BLANK_PROFILE = {
  testator: {
    name: "",
    gender: "",
    county: "",
    state: "Washington",
  },
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

export const DEFAULT_PROFILE_ID = "profile-1";

function blankProfile(id, label) {
  return { id, label, ...JSON.parse(JSON.stringify(BLANK_PROFILE)) };
}

export const INITIAL_PROFILES = {
  "profile-1": blankProfile("profile-1", "Profile 1"),
  "profile-2": blankProfile("profile-2", "Profile 2"),
};
