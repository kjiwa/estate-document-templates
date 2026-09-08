import { view } from "./view";

// The checklist view replaces `app-body`, so `#document-sheet` is unmounted
// while it's showing — printing from there would print an empty page.
// Switches back to the document view first, then waits two animation
// frames (one for Preact's render, one for the browser to paint it) before
// calling `window.print()`. `installPrintPresentationSwitch` (already
// wired at the app root) forces Paper for the duration of the print; this
// function does not touch `presentation` itself.
export function printDocument(): void {
  view.value = "document";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}
