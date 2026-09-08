// Renders each Phase 1 golden case with `preact-render-to-string`, parses
// both the render and the committed `test/golden/<slug>.html` with
// linkedom, and compares whitespace-collapsed `textContent` plus the
// flattened [tag, className, text] sequence — never the raw HTML, since
// whitespace differs between template literals and JSX by construction.
// Does not re-run `scripts/capture-goldens.mjs`; reads the committed
// goldens as frozen truth.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { h } from "preact";
import { render } from "preact-render-to-string";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import { HighlightContext, PlanContext } from "../shared/PlanContext";
import { Body } from "./Body";
import { GOLDEN_CASES, buildV2Profile } from "./goldenFixtures";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN_DIR = path.resolve(__dirname, "../../../test/golden");

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Block-level elements always create a visual gap in a rendered document,
// whether or not the source markup happened to place a literal whitespace
// character at that exact tag boundary — template literals (`js/templates/
// will.js`) and JSX disagree on the latter by construction. Inline elements
// (`strong`, `mark`, `span`, ...) never do, so their adjacency is left
// exactly as authored — e.g. `<strong>Name</strong>, Testator` must stay
// glued with no inserted space.
const BLOCK_TAGS = new Set([
  "div",
  "p",
  "h1",
  "h2",
  "h3",
  "ol",
  "ul",
  "li",
  "details",
  "summary",
  "blockquote",
]);

function extractText(node: Node): string {
  if (node.nodeType !== 1 /* ELEMENT_NODE */) return node.textContent || "";
  const el = node as Element;
  const inner = Array.from(el.childNodes)
    .map((child) => extractText(child))
    .join("");
  return BLOCK_TAGS.has(el.tagName.toLowerCase()) ? ` ${inner} ` : inner;
}

function flatten(root: Element): [string, string, string][] {
  const result: [string, string, string][] = [];
  function walk(node: Element) {
    result.push([
      node.tagName.toLowerCase(),
      node.getAttribute("class") || "",
      collapse(extractText(node)),
    ]);
    for (const child of Array.from(node.children)) {
      walk(child as Element);
    }
  }
  for (const child of Array.from(root.children)) {
    walk(child as Element);
  }
  return result;
}

async function loadGolden(slug: string): Promise<string> {
  return readFile(path.join(GOLDEN_DIR, `${slug}.html`), "utf8");
}

describe("will Body golden gate", () => {
  for (const testCase of GOLDEN_CASES) {
    it(`matches test/golden/${testCase.slug}.html`, async () => {
      const v2Profile = buildV2Profile(testCase.slug, testCase.overlay);
      const migrated = migrateProfile("profile-1", v2Profile);
      expect(migrated.success).toBe(true);
      if (!migrated.success) return;

      const highlightVariables = testCase.highlights ?? true;
      const rendered = render(
        h(
          PlanContext.Provider,
          { value: migrated.plan },
          h(
            HighlightContext.Provider,
            { value: highlightVariables },
            h(Body, {})
          )
        )
      );

      const goldenHtml = await loadGolden(testCase.slug);
      const { document: goldenDoc } = parseHTML(
        `<html><body>${goldenHtml}</body></html>`
      );
      const { document: renderedDoc } = parseHTML(
        `<html><body>${rendered}</body></html>`
      );

      const goldenText = collapse(extractText(goldenDoc.body));
      const renderedText = collapse(extractText(renderedDoc.body));
      expect(renderedText).toBe(goldenText);

      const goldenFlat = flatten(goldenDoc.body);
      const renderedFlat = flatten(renderedDoc.body);
      expect(renderedFlat).toEqual(goldenFlat);
    });
  }
});
