import { DOCUMENTS } from "../documents/registry";
import { activeDocumentId, setActiveDocument } from "../store/index";
import { closeEditor } from "../ui/editing";
import { startExecuteFlow } from "../ui/execute";
import { view } from "../ui/view";
import { PresentationToggle } from "./PresentationToggle";
import { ThemeToggle } from "./ThemeToggle";

// A single document reduces to today's fixed title — the picker only earns
// its place once a second document exists.
function DocumentPicker() {
  if (DOCUMENTS.length < 2) return null;
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

export function AppHeader() {
  const onPlansView = view.value === "plans";
  const onExecuteView = view.value === "execute" || view.value === "print";

  function toggleView() {
    closeEditor();
    view.value = onPlansView ? "document" : "plans";
  }

  function openExecute() {
    closeEditor();
    startExecuteFlow();
    view.value = "execute";
  }

  return (
    <header class="app-header">
      <div class="header-brand">
        <strong class="app-title">Estate Document Templates</strong>
      </div>
      <div class="header-controls">
        <DocumentPicker />
        <button
          type="button"
          class="btn"
          aria-pressed={onExecuteView}
          onClick={openExecute}
        >
          Execute
        </button>
        <button
          type="button"
          class="btn"
          aria-pressed={onPlansView}
          onClick={toggleView}
        >
          {onPlansView ? "Document" : "Plans"}
        </button>
        <PresentationToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
