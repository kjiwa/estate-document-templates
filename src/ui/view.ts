import { signal } from "@preact/signals";

export const view = signal<"document" | "plans" | "execute" | "print">(
  "document"
);
