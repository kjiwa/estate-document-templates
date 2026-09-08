// Matches `app.css:102`'s breakpoint, so the contextual panel (desktop) and
// bottom sheet (mobile) never render at once.
import { signal } from "@preact/signals";

const QUERY = "(max-width: 900px)";

function initialIsNarrow(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

export const isNarrow = signal<boolean>(initialIsNarrow());

if (typeof window !== "undefined" && window.matchMedia) {
  window.matchMedia(QUERY).addEventListener("change", (event) => {
    isNarrow.value = event.matches;
  });
}
