import { signal } from "@preact/signals";

import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "estate_templates_disclaimer_v1";

function readAccepted(): boolean {
  return readStorage(STORAGE_KEY) !== null;
}

function writeAccepted(): void {
  writeStorage(STORAGE_KEY, "accepted");
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
