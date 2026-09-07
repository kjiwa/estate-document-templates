import { h } from "preact";
import { render } from "preact-render-to-string";

import { Body } from "../documents/will/Body";
import { HighlightContext, PlanContext } from "../documents/shared/PlanContext";
import type { Plan } from "../model/plan";

// `?inline` returns processed CSS as a string without injecting it — see
// https://vite.dev/guide/features.html — replacing `js/export.js`'s runtime
// `fetch("css/…")`.
import tokensCss from "../../css/tokens.css?inline";
import documentCss from "../../css/document.css?inline";
import printCss from "../../css/print.css?inline";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeCssString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildPrintDocLabel(plan: Plan): string {
  const name = plan.party.testator.name || "";
  const label = `Last Will and Testament — ${name}`;
  return `:root { --print-doc-label: "${escapeCssString(label)}"; }`;
}

// Minimal screen-only chrome for the standalone file: the sheet itself is
// fully styled by document.css, but a bare white page on a white background
// with no margin reads as broken, so a couple of presentation rules are
// generated here rather than fetched — they belong to the export, not to
// the app shell.
const GENERATED_SCREEN_STYLES = `
body {
  font-family: var(--font-serif);
  background-color: var(--color-bg-app);
  padding: var(--space-8) var(--space-4);
}
.paged-sheet {
  margin: 0 auto;
}
`;

export function generateStandaloneHtml(plan: Plan): string {
  const renderedBody = render(
    h(
      PlanContext.Provider,
      { value: plan },
      h(HighlightContext.Provider, { value: false }, h(Body, {}))
    )
  );
  // Escaped, unlike `js/export.js`'s unescaped `<title>` interpolation.
  const title = `Last Will and Testament - ${escapeHtml(plan.party.testator.name || "Document")}`;
  const css = [tokensCss, documentCss, printCss].join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${css}
${buildPrintDocLabel(plan)}
${GENERATED_SCREEN_STYLES}
  </style>
</head>
<body>
  <article class="paged-sheet">
    ${renderedBody}
  </article>
</body>
</html>`;
}
