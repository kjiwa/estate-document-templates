import type { RefObject } from "preact";
import { useEffect } from "preact/hooks";

// The hook form of design/build-mockups.mjs's paperFitScript: measures the
// sheet's unscaled height and the viewport's available width, then sets
// --paper-scale/--paper-height so document-paper.css's fit-to-width rule has
// real numbers. The 0.4 floor is the same legibility judgment call made in
// Phase 2 — verified by eye at 393px, not derived arithmetically.
const SHEET_WIDTH_PX = 816; // 8.5in at 96dpi — var(--sheet-width)

export function usePaperFit(
  viewportRef: RefObject<HTMLElement | null>,
  fitRef: RefObject<HTMLElement | null>,
  sheetRef: RefObject<HTMLElement | null>,
  // The refs' identity never changes, so an effect keyed only on the refs
  // never re-runs when the paper markup mounts/unmounts under a presentation
  // toggle — `active` forces a re-run exactly when that markup (and thus
  // `.current`) changes.
  active: boolean
): void {
  useEffect(() => {
    if (!active) return;
    const viewport = viewportRef.current;
    const fitEl = fitRef.current;
    const sheet = sheetRef.current;
    if (!viewport || !fitEl || !sheet) return;

    const fit = () => {
      const scale = Math.min(
        1,
        Math.max(0.4, viewport.clientWidth / SHEET_WIDTH_PX)
      );
      fitEl.style.setProperty("--paper-scale", String(scale));
      fitEl.style.setProperty("--paper-height", `${sheet.scrollHeight}px`);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(viewport);
    ro.observe(sheet);
    fit();

    return () => ro.disconnect();
  }, [viewportRef, fitRef, sheetRef, active]);
}
