import { closeEditor } from "../ui/editing";
import { view } from "../ui/view";
import { PresentationToggle } from "./PresentationToggle";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  const onPlansView = view.value === "plans";

  function toggleView() {
    closeEditor();
    view.value = onPlansView ? "document" : "plans";
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
