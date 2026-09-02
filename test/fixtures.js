// @ts-check
// Fabricated reciprocal profiles used by the specs, keyed to the shipped
// profile ids so tests exercise the same seams the app ships. Casey
// Delacroix holds four roles in profile-2 (primary guardian, primary
// conservator, primary trustee, ultimate contingent beneficiary) so the
// "one person holds four roles" advisory test still has something to
// assert on.
const PROFILE_1 = {
  id: "profile-1",
  label: "Avery Q. Ramos",
  testator: {
    name: "Avery Q. Ramos",
    gender: "male",
    county: "Pierce",
    state: "Washington",
  },
  spouse: {
    name: "Morgan T. Ramos",
    gender: "female",
  },
  children: ["Rowan A. Ramos", "Sage B. Ramos"],
  guardians: {
    primary: "Casey Delacroix",
    alternate: "Priya Nandakumar",
  },
  conservators: {
    primary: "Casey Delacroix",
    alternate: "Priya Nandakumar",
  },
  personalRepresentatives: {
    primary: "Morgan T. Ramos",
    alternate: "Devin Okafor",
  },
  trustees: {
    primary: "Casey Delacroix",
    alternate: "Priya Nandakumar",
  },
  ultimateBeneficiary: {
    relationship: "sister",
    name: "Robin Ramos",
    gender: "female",
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
  city: "Tacoma",
  executionDate: {
    day: "",
    month: "",
    year: "",
  },
};

const PROFILE_2 = {
  id: "profile-2",
  label: "Morgan T. Ramos",
  testator: {
    name: "Morgan T. Ramos",
    gender: "female",
    county: "Pierce",
    state: "Washington",
  },
  spouse: {
    name: "Avery Q. Ramos",
    gender: "male",
  },
  children: ["Rowan A. Ramos", "Sage B. Ramos"],
  guardians: {
    primary: "Casey Delacroix",
    alternate: "Priya Nandakumar",
  },
  conservators: {
    primary: "Casey Delacroix",
    alternate: "Priya Nandakumar",
  },
  personalRepresentatives: {
    primary: "Avery Q. Ramos",
    alternate: "Devin Okafor",
  },
  trustees: {
    primary: "Casey Delacroix",
    alternate: "Priya Nandakumar",
  },
  ultimateBeneficiary: {
    relationship: "sister",
    name: "Casey Delacroix",
    gender: "female",
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
  city: "Tacoma",
  executionDate: {
    day: "",
    month: "",
    year: "",
  },
};

const FIXTURE_PROFILES = {
  "profile-1": PROFILE_1,
  "profile-2": PROFILE_2,
};

// Writes estate_templates_state_v1 to localStorage only when the key is
// absent. The init script re-runs on every navigation, so an unconditional
// write would clobber state that "persists across reloads" and "seeds a
// v1-shaped value" tests depend on, while the absent-key case still
// re-seeds after localStorage.clear(); reload().
async function seedProfiles(page) {
  await page.addInitScript((profiles) => {
    const KEY = "estate_templates_state_v1";
    if (window.localStorage.getItem(KEY)) return;
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        schemaVersion: 2,
        activeProfileId: "profile-1",
        profiles,
        highlightVariables: true,
        zoom: "100",
      })
    );
  }, FIXTURE_PROFILES);
}

module.exports = { PROFILE_1, PROFILE_2, FIXTURE_PROFILES, seedProfiles };
