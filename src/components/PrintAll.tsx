import { DOCUMENTS } from "../documents/registry";
import { HighlightContext, PlanContext } from "../documents/shared/PlanContext";
import type { Plan } from "../model/plan";
import { resetPrintAll } from "../ui/print";
import { namedPageRules, printPageName } from "../ui/printLabels";

interface PrintAllProps {
  plan: Plan;
}

export function PrintAll({ plan }: PrintAllProps) {
  return (
    <main id="main-content" class="print-all">
      <style>{namedPageRules(plan, DOCUMENTS)}</style>
      <button type="button" class="btn no-print" onClick={resetPrintAll}>
        Done
      </button>
      <PlanContext.Provider value={plan}>
        <HighlightContext.Provider value={false}>
          {DOCUMENTS.map((document) => (
            <article
              class="paged-sheet"
              data-document={document.id}
              style={`page: ${printPageName(document)}`}
              key={document.id}
            >
              <document.Body />
            </article>
          ))}
        </HighlightContext.Provider>
      </PlanContext.Provider>
    </main>
  );
}
