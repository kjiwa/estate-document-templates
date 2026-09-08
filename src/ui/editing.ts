// The active-field/section state behind the contextual panel and bottom
// sheet, plus the traversal (Prev/Next) and focus-restoration bookkeeping
// they share. Resolves its document/plan from the store rather than taking
// them as parameters, so `openSection`/`stepField` stay callable with just
// the id a click handler has in hand.
import { computed, signal } from "@preact/signals";

import { DOCUMENTS } from "../documents/registry";
import type { Section } from "../form/field-spec";
import {
  findFieldByPath,
  orderedFields,
  sectionFields,
  type FieldEntry,
  type LeafFieldSpec,
} from "../form/registry";
import type { Path } from "../model/paths";
import type { Plan } from "../model/plan";
import { activeDocumentId, activePlan } from "../store/index";

const activeDocument = computed(() =>
  DOCUMENTS.find((doc) => doc.id === activeDocumentId.value)
);
const sections = computed<Section[]>(
  () => activeDocument.value?.sections ?? []
);

export const activeFieldPath = signal<Path<Plan> | null>(null);
export const activeSectionId = signal<string | null>(null);

let triggerEl: HTMLElement | null = null;

export const entries = computed<FieldEntry[]>(() => {
  const plan = activePlan.value;
  return plan ? orderedFields(plan, sections.value) : [];
});

export const activeEntryIndex = computed<number>(() => {
  const path = activeFieldPath.value;
  if (path === null) return -1;
  return entries.value.findIndex((entry) => entry.field.path === path);
});

export const activeSection = computed<Section | null>(() => {
  const id = activeSectionId.value;
  return sections.value.find((section) => section.id === id) ?? null;
});

export const activeSectionFieldList = computed<LeafFieldSpec[]>(() => {
  const section = activeSection.value;
  return section ? sectionFields(section) : [];
});

export const canStepPrev = computed<boolean>(() => activeEntryIndex.value > 0);
export const canStepNext = computed<boolean>(
  () =>
    activeEntryIndex.value !== -1 &&
    activeEntryIndex.value < entries.value.length - 1
);

export function announce(message: string): void {
  if (typeof document === "undefined") return;
  const status = document.getElementById("a11y-status");
  if (status) status.textContent = message;
}

function announceEntry(entry: FieldEntry): void {
  announce(
    `Editing ${entry.field.label}, ${entry.index + 1} of ${entries.value.length}`
  );
}

export function openField(path: string, trigger?: HTMLElement | null): void {
  const plan = activePlan.value;
  if (!plan) return;
  const entry = findFieldByPath(plan, sections.value, path);
  if (!entry) return;
  activeFieldPath.value = entry.field.path;
  activeSectionId.value = entry.section.id;
  triggerEl = trigger ?? null;
  announceEntry(entry);
}

export function openSection(
  sectionId: string,
  trigger?: HTMLElement | null
): void {
  const section = sections.value.find((s) => s.id === sectionId);
  if (!section) return;
  const first = sectionFields(section)[0];
  if (!first) {
    activeSectionId.value = sectionId;
    activeFieldPath.value = null;
    triggerEl = trigger ?? null;
    return;
  }
  openField(first.path, trigger);
}

export function closeEditor(): void {
  activeFieldPath.value = null;
  activeSectionId.value = null;
  const trigger = triggerEl;
  triggerEl = null;
  trigger?.focus();
}

export function stepField(delta: number): void {
  const idx = activeEntryIndex.value;
  if (idx === -1) return;
  const nextIdx = idx + delta;
  const list = entries.value;
  if (nextIdx < 0 || nextIdx >= list.length) return;
  const next = list[nextIdx];
  if (!next) return;
  activeFieldPath.value = next.field.path;
  activeSectionId.value = next.section.id;
  announceEntry(next);
}
