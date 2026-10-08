// Signals-derived state behind the Execute flow (mockup 06: "signing day"),
// mirroring `./advisories.ts`'s shape: resolves document/plan from the store
// rather than taking them as parameters. Each document supplies its own
// group defs (`DocumentDefinition.executeGroups`) as field paths resolved
// through `resolveFieldPath`, so labels and hints come from the one
// registry rather than being retyped.
import { computed, effect, signal } from "@preact/signals";

import { DOCUMENTS, type DocumentDefinition } from "../documents/registry";
import type { Section } from "../form/field-spec";
import { resolveFieldPath, type LeafFieldSpec } from "../form/registry";
import type { Plan } from "../model/plan";
import { activeDocumentId, activePlan, setField } from "../store/index";
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

effect(() => {
  void activeDocumentId.value;
  executeGroupIndex.value = 0;
});

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

type ExecutionRecord = Plan["executions"][keyof Plan["executions"]];

function recordHasAnswers(value: unknown): boolean {
  if (typeof value === "string") return value !== "";
  if (Array.isArray(value)) return value.some(recordHasAnswers);
  if (value && typeof value === "object") {
    return Object.values(value).some(recordHasAnswers);
  }
  return false;
}

// Other documents whose execution record has any answer, offered as the
// source of a one-click copy into the active document's record — only while
// that record is still empty, so a copy never overwrites entered answers.
export const copySources = computed<DocumentDefinition[]>(() => {
  const plan = activePlan.value;
  const active = activeDocument.value;
  if (!plan || !active) return [];
  if (recordHasAnswers(plan.executions[active.executionKey])) return [];
  return DOCUMENTS.filter(
    (doc) =>
      doc.id !== active.id &&
      recordHasAnswers(plan.executions[doc.executionKey])
  );
});

export function copyExecutionFrom(source: DocumentDefinition): void {
  const plan = activePlan.value;
  const active = activeDocument.value;
  if (!plan || !active) return;
  const record: ExecutionRecord = plan.executions[source.executionKey];
  setField(`executions.${active.executionKey}`, record);
}
