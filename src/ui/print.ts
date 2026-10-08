import { signal } from "@preact/signals";

import { DOCUMENTS } from "../documents/registry";
import { activeDocumentId, activePlan } from "../store/index";
import { closeEditor } from "./editing";
import {
  escapeCssString,
  printDocLabel,
  printInitialsLabel,
} from "./printLabels";
import { view } from "./view";

// The `@page` margin boxes read `--print-doc-label`/`--print-initials-label`
// off the root element (`print.css`); the standalone export inlines its own
// `:root` rule for the same two vars (`export/standaloneHtml.ts`) — this is
// the live app's equivalent, since the app has no per-print stylesheet to
// inline into.
function setPrintLabels(): void {
  const plan = activePlan.value;
  const doc = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const root = document.documentElement.style;
  if (!plan || !doc) {
    root.removeProperty("--print-doc-label");
    root.removeProperty("--print-initials-label");
    return;
  }
  root.setProperty(
    "--print-doc-label",
    `"${escapeCssString(printDocLabel(plan, doc))}"`
  );
  root.setProperty(
    "--print-initials-label",
    `"${escapeCssString(printInitialsLabel(doc))}"`
  );
}

// The checklist view replaces `app-body`, so `#document-sheet` is unmounted
// while it's showing — printing from there would print an empty page.
// Switches back to the document view first, then waits two animation
// frames (one for Preact's render, one for the browser to paint it) before
// calling `window.print()`. `installPrintPresentationSwitch` (already
// wired at the app root) forces Paper for the duration of the print; this
// function does not touch `presentation` itself.
export function printDocument(): void {
  closeEditor();
  view.value = "document";
  printAfterPaint();
}

function printAfterPaint(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}

// While set, the app renders every document of that plan in sequence in
// place of the current view (`components/PrintAll.tsx`); cleared by
// `installPrintAllReset`'s events.
export const printAllPlanId = signal<string | null>(null);

function resetPrintAll(): void {
  printAllPlanId.value = null;
}

export function printAllDocuments(planId: string): void {
  closeEditor();
  printAllPlanId.value = planId;
  printAfterPaint();
}

const PRINT_ALL_RESET_EVENTS = ["afterprint", "pagehide", "hashchange"];

export function installPrintAllReset(): () => void {
  for (const type of PRINT_ALL_RESET_EVENTS) {
    window.addEventListener(type, resetPrintAll);
  }
  return () => {
    for (const type of PRINT_ALL_RESET_EVENTS) {
      window.removeEventListener(type, resetPrintAll);
    }
  };
}

// Cmd+P bypasses `printDocument`, so the labels are also set when the
// browser announces the print.
export function installPrintLabels(): () => void {
  window.addEventListener("beforeprint", setPrintLabels);
  return () => window.removeEventListener("beforeprint", setPrintLabels);
}
