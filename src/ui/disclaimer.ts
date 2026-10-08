import { signal } from "@preact/signals";

const STORAGE_KEY = "estate_templates_disclaimer_v1";

function readAccepted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function writeAccepted(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
  } catch {
    // Storage unavailable: the notice shows again next visit.
  }
}

export const accepted = signal(readAccepted());
export const reviewing = signal(false);

export function acceptDisclaimer(): void {
  writeAccepted();
  accepted.value = true;
}

export function openDisclaimer(): void {
  reviewing.value = true;
}

export function closeDisclaimer(): void {
  reviewing.value = false;
}
