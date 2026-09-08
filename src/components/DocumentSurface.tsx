import { useEffect, useMemo, useRef } from "preact/hooks";

import type { DocumentDefinition } from "../documents/registry";
import {
  EditingContext,
  HighlightContext,
  PlanContext,
} from "../documents/shared/PlanContext";
import { orderedFields } from "../form/registry";
import type { Plan } from "../model/plan";
import { advisoriesByPath } from "../ui/advisories";
import { activeFieldPath, openField } from "../ui/editing";
import { presentation } from "../ui/presentation";
import { usePaperFit } from "../ui/usePaperFit";
import { isNarrow } from "../ui/viewport";

interface DocumentSurfaceProps {
  document: DocumentDefinition;
  plan: Plan;
}

function pathFromEvent(event: Event): string | null {
  const target = event.target as HTMLElement | null;
  return target?.closest<HTMLElement>("[data-path]")?.dataset.path ?? null;
}

function triggerFromEvent(event: Event): HTMLElement | null {
  const target = event.target as HTMLElement | null;
  return target?.closest<HTMLElement>("[data-path]") ?? null;
}

export function DocumentSurface({ document, plan }: DocumentSurfaceProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const isPaper = presentation.value === "paper";

  usePaperFit(viewportRef, fitRef, sheetRef, isPaper);

  const labelFor = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of orderedFields(plan, document.sections)) {
      map.set(entry.field.path, entry.field.label);
    }
    return (path: string) => map.get(path) ?? path;
  }, [plan, document.sections]);

  const activePath = activeFieldPath.value;
  const advisoryMap = advisoriesByPath.value;
  const advisoriesFor = (path: string) => advisoryMap.get(path) ?? [];

  // Scrolls the tapped clause above the sheet/panel, per the parent plan.
  useEffect(() => {
    if (!activePath) return;
    const node = sheetRef.current?.querySelector<HTMLElement>(
      `[data-path="${CSS.escape(activePath)}"]`
    );
    node?.scrollIntoView({ block: "center" });
  }, [activePath]);

  function handleClick(event: MouseEvent) {
    const path = pathFromEvent(event);
    if (!path) return;
    openField(path, triggerFromEvent(event));
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const path = pathFromEvent(event);
    if (!path) return;
    event.preventDefault();
    openField(path, triggerFromEvent(event));
  }

  const sheetOpen = isNarrow.value && activePath !== null;
  const Body = document.Body;

  return (
    <main
      id="main-content"
      class={`doc-surface${sheetOpen ? " with-bottom-sheet" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <PlanContext.Provider value={plan}>
        <HighlightContext.Provider value={true}>
          <EditingContext.Provider
            value={{ activePath, interactive: true, labelFor, advisoriesFor }}
          >
            {isPaper ? (
              <div class="paper-viewport" ref={viewportRef}>
                <div class="paper-fit" ref={fitRef}>
                  <article
                    id="document-sheet"
                    class="paged-sheet"
                    data-highlights="true"
                    ref={sheetRef}
                  >
                    <Body />
                  </article>
                </div>
              </div>
            ) : (
              <article
                id="document-sheet"
                class="reading-sheet"
                data-highlights="true"
                ref={sheetRef}
              >
                <Body />
              </article>
            )}
          </EditingContext.Provider>
        </HighlightContext.Provider>
      </PlanContext.Provider>
    </main>
  );
}
