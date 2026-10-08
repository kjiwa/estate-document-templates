import { effect } from "@preact/signals";

import { activeDocumentId, setActiveDocument } from "../store/index";
import { VIEWS, view, type View } from "./view";

export interface Route {
  view: View;
  documentId: string | undefined;
}

export function parseRoute(hash: string): Route | null {
  if (!hash.startsWith("#/")) return null;
  const [name, documentId] = hash.slice(2).split("/");
  const parsed = VIEWS.find((candidate) => candidate === name);
  if (!parsed) return null;
  return { view: parsed, documentId: documentId || undefined };
}

export function serializeRoute(current: View, documentId: string): string {
  return `#/${current}/${documentId}`;
}

function applyHash(): void {
  const route = parseRoute(location.hash);
  if (!route) return;
  view.value = route.view;
  if (route.documentId) setActiveDocument(route.documentId);
}

function writeHash(replace: boolean): void {
  const hash = serializeRoute(view.value, activeDocumentId.value);
  if (hash === location.hash) return;
  if (replace) history.replaceState(null, "", hash);
  else history.pushState(null, "", hash);
}

export function installRouter(): void {
  applyHash();
  writeHash(true);
  window.addEventListener("hashchange", applyHash);
  effect(() => {
    void view.value;
    void activeDocumentId.value;
    writeHash(false);
  });
}
