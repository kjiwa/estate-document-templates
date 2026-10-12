import type { ComponentChildren } from "preact";

import { Footer } from "../components/Footer";

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
      <Footer
        terms={<a href={`${root}terms/`}>Terms</a>}
        privacy={<a href={`${root}privacy/`}>Privacy</a>}
        themeHidden
      />
    </>
  );
}
