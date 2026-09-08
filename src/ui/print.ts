import { DOCUMENTS } from "../documents/registry";
import { activeDocumentId, activePlan } from "../store/index";
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
  setPrintLabels();
  view.value = "document";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}
