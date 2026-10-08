import { effect, signal } from "@preact/signals";

import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "estate_templates_presentation_v1";

export type Presentation = "reading" | "paper";

function defaultPresentation(): Presentation {
  if (typeof window === "undefined" || !window.matchMedia) return "reading";
  return window.matchMedia("(min-width: 901px)").matches ? "paper" : "reading";
}

function readStoredPresentation(): Presentation {
  const raw = readStorage(STORAGE_KEY);
  return raw === "reading" || raw === "paper" ? raw : defaultPresentation();
}

export const presentation = signal<Presentation>(readStoredPresentation());

function persistPresentation(value: Presentation): void {
  writeStorage(STORAGE_KEY, value);
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
