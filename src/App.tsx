import { AppHeader } from "./components/AppHeader";
import { DocumentSurface } from "./components/DocumentSurface";
import { Rail } from "./components/Rail";
import { DOCUMENTS } from "./documents/registry";
import { activeDocumentId, activePlan } from "./store/index";

export function App() {
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const plan = activePlan.value;

  return (
    <>
      <a href="#main-content" class="skip-link">
        Skip to document
      </a>
      <AppHeader />
      {document && plan ? (
        <div class="app-body">
          <Rail document={document} plan={plan} />
          <DocumentSurface document={document} plan={plan} />
        </div>
      ) : null}
      <div id="a11y-status" class="sr-only" aria-live="polite" />
    </>
  );
}
