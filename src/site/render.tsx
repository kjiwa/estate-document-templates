import { renderToString } from "preact-render-to-string";

import { Layout } from "./Layout";
import type { SitePage } from "./pages";

export const SITE_ORIGIN = "https://waestatedocs.com";
const SITE_NAME = "WA Estate Docs";

export function rootPrefix(path: string): string {
  const depth = path.split("/").filter(Boolean).length;
  return depth === 0 ? "./" : "../".repeat(depth);
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function breadcrumbJsonLd(page: SitePage): string {
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_ORIGIN}/${crumb.path}`,
    })),
  });
  return `<script type="application/ld+json">${json.replace(/</g, "\\u003c")}</script>`;
}

function renderHead(page: SitePage): string {
  const title = page.path === "" ? page.title : `${page.title} | ${SITE_NAME}`;
  const url = `${SITE_ORIGIN}/${page.path}`;
  const lines = [
    `<title>${escapeText(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
  ];
  if (page.breadcrumbs.length > 0) lines.push(breadcrumbJsonLd(page));
  return lines.join("\n    ");
}

export function renderPage(page: SitePage): { head: string; body: string } {
  const root = rootPrefix(page.path);
  return {
    head: renderHead(page),
    body: renderToString(
      <Layout root={root}>
        <page.Body root={root} />
      </Layout>
    ),
  };
}
