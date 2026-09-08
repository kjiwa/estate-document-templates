import { effect, signal } from "@preact/signals";

const STORAGE_KEY = "estate_templates_presentation_v1";

export type Presentation = "reading" | "paper";

function defaultPresentation(): Presentation {
  if (typeof window === "undefined" || !window.matchMedia) return "reading";
  return window.matchMedia("(min-width: 900px)").matches ? "paper" : "reading";
}

function readStoredPresentation(): Presentation {
  if (typeof window === "undefined" || !window.localStorage) {
    return defaultPresentation();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "reading" || raw === "paper" ? raw : defaultPresentation();
}

export const presentation = signal<Presentation>(readStoredPresentation());

function persistPresentation(value: Presentation): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage may be unavailable (private browsing, quota) — persistence is
    // best-effort, not a hard dependency of the presentation signal.
  }
}

effect(() => {
  persistPresentation(presentation.value);
});

export function setPresentation(value: Presentation): void {
  presentation.value = value;
}

// "Print is always Paper": beforeprint switches to Paper for the duration of
// the print, afterprint restores whatever the user had selected. Playwright's
// print-media emulation does not fire these events — verified by hand.
let presentationBeforePrint: Presentation | null = null;

export function installPrintPresentationSwitch(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleBeforePrint = () => {
    presentationBeforePrint = presentation.value;
    presentation.value = "paper";
  };
  const handleAfterPrint = () => {
    if (presentationBeforePrint !== null) {
      presentation.value = presentationBeforePrint;
      presentationBeforePrint = null;
    }
  };

  window.addEventListener("beforeprint", handleBeforePrint);
  window.addEventListener("afterprint", handleAfterPrint);
  return () => {
    window.removeEventListener("beforeprint", handleBeforePrint);
    window.removeEventListener("afterprint", handleAfterPrint);
  };
}
