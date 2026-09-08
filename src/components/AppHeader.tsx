import { PresentationToggle } from "./PresentationToggle";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header class="app-header">
      <div class="header-brand">
        <strong class="app-title">Estate Document Templates</strong>
      </div>
      <div class="header-controls">
        <PresentationToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
