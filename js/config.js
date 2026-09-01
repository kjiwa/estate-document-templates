export const SCHEMA_VERSION = 2;

export const PROFILES = {
  profile-1: {
    id: "profile-1",
    label: "Avery Q. Ramos (Husband)",
    testator: {
      name: "Avery Q. Ramos",
      gender: "male",
      county: "King",
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
    city: "Seattle",
    executionDate: {
      day: "",
      month: "",
      year: "",
    },
  },
  profile-2: {
    id: "profile-2",
    label: "Morgan T. Ramos (Wife)",
    testator: {
      name: "Morgan T. Ramos",
      gender: "female",
      county: "King",
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
    city: "Seattle",
    executionDate: {
      day: "",
      month: "",
      year: "",
    },
  },
};

export const DEFAULT_PROFILE_ID = "profile-1";
