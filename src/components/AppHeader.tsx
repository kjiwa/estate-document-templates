import { DOCUMENTS } from "../documents/registry";
import {
  activeDocumentId,
  activePlanId,
  plans,
  setActiveDocument,
  setActivePlan,
} from "../store/index";
import { closeEditor } from "../ui/editing";
import { startExecuteFlow } from "../ui/execute";
import { serializeRoute } from "../ui/route";
import { view } from "../ui/view";
import { PresentationToggle } from "./PresentationToggle";
import { ThemeToggle } from "./ThemeToggle";

function DocumentPicker() {
  return (
    <select
      class="btn"
      aria-label="Active document"
      value={activeDocumentId.value}
      onChange={(event) => {
        closeEditor();
        setActiveDocument((event.target as HTMLSelectElement).value);
      }}
    >
      {DOCUMENTS.map((doc) => (
        <option value={doc.id} key={doc.id}>
          {doc.title}
        </option>
      ))}
    </select>
  );
}

function PlanPicker() {
  return (
    <select
      class="btn"
      aria-label="Active plan"
      value={activePlanId.value}
      onChange={(event) => {
        closeEditor();
        setActivePlan((event.target as HTMLSelectElement).value);
      }}
    >
      {Object.values(plans.value).map((plan) => (
        <option value={plan.id} key={plan.id}>
          {plan.label}
        </option>
      ))}
    </select>
  );
}

export function AppHeader() {
  const onPlansView = view.value === "plans";
  const onExecuteView = view.value === "execute" || view.value === "print";

  function openExecute() {
    closeEditor();
    startExecuteFlow();
    view.value = "execute";
  }

  return (
    <header class="app-header">
      <div class="header-brand">
        {onPlansView ? null : (
          <a
            class="back-link"
            href={serializeRoute("plans", activeDocumentId.value)}
            onClick={closeEditor}
          >
            <span aria-hidden="true">&lsaquo;</span>Plans
          </a>
        )}
        <strong class="app-title">WA Estate Docs</strong>
      </div>
      <div class="header-controls">
        {onPlansView ? null : (
          <>
            <PlanPicker />
            <DocumentPicker />
            <button
              type="button"
              class="btn"
              aria-pressed={onExecuteView}
              onClick={openExecute}
            >
              Execute
            </button>
            <PresentationToggle />
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
