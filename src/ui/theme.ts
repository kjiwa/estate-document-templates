import { effect, signal } from "@preact/signals";

import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "estate_templates_theme_v1";

export type Theme = "system" | "light" | "dark";

function readStoredTheme(): Theme {
  const raw = readStorage(STORAGE_KEY);
  return raw === "light" || raw === "dark" ? raw : "system";
}

export const theme = signal<Theme>(readStoredTheme());

const DARK_QUERY = "(prefers-color-scheme: dark)";

function resolveTheme(value: Theme): "light" | "dark" {
  if (value !== "system") return value;
  if (typeof window.matchMedia !== "function") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(value: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolveTheme(value));
}

function persistTheme(value: Theme): void {
  writeStorage(STORAGE_KEY, value);
}

effect(() => {
  applyTheme(theme.value);
  persistTheme(theme.value);
});

if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  window.matchMedia(DARK_QUERY).addEventListener("change", () => {
    if (theme.value === "system") applyTheme("system");
  });
}

export function setTheme(value: Theme): void {
  theme.value = value;
}
