import { useEffect, useRef } from "preact/hooks";

import { AppHeader } from "./components/AppHeader";
import { BottomSheet } from "./components/BottomSheet";
import { ContextPanel } from "./components/ContextPanel";
import { AppFooter, Disclaimer } from "./components/Disclaimer";
import { DocumentSurface } from "./components/DocumentSurface";
import { ExecuteFlow } from "./components/ExecuteFlow";
import { PlansView } from "./components/PlansView";
import { PrintChecklist } from "./components/PrintChecklist";
import { Rail } from "./components/Rail";
import { DOCUMENTS } from "./documents/registry";
import { PlanContext } from "./documents/shared/PlanContext";
import { activeDocumentId, activePlan, storageNotice } from "./store/index";
import { activeFieldPath } from "./ui/editing";
import { view } from "./ui/view";
import { isNarrow } from "./ui/viewport";

const SKIP_LABELS: Record<typeof view.value, string> = {
  document: "Skip to document",
  plans: "Skip to plans",
  execute: "Skip to signing steps",
  print: "Skip to print checklist",
};

function useFocusHeadingOnViewChange(current: typeof view.value): void {
  const previous = useRef(current);
  useEffect(() => {
    if (previous.current === current) return;
    previous.current = current;
    const heading = document.querySelector<HTMLElement>("#main-content h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
  }, [current]);
}

function StorageNotice() {
  const message = storageNotice.value;
  if (!message) return null;
  return (
    <div class="storage-notice" role="status">
      {message}{" "}
      <button
        type="button"
        class="link-button"
        onClick={() => {
          view.value = "plans";
        }}
      >
        Plans
      </button>
    </div>
  );
}

export function App() {
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const plan = activePlan.value;
  const editorOpen = activeFieldPath.value !== null;
  const showPanel = editorOpen && !isNarrow.value;
  const showSheet = editorOpen && isNarrow.value;
  const showPlans = view.value === "plans";
  const showExecute = view.value === "execute";
  const showPrintChecklist = view.value === "print";
  useFocusHeadingOnViewChange(view.value);

  return (
    <>
      <a href="#main-content" class="skip-link">
        {SKIP_LABELS[view.value]}
      </a>
      <AppHeader />
      <StorageNotice />
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
      <AppFooter />
      <Disclaimer />
      <div id="a11y-status" class="sr-only" aria-live="polite" />
    </>
  );
}
