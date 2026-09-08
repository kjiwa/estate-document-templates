import { useRef } from "preact/hooks";

import type { DocumentDefinition } from "../documents/registry";
import { HighlightContext, PlanContext } from "../documents/shared/PlanContext";
import type { Plan } from "../model/plan";
import { presentation } from "../ui/presentation";
import { usePaperFit } from "../ui/usePaperFit";

interface DocumentSurfaceProps {
  document: DocumentDefinition;
  plan: Plan;
}

export function DocumentSurface({ document, plan }: DocumentSurfaceProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const isPaper = presentation.value === "paper";

  usePaperFit(viewportRef, fitRef, sheetRef, isPaper);

  const Body = document.Body;

  return (
    <main id="main-content" class="doc-surface">
      <PlanContext.Provider value={plan}>
        <HighlightContext.Provider value={true}>
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
            >
              <Body />
            </article>
          )}
        </HighlightContext.Provider>
      </PlanContext.Provider>
    </main>
  );
}
