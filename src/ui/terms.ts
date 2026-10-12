import { signal } from "@preact/signals";

import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "estate_templates_terms";

// Bump when the terms change materially; the stored value must match to skip
// the gate.
export const TERMS_VERSION = "2026-10-11";

export const accepted = signal(readStorage(STORAGE_KEY) === TERMS_VERSION);

export function acceptTerms(): void {
  writeStorage(STORAGE_KEY, TERMS_VERSION);
  accepted.value = true;
}
