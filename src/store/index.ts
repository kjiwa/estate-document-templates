import { computed, effect, signal } from "@preact/signals";

import { migrateProfile, CURRENT_SCHEMA_VERSION } from "../model/migrate";
import type { Plan } from "../model/plan";
import { getPath, setPath, type Path } from "../model/paths";

const STORAGE_KEY = "estate_templates_state_v1";
const UNDO_LIMIT = 50;
const UNDO_COALESCE_MS = 500;
const PERSIST_DEBOUNCE_MS = 250;

interface UndoEntry {
  path: string;
  previousValue: unknown;
  planId: string;
  timestamp: number;
}

function blankPlan(id: string, label: string): Plan {
  const result = migrateProfile(id, { label });
  if (!result.success) {
    throw new Error(`Failed to build blank plan: ${result.error}`);
  }
  return result.plan;
}

export const plans = signal<Record<string, Plan>>({
  "profile-1": blankPlan("profile-1", "Profile 1"),
  "profile-2": blankPlan("profile-2", "Profile 2"),
});

export const activePlanId = signal<string>("profile-1");
export const activeDocumentId = signal<string>("will");

export const activePlan = computed<Plan | undefined>(
  () => plans.value[activePlanId.value]
);

const undoStack: UndoEntry[] = [];

export function setField(path: Path<Plan>, value: unknown): void {
  const id = activePlanId.value;
  const plan = plans.value[id];
  if (!plan) return;

  const previousValue = getPath(plan, path);
  const last = undoStack[undoStack.length - 1];
  const now = Date.now();
  const canCoalesce =
    last &&
    last.path === path &&
    last.planId === id &&
    now - last.timestamp < UNDO_COALESCE_MS;

  if (!canCoalesce) {
    undoStack.push({ path, previousValue, planId: id, timestamp: now });
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  } else if (last) {
    last.timestamp = now;
  }

  plans.value = {
    ...plans.value,
    [id]: setPath(plan, path, value),
  };
}

export function undo(): void {
  const entry = undoStack.pop();
  if (!entry) return;
  const plan = plans.value[entry.planId];
  if (!plan) return;
  plans.value = {
    ...plans.value,
    [entry.planId]: setPath(plan, entry.path, entry.previousValue),
  };
}

interface PersistedState {
  schemaVersion: number;
  activePlanId: string;
  activeDocumentId: string;
  plans: Record<string, Plan>;
}

interface ParsedPersisted {
  plans: Record<string, Plan>;
  activePlanId: string;
}

/**
 * Accepts both the current persisted shape (`plans` / `activePlanId`, written
 * by `persist()`) and the legacy v2 shape (`profiles` / `activeProfileId`),
 * running every stored plan through `migrateProfile` either way.
 */
export function parsePersisted(raw: unknown): ParsedPersisted | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const isV3 = Boolean(obj.plans && typeof obj.plans === "object");
  const rawProfiles = isV3
    ? (obj.plans as Record<string, unknown>)
    : obj.profiles && typeof obj.profiles === "object"
      ? (obj.profiles as Record<string, unknown>)
      : null;
  if (!rawProfiles) return null;

  const rawActiveId = obj.activePlanId ?? obj.activeProfileId;

  const storedIds = Object.keys(rawProfiles);
  if (storedIds.length === 0) return null;

  const migratedPlans: Record<string, Plan> = {};
  for (const id of storedIds) {
    const rawPlan = rawProfiles[id];
    // A persisted v3 `Plan` carries no `schemaVersion` field of its own —
    // only the envelope around `plans` does — so `migrateProfile` cannot
    // tell it apart from a v2 profile without this tag, and would otherwise
    // re-run it through `mapV2ToV3`, reading fields (`v2.testator`, …) that
    // don't exist at the v3 shape's top level and silently blanking them.
    const taggedPlan =
      isV3 && rawPlan && typeof rawPlan === "object"
        ? { ...rawPlan, schemaVersion: CURRENT_SCHEMA_VERSION }
        : rawPlan;
    const result = migrateProfile(id, taggedPlan);
    if (result.success) migratedPlans[id] = result.plan;
  }
  if (Object.keys(migratedPlans).length === 0) return null;

  return {
    plans: migratedPlans,
    activePlanId:
      typeof rawActiveId === "string" && rawActiveId in migratedPlans
        ? rawActiveId
        : Object.keys(migratedPlans)[0]!,
  };
}

export function loadFromStorage(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = parsePersisted(JSON.parse(raw));
    if (!parsed) return false;

    plans.value = parsed.plans;
    activePlanId.value = parsed.activePlanId;
    return true;
  } catch {
    return false;
  }
}

function persist(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const data: PersistedState = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activePlanId: activePlanId.value,
    activeDocumentId: activeDocumentId.value,
    plans: plans.value,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private browsing, quota) — persistence is
    // best-effort, not a hard dependency of the in-memory store.
  }
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;

effect(() => {
  // Read every signal this effect depends on before scheduling, so preact
  // signals' dependency tracking sees them even though the actual write is
  // deferred past the debounce.
  void plans.value;
  void activePlanId.value;
  void activeDocumentId.value;

  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(persist, PERSIST_DEBOUNCE_MS);
});
