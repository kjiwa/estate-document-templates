// Signals-derived advisory state, mirroring `./editing.ts`'s shape: resolves
// document/plan from the store rather than taking them as parameters, so
// `showAdvisory` stays callable with just the id a click handler has in hand.
import { computed } from "@preact/signals";

import { DOCUMENTS } from "../documents/registry";
import type { Advisory } from "../documents/will/review";
import { resolveFieldPath } from "../form/registry";
import type { Section } from "../form/field-spec";
import { activeDocumentId, activePlan } from "../store/index";
import { openField } from "./editing";

const activeDocument = computed(() =>
  DOCUMENTS.find((doc) => doc.id === activeDocumentId.value)
);
const sections = computed<Section[]>(
  () => activeDocument.value?.sections ?? []
);

export const advisories = computed<Advisory[]>(() => {
  const document = activeDocument.value;
  const plan = activePlan.value;
  return document && plan ? document.review(plan) : [];
});

export const advisoriesByPath = computed<Map<string, Advisory[]>>(() => {
  const map = new Map<string, Advisory[]>();
  for (const advisory of advisories.value) {
    const list = map.get(advisory.path) ?? [];
    list.push(advisory);
    map.set(advisory.path, list);
  }
  return map;
});

// Advisories that resolve to no section (an unrecognized or hidden-section
// path) are collected under a `null` key so they still surface in the
// rail's flat list rather than silently disappearing.
export const advisoriesBySection = computed<Map<string | null, Advisory[]>>(
  () => {
    const map = new Map<string | null, Advisory[]>();
    const plan = activePlan.value;
    for (const advisory of advisories.value) {
      const sectionId = plan
        ? (resolveFieldPath(plan, sections.value, advisory.path)?.section.id ??
          null)
        : null;
      const list = map.get(sectionId) ?? [];
      list.push(advisory);
      map.set(sectionId, list);
    }
    return map;
  }
);

export function showAdvisory(
  advisory: Advisory,
  trigger?: HTMLElement | null
): void {
  const plan = activePlan.value;
  if (!plan) return;
  const entry = resolveFieldPath(plan, sections.value, advisory.path);
  if (!entry) return;
  openField(entry.field.path, trigger);
}
