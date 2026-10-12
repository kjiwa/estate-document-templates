import { REPOSITORY_URL } from "../repository";
import { ThemeToggle } from "./ThemeToggle";

export function Footer({
  root,
  themeHidden = false,
}: {
  root: string;
  themeHidden?: boolean;
}) {
  return (
    <footer class="footer">
      <span class="footer-disclaimer">
        Drafting aid, not legal advice. Provided as is.
      </span>
      <nav class="footer-links" aria-label="Footer">
        <a href={`${root}terms/`}>Terms</a>
        <a href={`${root}privacy/`}>Privacy</a>
        <a href={REPOSITORY_URL}>Source on GitHub</a>
      </nav>
      <ThemeToggle hidden={themeHidden} />
    </footer>
  );
}
