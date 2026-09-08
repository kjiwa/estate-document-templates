import { useEffect, useRef } from "preact/hooks";

import { Field, fieldId } from "../form/Field";
import { advisoriesByPath } from "../ui/advisories";
import {
  activeFieldPath,
  activeSection,
  activeSectionFieldList,
  canStepNext,
  canStepPrev,
  closeEditor,
  stepField,
} from "../ui/editing";
import { FieldGuidance } from "./FieldGuidance";

// Desktop: the tapped field's whole section, per
// `design/mockups/01-desktop-draft.html`. Not modal — a third grid column
// beside the document, so it carries no `role="dialog"`.
export function ContextPanel() {
  const groupRef = useRef<HTMLDivElement>(null);
  const section = activeSection.value;
  const path = activeFieldPath.value;

  // Focuses the tapped field when the section (or the active path within
  // it, via Prev/Next) changes — not on every plan-driven re-render, so
  // typing in the field doesn't keep stealing its own focus.
  useEffect(() => {
    if (!section || !path) return;
    const el = groupRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(fieldId(path))}`
    );
    el?.focus();
  }, [section?.id, path]);

  if (!section) return null;

  const fieldAdvisories = path ? (advisoriesByPath.value.get(path) ?? []) : [];

  return (
    <aside class="context-panel" aria-label="Edit field">
      <div class="panel-heading">
        <h2>{section.legend}</h2>
        <button
          type="button"
          class="btn"
          aria-label="Close"
          onClick={closeEditor}
        >
          ✕
        </button>
      </div>
      <FieldGuidance guidanceId={section.guidance} />
      {fieldAdvisories.map((advisory) => (
        <div class="advisory" key={advisory.id}>
          {advisory.message}
        </div>
      ))}
      <div class="panel-field-group" ref={groupRef}>
        {activeSectionFieldList.value.map((field) => (
          <Field field={field} key={field.path} />
        ))}
      </div>
      <div class="field-nav">
        <button
          type="button"
          class="btn"
          disabled={!canStepPrev.value}
          onClick={() => stepField(-1)}
        >
          ← Prev
        </button>
        <button
          type="button"
          class="btn btn-primary"
          disabled={!canStepNext.value}
          onClick={() => stepField(1)}
        >
          Next →
        </button>
      </div>
    </aside>
  );
}
