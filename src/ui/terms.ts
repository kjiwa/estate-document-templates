import { signal } from "@preact/signals";

import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "estate_templates_terms_v1";

// Bump when the terms change materially; the stored value must match to skip
// the gate.
export const TERMS_VERSION = "2026-10-11";

export type TermsDialog = "terms" | "privacy";

export const accepted = signal(readStorage(STORAGE_KEY) === TERMS_VERSION);
export const reviewing = signal<TermsDialog | null>(null);

export function acceptTerms(): void {
  writeStorage(STORAGE_KEY, TERMS_VERSION);
  accepted.value = true;
}

export function openDialog(dialog: TermsDialog): void {
  reviewing.value = dialog;
}

export function closeDialog(): void {
  reviewing.value = null;
}
