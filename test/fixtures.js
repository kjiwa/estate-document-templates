// @ts-check
// Fabricated reciprocal plans used by the specs, keyed to the shipped plan
// ids so tests exercise the same seams the app ships. Casey Delacroix holds
// four roles in plan-2 (primary guardian, primary conservator, primary
// trustee, ultimate contingent beneficiary) so a future "one person holds
// four roles" advisory test still has something to assert on.
//
// Written in the v3 persisted shape (`plans` / `activePlanId`) that
// `persist()` writes and `parsePersisted()` reads — see src/store/index.ts.
const PLAN_1 = {
  id: "profile-1",
  label: "Avery Q. Ramos",
  party: {
    testator: {
      name: "Avery Q. Ramos",
      gender: "male",
      county: "Pierce",
      state: "Washington",
    },
    maritalStatus: "married",
    spouse: {
      name: "Morgan T. Ramos",
      gender: "female",
    },
    children: ["Rowan A. Ramos", "Sage B. Ramos"],
  },
  fiduciaries: {
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
    remains: {
      agent: "",
      alternate: "",
      preference: "",
    },
  },
  execution: {
    city: "Tacoma",
    executionDate: {
      day: "",
      month: "",
      year: "",
    },
    witnesses: [
      { name: "", address: "", cityStateZip: "" },
      { name: "", address: "", cityStateZip: "" },
    ],
    notary: {
      name: "",
      commissionExpires: "",
    },
  },
  documents: {
    will: {
      spousalGift: "outright",
      communityPropertyAgreement: {
        exists: false,
        date: "",
      },
      ultimateBeneficiary: {
        relationship: "sister",
        name: "Robin Ramos",
        gender: "female",
      },
      survivorshipDays: 60,
    },
  },
};

const PLAN_2 = {
  id: "profile-2",
  label: "Morgan T. Ramos",
  party: {
    testator: {
      name: "Morgan T. Ramos",
      gender: "female",
      county: "Pierce",
      state: "Washington",
    },
    maritalStatus: "married",
    spouse: {
      name: "Avery Q. Ramos",
      gender: "male",
    },
    children: ["Rowan A. Ramos", "Sage B. Ramos"],
  },
  fiduciaries: {
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
    remains: {
      agent: "",
      alternate: "",
      preference: "",
    },
  },
  execution: {
    city: "Tacoma",
    executionDate: {
      day: "",
      month: "",
      year: "",
    },
    witnesses: [
      { name: "", address: "", cityStateZip: "" },
      { name: "", address: "", cityStateZip: "" },
    ],
    notary: {
      name: "",
      commissionExpires: "",
    },
  },
  documents: {
    will: {
      spousalGift: "outright",
      communityPropertyAgreement: {
        exists: false,
        date: "",
      },
      ultimateBeneficiary: {
        relationship: "sister",
        name: "Casey Delacroix",
        gender: "female",
      },
      survivorshipDays: 60,
    },
  },
};

const FIXTURE_PLANS = {
  "profile-1": PLAN_1,
  "profile-2": PLAN_2,
};

// Writes estate_templates_state_v1 to localStorage only when the key is
// absent. The init script re-runs on every navigation, so an unconditional
// write would clobber state that "persists across reloads" tests depend on,
// while the absent-key case still re-seeds after localStorage.clear();
// reload().
async function seedPlans(page) {
  await page.addInitScript((plans) => {
    const KEY = "estate_templates_state_v1";
    if (window.localStorage.getItem(KEY)) return;
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        schemaVersion: 3,
        activePlanId: "profile-1",
        activeDocumentId: "will",
        plans,
      })
    );
  }, FIXTURE_PLANS);
}

module.exports = { PLAN_1, PLAN_2, FIXTURE_PLANS, seedPlans };
