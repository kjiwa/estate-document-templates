import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { DOCUMENTS } from "../documents/registry";
import { GOLDEN_CASES, buildV2Profile } from "../documents/will/goldenFixtures";
import { migrateProfile } from "../model/migrate";
import { generateStandaloneHtml } from "./standaloneHtml";

const WILL = DOCUMENTS.find((d) => d.id === "will")!;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN_DIR = path.resolve(__dirname, "../../test/golden");

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// See `Body.golden.test.tsx` for why block-level elements need an inserted
// boundary space that plain `.textContent` does not provide.
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

// Structural rather than byte-for-byte: the inlined CSS now arrives through
// Vite's `?inline` instead of three `fetch`es, so the `<style>` contents are
// not compared — only the title and the rendered document body, which
// carries the same golden-gate guarantee `Body.golden.test.tsx` proves.
describe("generateStandaloneHtml", () => {
  const baseline = GOLDEN_CASES.find((c) => c.slug === "03-baseline")!;

  it("matches test/golden/standalone.html structurally", async () => {
    const v2Profile = buildV2Profile(baseline.slug, baseline.overlay);
    const migrated = migrateProfile("profile-1", v2Profile);
    expect(migrated.success).toBe(true);
    if (!migrated.success) return;

    const html = generateStandaloneHtml(migrated.plan, WILL);
    const golden = await readFile(
      path.join(GOLDEN_DIR, "standalone.html"),
      "utf8"
    );

    const { document: renderedDoc } = parseHTML(html);
    const { document: goldenDoc } = parseHTML(golden);

    expect(renderedDoc.title).toBe(goldenDoc.title);

    const renderedArticle = renderedDoc.querySelector("article.paged-sheet");
    const goldenArticle = goldenDoc.querySelector("article.paged-sheet");
    expect(renderedArticle).not.toBeNull();
    expect(goldenArticle).not.toBeNull();
    expect(collapse(extractText(renderedArticle!))).toBe(
      collapse(extractText(goldenArticle!))
    );
  });

  it("inlines CSS with no url() — fonts are never referenced", async () => {
    const v2Profile = buildV2Profile(baseline.slug, baseline.overlay);
    const migrated = migrateProfile("profile-1", v2Profile);
    expect(migrated.success).toBe(true);
    if (!migrated.success) return;

    const html = generateStandaloneHtml(migrated.plan, WILL);
    const styleContents = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
    expect(styleContents).not.toContain("url(");
  });

  it("escapes the testator name in the title", async () => {
    const escapingCase = GOLDEN_CASES.find((c) => c.slug === "18-escaping")!;
    const v2Profile = buildV2Profile(escapingCase.slug, escapingCase.overlay);
    const migrated = migrateProfile("profile-1", v2Profile);
    expect(migrated.success).toBe(true);
    if (!migrated.success) return;

    const html = generateStandaloneHtml(migrated.plan, WILL);
    const titleTag = html.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    expect(titleTag).not.toContain("<script>");
    expect(titleTag).toContain("&lt;script&gt;");
  });
});
