import { effect, signal } from "@preact/signals";

const STORAGE_KEY = "estate_templates_theme_v1";

export type Theme = "system" | "light" | "dark";

function readStoredTheme(): Theme {
  if (typeof window === "undefined" || !window.localStorage) return "system";
  const raw = window.localStorage.getItem(STORAGE_KEY);
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
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (value === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  } catch {
    // Storage may be unavailable (private browsing, quota) — persistence is
    // best-effort, not a hard dependency of the theme signal.
  }
}

effect(() => {
  applyTheme(theme.value);
  persistTheme(theme.value);
});

export function setTheme(value: Theme): void {
  theme.value = value;
}
