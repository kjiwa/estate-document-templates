import { AppHeader } from "./components/AppHeader";
import { BottomSheet } from "./components/BottomSheet";
import { ContextPanel } from "./components/ContextPanel";
import { DocumentSurface } from "./components/DocumentSurface";
import { Rail } from "./components/Rail";
import { DOCUMENTS } from "./documents/registry";
import { PlanContext } from "./documents/shared/PlanContext";
import { activeDocumentId, activePlan } from "./store/index";
import { activeFieldPath } from "./ui/editing";
import { isNarrow } from "./ui/viewport";

export function App() {
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const plan = activePlan.value;
  const editorOpen = activeFieldPath.value !== null;
  const showPanel = editorOpen && !isNarrow.value;
  const showSheet = editorOpen && isNarrow.value;

  return (
    <>
      <a href="#main-content" class="skip-link">
        Skip to document
      </a>
      <AppHeader />
      {document && plan ? (
        // `Field` (used by both `ContextPanel` and `BottomSheet`, siblings
        // of `DocumentSurface` rather than its children) reads the plan via
        // `usePlan()`, so the provider has to sit above all three, not just
        // inside `DocumentSurface`.
        <PlanContext.Provider value={plan}>
          <div class={`app-body${showPanel ? " with-panel" : ""}`}>
            <Rail document={document} plan={plan} />
            <DocumentSurface document={document} plan={plan} />
            {showPanel ? <ContextPanel /> : null}
          </div>
          {showSheet ? <BottomSheet /> : null}
        </PlanContext.Provider>
      ) : null}
      <div id="a11y-status" class="sr-only" aria-live="polite" />
    </>
  );
}
