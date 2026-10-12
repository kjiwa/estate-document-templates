import type { ComponentChildren } from "preact";

import { REPOSITORY_URL } from "../repository";
import { ThemeToggle } from "./ThemeToggle";

export function Footer({
  terms,
  privacy,
  themeHidden = false,
}: {
  terms: ComponentChildren;
  privacy: ComponentChildren;
  themeHidden?: boolean;
}) {
  return (
    <footer class="footer">
      <span class="footer-disclaimer">
        Drafting aid, not legal advice. Provided as is.
      </span>
      <nav class="footer-links" aria-label="Footer">
        {terms}
        {privacy}
        <a href={REPOSITORY_URL}>Source on GitHub</a>
      </nav>
      <ThemeToggle hidden={themeHidden} />
    </footer>
  );
}
