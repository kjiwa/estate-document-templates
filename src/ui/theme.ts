import { effect, signal } from "@preact/signals";

import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "estate_templates_theme_v1";

export type Theme = "system" | "light" | "dark";

function readStoredTheme(): Theme {
  const raw = readStorage(STORAGE_KEY);
  return raw === "light" || raw === "dark" ? raw : "system";
}

export const theme = signal<Theme>(readStoredTheme());

function applyTheme(value: Theme): void {
  if (typeof document === "undefined") return;
  if (value === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", value);
  }
}

function persistTheme(value: Theme): void {
  writeStorage(STORAGE_KEY, value);
}

effect(() => {
  applyTheme(theme.value);
  persistTheme(theme.value);
});

export function setTheme(value: Theme): void {
  theme.value = value;
}
