// Signals-derived state behind the Execute flow (mockup 06: "signing day"),
// mirroring `./advisories.ts`'s shape: resolves document/plan from the store
// rather than taking them as parameters. Each document supplies its own
// group defs (`DocumentDefinition.executeGroups`) as field paths resolved
// through `resolveFieldPath`, so labels and hints come from the one
// registry rather than being retyped.
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

export interface ExecuteGroup {
  title: string;
  lead: string;
  fields: LeafFieldSpec[];
}

export const executeGroups = computed<ExecuteGroup[]>(() => {
  const plan = activePlan.value;
  if (!plan) return [];
  const defs = activeDocument.value?.executeGroups ?? [];
  return defs.map((def) => ({
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
