import { closeEditor } from "../ui/editing";
import { startExecuteFlow } from "../ui/execute";
import { view } from "../ui/view";
import { PresentationToggle } from "./PresentationToggle";
import { ThemeToggle } from "./ThemeToggle";

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
