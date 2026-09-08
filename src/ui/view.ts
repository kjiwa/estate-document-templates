import { signal } from "@preact/signals";

export const view = signal<"document" | "plans">("document");
