import { DOCUMENTS } from "../documents/registry";
import {
  activeDocumentId,
  activePlan,
  setActiveDocument,
} from "../store/index";
import { closeEditor } from "../ui/editing";
import { startExecuteFlow } from "../ui/execute";
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

function BackArrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

export function AppHeader() {
  const onPlansView = view.value === "plans";
  const onExecuteView = view.value === "execute" || view.value === "print";

  function openPlans() {
    closeEditor();
    view.value = "plans";
  }

  function openExecute() {
    closeEditor();
    startExecuteFlow();
    view.value = "execute";
  }

  return (
    <header class="app-header">
      <div class="header-lead">
        {onPlansView ? (
          <a class="app-title" href="../">
            WA Estate Docs
          </a>
        ) : (
          <a
            class="btn back-link"
            href="#/plans"
            onClick={(event) => {
              event.preventDefault();
              openPlans();
            }}
          >
            <BackArrow />
            Plans
          </a>
        )}
      </div>
      {onPlansView ? null : (
        <>
          <span class="plan-name" title={activePlan.value?.label}>
            {activePlan.value?.label}
          </span>
          <DocumentPicker />
          <div class="header-controls">
            <PresentationToggle />
            <button
              type="button"
              class="btn"
              aria-current={onExecuteView ? "page" : undefined}
              onClick={openExecute}
            >
              Signing day
            </button>
            <ThemeToggle />
          </div>
        </>
      )}
      {onPlansView ? (
        <div class="header-controls">
          <ThemeToggle />
        </div>
      ) : null}
    </header>
  );
}
