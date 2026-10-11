#!/usr/bin/env node
// Runs after `vite build`: renders every SITE_PAGES entry into the built site
// template (dist/index.html), then writes sitemap.xml and robots.txt.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

async function loadSite() {
  const server = await createServer({
    root: ROOT,
    appType: "custom",
    server: { middlewareMode: true, ws: false },
    logLevel: "error",
  });
  try {
    const { SITE_PAGES } = await server.ssrLoadModule("/src/site/pages.tsx");
    const { renderPage, rootPrefix, SITE_ORIGIN } = await server.ssrLoadModule(
      "/src/site/render.tsx"
    );
    const pages = SITE_PAGES.map((page) => ({
      path: page.path,
      root: rootPrefix(page.path),
      ...renderPage(page),
    }));
    return { pages, origin: SITE_ORIGIN };
  } finally {
    await server.close();
  }
}

function fillTemplate(template, page) {
  return template
    .replaceAll("./assets/", `${page.root}assets/`)
    .replace("<!--site-head-->", () => page.head)
    .replace("<!--site-body-->", () => page.body);
}

function sitemap(pages, origin) {
  const urls = pages
    .map((page) => `  <url><loc>${origin}/${page.path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// No Disallow: a crawler must be able to fetch a page to see its noindex tag.
function robots(origin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

async function writePage(template, page) {
  const directory = path.join(DIST, page.path);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "index.html"),
    fillTemplate(template, page)
  );
}

async function main() {
  const template = await readFile(path.join(DIST, "index.html"), "utf8");
  const { pages, origin } = await loadSite();
  for (const page of pages) await writePage(template, page);
  await writeFile(path.join(DIST, "sitemap.xml"), sitemap(pages, origin));
  await writeFile(path.join(DIST, "robots.txt"), robots(origin));
}

await main();
