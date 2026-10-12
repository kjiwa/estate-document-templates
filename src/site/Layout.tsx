import type { ComponentChildren } from "preact";

export const REPOSITORY_URL =
  "https://github.com/kjiwa/estate-document-templates";

export function Layout({
  root,
  children,
}: {
  root: string;
  children: ComponentChildren;
}) {
  return (
    <>
      <header class="site-header">
        <a class="site-brand" href={root}>
          WA Estate Docs
        </a>
        <nav class="site-nav" aria-label="Site">
          <a href={`${root}documents/`}>Documents</a>
          <a href={`${root}about/`}>About</a>
        </nav>
        <a class="btn btn-primary site-cta" href={`${root}app/`}>
          Open the app
        </a>
      </header>
      <main class="site-main">{children}</main>
      <footer class="site-footer">
        <span>Drafting aid, not legal advice. Provided as is.</span>
        <a href={`${root}terms/`}>Terms</a>
        <a href={`${root}privacy/`}>Privacy</a>
        <a href={REPOSITORY_URL}>Source on GitHub</a>
      </footer>
    </>
  );
}
