import { signal } from "@preact/signals";

export type View = "document" | "plans" | "execute" | "print";

export const VIEWS: readonly View[] = ["document", "plans", "execute", "print"];

export const view = signal<View>("document");
