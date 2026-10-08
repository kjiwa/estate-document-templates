import { computed, effect, signal } from "@preact/signals";

import { DOCUMENTS } from "../documents/registry";
import { migrateProfile, CURRENT_SCHEMA_VERSION } from "../model/migrate";
import type { Plan } from "../model/plan";
import { setPath, type Path } from "../model/paths";
import { reciprocalPlan } from "../model/reciprocal";
import { readStorage, writeStorage } from "../ui/storage";

// `documents/shared/{Blank,Value}.tsx` import `ui/advisories.ts`, which
// already imported `DOCUMENTS` from `../documents/registry` before this
// module did — so `registry.ts` -> a document `Body` -> `shared/Blank.tsx`
// -> `ui/advisories.ts` -> `store/index.ts` -> `documents/registry.ts` is
// circular. Reading `DOCUMENTS` inside a function body called after the
// whole module graph has finished loading (every use below) is fine; this
// module's own top-level code cannot, since `registry.ts` may still be
// mid-evaluation further up the same import chain — so the initial
// `activeDocumentId` value below is the literal id of what has always been
// the first (and, until Phase 5, only) document, not `DOCUMENTS[0]`.
const STORAGE_KEY = "estate_templates_state_v1";
const STORAGE_KEY_UNPARSED = `${STORAGE_KEY}__unparsed`;
const SAVE_FAILED_NOTICE =
  "Changes aren't being saved in this browser. Save your plans to a file.";
const UNREADABLE_NOTICE =
  "Some saved plans couldn't be read. A copy of the stored data was kept in this browser.";
const PERSIST_DEBOUNCE_MS = 250;

function blankPlan(id: string, label: string): Plan {
  const result = migrateProfile(id, { label });
  if (!result.success) {
    throw new Error(`Failed to build blank plan: ${result.error}`);
  }
  return result.plan;
}

export const plans = signal<Record<string, Plan>>({
  "profile-1": blankPlan("profile-1", "My plan"),
});

const saveFailed = signal(false);
const unreadable = signal(false);

export const storageNotice = computed<string | null>(() => {
  if (saveFailed.value) return SAVE_FAILED_NOTICE;
  if (unreadable.value) return UNREADABLE_NOTICE;
  return null;
});

export const activePlanId = signal<string>("profile-1");
export const activeDocumentId = signal<string>("will");

export const activePlan = computed<Plan | undefined>(
  () => plans.value[activePlanId.value]
);

export function setField(path: Path<Plan>, value: unknown): void {
  const id = activePlanId.value;
  const plan = plans.value[id];
  if (!plan) return;

  plans.value = {
    ...plans.value,
    [id]: setPath(plan, path, value),
  };
}

// `plan-<n>`, skipping ids already present — the first-run plan is
// `profile-1`, not `plan-*`, so this never collides with it.
export function nextPlanId(): string {
  const existing = new Set(Object.keys(plans.value));
  let n = 1;
  while (existing.has(`plan-${n}`)) n++;
  return `plan-${n}`;
}

export function setActivePlan(id: string): void {
  if (!plans.value[id]) return;
  activePlanId.value = id;
}

export function setActiveDocument(id: string): void {
  if (!DOCUMENTS.some((doc) => doc.id === id)) return;
  activeDocumentId.value = id;
}

export function createPlan(label = "New plan"): string {
  const id = nextPlanId();
  plans.value = { ...plans.value, [id]: blankPlan(id, label) };
  activePlanId.value = id;
  return id;
}

export function renamePlan(id: string, label: string): void {
  const plan = plans.value[id];
  if (!plan) return;
  plans.value = { ...plans.value, [id]: { ...plan, label } };
}

export function duplicatePlan(id: string): string | undefined {
  const plan = plans.value[id];
  if (!plan) return undefined;
  const newId = nextPlanId();
  plans.value = {
    ...plans.value,
    [newId]: { ...plan, id: newId, label: `${plan.label} (copy)` },
  };
  activePlanId.value = newId;
  return newId;
}

// Refuses when only one plan remains — there is always an active plan.
// Reassigns `activePlanId` to some other remaining plan when the deleted
// plan was the active one.
export function deletePlan(id: string): void {
  const ids = Object.keys(plans.value);
  if (ids.length <= 1 || !plans.value[id]) return;

  const rest = { ...plans.value };
  delete rest[id];
  plans.value = rest;

  if (activePlanId.value === id) {
    activePlanId.value = Object.keys(rest)[0]!;
  }
}

export function createReciprocalPlan(id: string): string | undefined {
  const plan = plans.value[id];
  if (!plan) return undefined;
  const newId = nextPlanId();
  const label = plan.party.spouse.name || `${plan.label} (reciprocal)`;
  plans.value = {
    ...plans.value,
    [newId]: reciprocalPlan(plan, newId, label),
  };
  activePlanId.value = newId;
  return newId;
}

interface PersistedState {
  schemaVersion: number;
  activePlanId: string;
  activeDocumentId: string;
  plans: Record<string, Plan>;
}

interface ParsedPersisted {
  skipped: number;
  plans: Record<string, Plan>;
  activePlanId: string;
  activeDocumentId: string;
}

/**
 * Accepts the current persisted shape (`plans` / `activePlanId`, written by
 * `persist()`), the v2 localStorage shape (`profiles` / `activeProfileId`),
 * and the pre-rewrite `js/state.js` `exportStateAsJson()` shape — a bare
 * `{ [profileId]: Profile }` map with no envelope at all, per
 * `js/state.js:260` in the pre-Phase-3 history (`git show 71b715a:js/state.js`).
 * That was the only "Export JSON" format that ever shipped, so a real
 * previously-exported file is this shape, not the internal `profiles`
 * envelope — invariant 8 (an export written by the previous version still
 * imports) requires this branch, not just the internal shapes.
 *
 * Every branch below still runs each stored entry through `migrateProfile`,
 * which validates shape per-id — a non-profile bare object (or any other
 * malformed input) fails every id and falls through to the `null` return
 * two lines above the end of this function, so this fallback cannot turn
 * arbitrary JSON into a false positive.
 */
export function parsePersisted(raw: unknown): ParsedPersisted | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // A `schemaVersion` newer than this build understands means the shape
  // below may have changed in ways `migrateProfile` can't detect (a
  // renamed/added required field, say) — refusing it here, rather than
  // blindly tagging it as `CURRENT_SCHEMA_VERSION` and merging it, is what
  // keeps a downgrade-then-reload from silently corrupting newer data.
  if (
    typeof obj.schemaVersion === "number" &&
    obj.schemaVersion > CURRENT_SCHEMA_VERSION
  ) {
    return null;
  }

  const isEnvelope = Boolean(obj.plans && typeof obj.plans === "object");
  const envelopeVersion =
    typeof obj.schemaVersion === "number" ? Math.max(obj.schemaVersion, 3) : 3;
  const rawProfiles = isEnvelope
    ? (obj.plans as Record<string, unknown>)
    : obj.profiles && typeof obj.profiles === "object"
      ? (obj.profiles as Record<string, unknown>)
      : obj;
  if (!rawProfiles) return null;

  const rawActiveId = obj.activePlanId ?? obj.activeProfileId;

  const storedIds = Object.keys(rawProfiles);
  if (storedIds.length === 0) return null;

  const migratedPlans: Record<string, Plan> = {};
  let skipped = 0;
  for (const id of storedIds) {
    const rawPlan = rawProfiles[id];
    // A persisted `Plan` carries no `schemaVersion` of its own; only the
    // envelope around `plans` does, and `migrateProfile` reads it off the
    // plan. An envelope written before versioning is v3-shaped.
    const taggedPlan =
      isEnvelope && rawPlan && typeof rawPlan === "object"
        ? { ...rawPlan, schemaVersion: envelopeVersion }
        : rawPlan;
    const result = migrateProfile(id, taggedPlan);
    if (result.success) migratedPlans[id] = result.plan;
    else skipped += 1;
  }
  if (Object.keys(migratedPlans).length === 0) return null;

  // `activeDocumentId` was written by `persist()` since 4d but never read
  // back here, so a chosen non-default document did not survive a reload —
  // restored here the same defensive way as `activePlanId`: fall back to
  // the first registered document when the stored id no longer resolves
  // (an older export, or a fork with a different document set).
  const rawDocumentId = obj.activeDocumentId;

  return {
    skipped,
    plans: migratedPlans,
    activePlanId:
      typeof rawActiveId === "string" && rawActiveId in migratedPlans
        ? rawActiveId
        : Object.keys(migratedPlans)[0]!,
    activeDocumentId:
      typeof rawDocumentId === "string" &&
      DOCUMENTS.some((doc) => doc.id === rawDocumentId)
        ? rawDocumentId
        : (DOCUMENTS[0]?.id ?? "will"),
  };
}

// Written to when `loadFromStorage()` can't make sense of all or part of
// `STORAGE_KEY`, so the unreadable value survives instead of being silently
// dropped by the next autosave.
function backupUnparsed(raw: string): void {
  if (readStorage(STORAGE_KEY_UNPARSED) === null) {
    writeStorage(STORAGE_KEY_UNPARSED, raw);
  }
  unreadable.value = true;
}

function applyParsed(parsed: ParsedPersisted): void {
  plans.value = parsed.plans;
  activePlanId.value = parsed.activePlanId;
  activeDocumentId.value = parsed.activeDocumentId;
}

export function loadFromStorage(): boolean {
  const raw = readStorage(STORAGE_KEY);
  try {
    if (!raw) return false;
    const parsed = parsePersisted(JSON.parse(raw));
    if (!parsed) {
      backupUnparsed(raw);
      return false;
    }
    if (parsed.skipped > 0) backupUnparsed(raw);

    applyParsed(parsed);
    return true;
  } catch {
    if (raw) backupUnparsed(raw);
    return false;
  } finally {
    // Gates the autosave effect below: it must not schedule a write with the
    // module's initial blank-plan signals before this function has decided
    // whether real stored state exists, or a failed load's blank fallback
    // would win the race and overwrite that stored state.
    loadAttempted.value = true;
  }
}

function persist(): void {
  const data: PersistedState = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activePlanId: activePlanId.value,
    activeDocumentId: activeDocumentId.value,
    plans: plans.value,
  };
  saveFailed.value = !writeStorage(STORAGE_KEY, JSON.stringify(data));
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
const loadAttempted = signal(false);

effect(() => {
  // Read every signal this effect depends on before scheduling, so preact
  // signals' dependency tracking sees them even though the actual write is
  // deferred past the debounce.
  void plans.value;
  void activePlanId.value;
  void activeDocumentId.value;

  // This effect runs once at module load, with the blank-plan signal
  // defaults, before `main.tsx` calls `loadFromStorage()`. Scheduling a
  // write here unconditionally would race a failed load: the timer below
  // would still fire and overwrite real stored state with those blanks.
  // Waiting for `loadFromStorage()` to finish (success or failure) closes
  // that window.
  if (!loadAttempted.value) return;

  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = undefined;
    persist();
  }, PERSIST_DEBOUNCE_MS);
});

function flushPersist(): void {
  if (!persistTimer) return;
  clearTimeout(persistTimer);
  persistTimer = undefined;
  persist();
}

export function installStorageSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (persistTimer) return;
    if (event.key === null || event.key === STORAGE_KEY) loadFromStorage();
  };

  window.addEventListener("pagehide", flushPersist);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("pagehide", flushPersist);
    window.removeEventListener("storage", handleStorage);
  };
}
