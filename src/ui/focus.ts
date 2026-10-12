export function focusMainHeading(): void {
  const heading = document.querySelector<HTMLElement>("#main-content h1");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus();
}
