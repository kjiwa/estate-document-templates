// Signals-derived state behind the Execute flow (mockup 06: "signing day"),
// mirroring `./advisories.ts`'s shape: resolves document/plan from the store
// rather than taking them as parameters. The four groups are declared as
// field paths resolved against `WILL_SECTIONS` through `resolveFieldPath`,
// so labels and hints come from the one registry rather than being retyped.
import { computed, signal } from "@preact/signals";

import { DOCUMENTS } from "../documents/registry";
import type { Section } from "../form/field-spec";
import { resolveFieldPath, type LeafFieldSpec } from "../form/registry";
import { activeDocumentId, activePlan } from "../store/index";
import { isFieldAnswered } from "./completion";

const activeDocument = computed(() =>
  DOCUMENTS.find((doc) => doc.id === activeDocumentId.value)
);
const sections = computed<Section[]>(
  () => activeDocument.value?.sections ?? []
);

interface ExecuteGroupDef {
  title: string;
  lead: string;
  paths: string[];
}

const EXECUTE_GROUP_DEFS: ExecuteGroupDef[] = [
  {
    title: "City and date of execution",
    lead: "Confirm where and when the will is being signed today.",
    paths: ["execution.city", "execution.executionDate"],
  },
  {
    title: "Witness one",
    lead: "Have your first witness fill in their own name and address.",
    paths: [
      "execution.witnesses.0.name",
      "execution.witnesses.0.address",
      "execution.witnesses.0.cityStateZip",
    ],
  },
  {
    title: "Witness two",
    lead: "Have your second witness fill in their own name and address.",
    paths: [
      "execution.witnesses.1.name",
      "execution.witnesses.1.address",
      "execution.witnesses.1.cityStateZip",
    ],
  },
  {
    title: "Notary",
    lead: "Fill in the notary's name and commission expiration once the self-proving affidavit is notarized.",
    paths: ["execution.notary.name", "execution.notary.commissionExpires"],
  },
];

export interface ExecuteGroup {
  title: string;
  lead: string;
  fields: LeafFieldSpec[];
}

export const executeGroups = computed<ExecuteGroup[]>(() => {
  const plan = activePlan.value;
  if (!plan) return [];
  return EXECUTE_GROUP_DEFS.map((def) => ({
    title: def.title,
    lead: def.lead,
    fields: def.paths
      .map((path) => resolveFieldPath(plan, sections.value, path)?.field)
      .filter((field): field is LeafFieldSpec => field !== undefined),
  }));
});

export const executeGroupComplete = computed<boolean[]>(() => {
  const plan = activePlan.value;
  if (!plan) return [];
  return executeGroups.value.map((group) =>
    group.fields.every((field) => isFieldAnswered(plan, field))
  );
});

export const executeGroupIndex = signal<number>(0);

export const currentExecuteGroup = computed<ExecuteGroup | null>(
  () => executeGroups.value[executeGroupIndex.value] ?? null
);

export function startExecuteFlow(): void {
  executeGroupIndex.value = 0;
}

export function stepExecuteGroup(delta: number): void {
  const next = executeGroupIndex.value + delta;
  if (next < 0 || next >= executeGroups.value.length) return;
  executeGroupIndex.value = next;
}
