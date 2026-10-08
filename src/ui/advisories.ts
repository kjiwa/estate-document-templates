// Signals-derived advisory state, mirroring `./editing.ts`'s shape: resolves
// document/plan from the store rather than taking them as parameters, so
// `showAdvisory` stays callable with just the id a click handler has in hand.
import { computed } from "@preact/signals";

import { DOCUMENTS, type DocumentDefinition } from "../documents/registry";
import { resolveFieldPath } from "../form/registry";
import type { Advisory } from "../model/advisory";
import type { Section } from "../form/field-spec";
import type { Plan } from "../model/plan";
import { isFieldAnswered, isRequired } from "./completion";
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

function restatesMissingField(
  plan: Plan,
  document: DocumentDefinition,
  advisory: Advisory
): boolean {
  const entry = resolveFieldPath(plan, document.sections, advisory.path);
  return (
    !!entry &&
    isRequired(plan, entry.field) &&
    !isFieldAnswered(plan, entry.field)
  );
}

// Advisories for the plans overview: those restating an unanswered required
// field are dropped (the progress count already says so); warnings first.
export function overviewAdvisories(
  plan: Plan,
  document: DocumentDefinition
): Advisory[] {
  const kept = document
    .review(plan)
    .filter((advisory) => !restatesMissingField(plan, document, advisory));
  return [
    ...kept.filter((a) => a.severity === "warning"),
    ...kept.filter((a) => a.severity !== "warning"),
  ];
}

export interface AdvisoryGroup {
  title: string;
  count: number;
  first: Advisory;
}

export function groupByTitle(advisories: Advisory[]): AdvisoryGroup[] {
  const groups = new Map<string, AdvisoryGroup>();
  for (const advisory of advisories) {
    const group = groups.get(advisory.title);
    if (group) group.count += 1;
    else
      groups.set(advisory.title, {
        title: advisory.title,
        count: 1,
        first: advisory,
      });
  }
  return [...groups.values()];
}

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
