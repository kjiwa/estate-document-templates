import { h } from "preact";
import { render } from "preact-render-to-string";

import type { DocumentDefinition } from "../documents/registry";
import { HighlightContext, PlanContext } from "../documents/shared/PlanContext";
import type { Plan } from "../model/plan";
import {
  escapeCssString,
  namedPageRules,
  printDocLabel,
  printInitialsLabel,
  printPageName,
} from "../ui/printLabels";

// `?inline` returns processed CSS as a string without injecting it — see
// https://vite.dev/guide/features.html — replacing `js/export.js`'s runtime
// `fetch("css/…")`. tokens.css carries no `url()`, so it is safe to inline
// here; fonts.css (which does) is deliberately not included.
import tokensCss from "../styles/tokens.css?inline";
import documentContentCss from "../styles/document-content.css?inline";
import documentPaperCss from "../styles/document-paper.css?inline";
import printCss from "../styles/print.css?inline";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPrintDocLabel(plan: Plan, document: DocumentDefinition): string {
  return `:root {
  --print-doc-label: "${escapeCssString(printDocLabel(plan, document))}";
  --print-initials-label: "${escapeCssString(printInitialsLabel(document))}";
}`;
}

// Minimal screen-only chrome for the standalone file: the sheet itself is
// fully styled by document.css, but a bare white page on a white background
// with no margin reads as broken, so a couple of presentation rules are
// generated here rather than fetched — they belong to the export, not to
// the app shell.
const GENERATED_SCREEN_STYLES = `
body {
  font-family: var(--font-paper);
  background-color: var(--surface-0);
  padding: var(--space-8) var(--space-4);
}
.paged-sheet {
  margin: 0 auto;
}
.paged-sheet + .paged-sheet {
  margin-top: var(--space-8);
}
`;

function renderBody(plan: Plan, document: DocumentDefinition): string {
  return render(
    h(
      PlanContext.Provider,
      { value: plan },
      h(HighlightContext.Provider, { value: false }, h(document.Body, {}))
    )
  );
}

function renderSheet(
  plan: Plan,
  document: DocumentDefinition,
  attributes = ""
): string {
  return `<article class="paged-sheet"${attributes}>
    ${renderBody(plan, document)}
  </article>`;
}

function assemblePage(title: string, pageCss: string, sheets: string): string {
  const css = [tokensCss, documentContentCss, documentPaperCss, printCss].join(
    "\n\n"
  );
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${css}
${pageCss}
${GENERATED_SCREEN_STYLES}
  </style>
</head>
<body>
  ${sheets}
</body>
</html>`;
}

export function generateStandaloneHtml(
  plan: Plan,
  document: DocumentDefinition
): string {
  // Escaped, unlike `js/export.js`'s unescaped `<title>` interpolation.
  const title = `${document.title} - ${escapeHtml(plan.party.testator.name || "Document")}`;
  return assemblePage(
    title,
    buildPrintDocLabel(plan, document),
    renderSheet(plan, document)
  );
}

export function generateStandaloneBundle(
  plan: Plan,
  documents: readonly DocumentDefinition[]
): string {
  const title = `All documents - ${escapeHtml(plan.party.testator.name || "Plan")}`;
  const sheets = documents
    .map((document) =>
      renderSheet(plan, document, ` style="page: ${printPageName(document)}"`)
    )
    .join("\n  ");
  return assemblePage(title, namedPageRules(plan, documents), sheets);
}
