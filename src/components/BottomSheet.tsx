import { useRef } from "preact/hooks";

import { Field } from "../form/Field";
import {
  activeEntryIndex,
  activeSection,
  canStepNext,
  canStepPrev,
  closeEditor,
  entries,
  stepField,
} from "../ui/editing";
import { useFocusTrap } from "../ui/useFocusTrap";
import { FieldGuidance } from "./FieldGuidance";

// Mobile: exactly one field, per `design/mockups/04-mobile-reading-sheet.html`.
export function BottomSheet() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const idx = activeEntryIndex.value;
  const entry = idx >= 0 ? entries.value[idx] : undefined;

  useFocusTrap(
    sheetRef,
    entry !== undefined,
    closeEditor,
    entry?.field.path ?? null
  );

  if (!entry) return null;

  return (
    <div
      class="bottom-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Edit field"
      ref={sheetRef}
    >
      <div class="sheet-grabber" />
      <div class="sheet-heading">
        <h2>{entry.field.label}</h2>
        <button
          type="button"
          class="btn"
          aria-label="Close"
          onClick={closeEditor}
        >
          ✕
        </button>
      </div>
      <FieldGuidance guidanceId={activeSection.value?.guidance} />
      <Field field={entry.field} />
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
    </div>
  );
}
