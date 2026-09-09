import { z } from "zod";

const Gender = z.string().default("");

const Person = z.object({
  name: z.string().default(""),
  gender: Gender,
});

const RoleHolders = z.object({
  primary: z.string().default(""),
  alternate: z.string().default(""),
});

const Witness = z.object({
  name: z.string().default(""),
  address: z.string().default(""),
  cityStateZip: z.string().default(""),
});

const Testator = z.object({
  name: z.string().default(""),
  gender: Gender,
  county: z.string().default(""),
  state: z.string().default("Washington"),
});

const Party = z.object({
  testator: Testator,
  maritalStatus: z.string().default("married"),
  spouse: Person,
  children: z.array(z.string()).default([]),
});

const Remains = z.object({
  agent: z.string().default(""),
  alternate: z.string().default(""),
  preference: z.string().default(""),
});

const Fiduciaries = z.object({
  guardians: RoleHolders,
  conservators: RoleHolders,
  personalRepresentatives: RoleHolders,
  trustees: RoleHolders,
  remains: Remains,
});

const ExecutionDate = z.object({
  day: z.string().default(""),
  month: z.string().default(""),
  year: z.string().default(""),
});

const Notary = z.object({
  name: z.string().default(""),
  commissionExpires: z.string().default(""),
});

const Execution = z.object({
  city: z.string().default(""),
  executionDate: ExecutionDate,
  witnesses: z.array(Witness).default([
    { name: "", address: "", cityStateZip: "" },
    { name: "", address: "", cityStateZip: "" },
  ]),
  notary: Notary,
});

const CommunityPropertyAgreement = z.object({
  exists: z.boolean().default(false),
  date: z.string().default(""),
});

const UltimateBeneficiary = z.object({
  relationship: z.string().default(""),
  name: z.string().default(""),
  gender: Gender,
});

const WillDocument = z.object({
  spousalGift: z.string().default("outright"),
  communityPropertyAgreement: CommunityPropertyAgreement,
  ultimateBeneficiary: UltimateBeneficiary,
  survivorshipDays: z.number().default(60),
});

// Election/select values are "" (unset) / "do" / "doNot", and for
// `placeOfDeath` "" / "home" / "hospital". `.default({})` — not a per-leaf
// v2 mapping in `migrate.ts` — is what lets both directions of invariant 8
// hold: a v2 profile never had this key, and a v3 export written by a
// version predating this namespace has no `healthCareDirective` key either;
// both parse with every leaf defaulted.
const HealthCareDirectiveDocument = z
  .object({
    placeOfDeath: z.string().default(""),
    artificialNutrition: z.string().default(""),
    artificialHydration: z.string().default(""),
    cpr: z.string().default(""),
  })
  // A literal default, not `.default({})` — zod substitutes this value
  // verbatim for a missing key without re-parsing it through the inner
  // schema, so `.default({})` would leave every leaf `undefined` instead of
  // defaulting to `""`.
  .default({
    placeOfDeath: "",
    artificialNutrition: "",
    artificialHydration: "",
    cpr: "",
  });

const Documents = z.object({
  will: WillDocument,
  healthCareDirective: HealthCareDirectiveDocument,
});

export const Plan = z.object({
  id: z.string(),
  label: z.string(),
  party: Party,
  fiduciaries: Fiduciaries,
  execution: Execution,
  documents: Documents,
});

export type Plan = z.infer<typeof Plan>;
