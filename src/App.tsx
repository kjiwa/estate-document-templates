import { AppHeader } from "./components/AppHeader";
import { BottomSheet } from "./components/BottomSheet";
import { ContextPanel } from "./components/ContextPanel";
import { DocumentSurface } from "./components/DocumentSurface";
import { ExecuteFlow } from "./components/ExecuteFlow";
import { PlansView } from "./components/PlansView";
import { PrintChecklist } from "./components/PrintChecklist";
import { Rail } from "./components/Rail";
import { DOCUMENTS } from "./documents/registry";
import { PlanContext } from "./documents/shared/PlanContext";
import { activeDocumentId, activePlan } from "./store/index";
import { activeFieldPath } from "./ui/editing";
import { view } from "./ui/view";
import { isNarrow } from "./ui/viewport";

export function App() {
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const plan = activePlan.value;
  const editorOpen = activeFieldPath.value !== null;
  const showPanel = editorOpen && !isNarrow.value;
  const showSheet = editorOpen && isNarrow.value;
  const showPlans = view.value === "plans";
  const showExecute = view.value === "execute";
  const showPrintChecklist = view.value === "print";

  return (
    <>
      <a href="#main-content" class="skip-link">
        Skip to document
      </a>
      <AppHeader />
      {showPlans ? (
        <PlansView />
      ) : document && plan ? (
        // `Field` (used by `ContextPanel`/`BottomSheet`, siblings of
        // `DocumentSurface`, and by `ExecuteFlow`) reads the plan via
        // `usePlan()`, so the provider has to sit above all of them, not
        // just inside `DocumentSurface`.
        <PlanContext.Provider value={plan}>
          {showExecute ? (
            <ExecuteFlow />
          ) : showPrintChecklist ? (
            <PrintChecklist />
          ) : (
            <>
              <div class={`app-body${showPanel ? " with-panel" : ""}`}>
                <Rail document={document} plan={plan} />
                <DocumentSurface document={document} plan={plan} />
                {showPanel ? <ContextPanel /> : null}
              </div>
              {showSheet ? <BottomSheet /> : null}
            </>
          )}
        </PlanContext.Provider>
      ) : null}
      <div id="a11y-status" class="sr-only" aria-live="polite" />
    </>
  );
}
