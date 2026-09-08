import { Plan } from "./plan";

export const CURRENT_SCHEMA_VERSION = 3;

export type MigrateResult =
  { success: true; plan: Plan } | { success: false; error: string };

type Unknown = Record<string, unknown>;

function asObject(value: unknown): Unknown {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Unknown)
    : {};
}

// Maps a v2 (`js/config.js` BLANK_PROFILE-shaped) profile onto the v3 `Plan`
// grouping. Every one of the 24 leaf fields gets its own line — no `{ ...v2
// }` spread, which would carry a stray v2 key into v3 unchecked. A field
// absent from `raw` maps to `undefined`, which zod then backfills from the
// schema's `.default()` — the same deep-merge-over-defaults behavior
// `js/state.js`'s `normalizeProfile()` provided, reproduced through zod
// rather than reimplemented.
function mapV2ToV3(id: string, raw: unknown): unknown {
  const v2 = asObject(raw);
  const testator = asObject(v2.testator);
  const spouse = asObject(v2.spouse);
  const guardians = asObject(v2.guardians);
  const conservators = asObject(v2.conservators);
  const personalRepresentatives = asObject(v2.personalRepresentatives);
  const trustees = asObject(v2.trustees);
  const remains = asObject(v2.remains);
  const executionDate = asObject(v2.executionDate);
  const notary = asObject(v2.notary);
  const communityPropertyAgreement = asObject(v2.communityPropertyAgreement);
  const ultimateBeneficiary = asObject(v2.ultimateBeneficiary);

  return {
    id,
    label: v2.label,
    party: {
      testator: {
        name: testator.name,
        gender: testator.gender,
        county: testator.county,
        state: testator.state,
      },
      maritalStatus: v2.maritalStatus,
      spouse: {
        name: spouse.name,
        gender: spouse.gender,
      },
      children: v2.children,
    },
    fiduciaries: {
      guardians: {
        primary: guardians.primary,
        alternate: guardians.alternate,
      },
      conservators: {
        primary: conservators.primary,
        alternate: conservators.alternate,
      },
      personalRepresentatives: {
        primary: personalRepresentatives.primary,
        alternate: personalRepresentatives.alternate,
      },
      trustees: {
        primary: trustees.primary,
        alternate: trustees.alternate,
      },
      remains: {
        agent: remains.agent,
        alternate: remains.alternate,
        preference: remains.preference,
      },
    },
    execution: {
      city: v2.city,
      executionDate: {
        day: executionDate.day,
        month: executionDate.month,
        year: executionDate.year,
      },
      witnesses: v2.witnesses,
      notary: {
        name: notary.name,
        commissionExpires: notary.commissionExpires,
      },
    },
    documents: {
      will: {
        spousalGift: v2.spousalGift,
        communityPropertyAgreement: {
          exists: communityPropertyAgreement.exists,
          date: communityPropertyAgreement.date,
        },
        ultimateBeneficiary: {
          relationship: ultimateBeneficiary.relationship,
          name: ultimateBeneficiary.name,
          gender: ultimateBeneficiary.gender,
        },
        survivorshipDays: v2.survivorshipDays,
      },
    },
  };
}

// Migrates one stored/imported profile, keyed by `id`, from v2 or v3 shape
// to a validated v3 `Plan`. `id` is preserved verbatim as `Plan.id` — it is
// not migrated, so an imported profile keyed by an unrecognized (non-
// `profile-N`) id survives unchanged, matching `js/state.js`'s "unrecognized
// ids are accepted" behavior.
export function migrateProfile(id: string, raw: unknown): MigrateResult {
  const obj = asObject(raw);
  const isV3Shaped = obj.schemaVersion === CURRENT_SCHEMA_VERSION;

  const candidate = isV3Shaped ? { ...obj, id } : mapV2ToV3(id, raw);
  const result = Plan.safeParse(candidate);
  if (!result.success) {
    return {
      success: false,
      error: `Profile "${id}" has an invalid shape and cannot be imported.`,
    };
  }
  return { success: true, plan: result.data };
}
