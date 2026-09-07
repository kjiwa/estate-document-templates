// Phase 2 screenshot sweep: every mockup x {393x852, 1280x900} x {light, dark}.
// Fails the run on any console error/warning or any non-file:// request —
// the runtime proof that standing invariant 6 (no third-party network
// requests, fonts self-hosted) already holds for the design layer.
import { chromium } from "@playwright/test";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const mockupsDir = join(here, "mockups");
const shotsDir = join(here, "screenshots");
mkdirSync(shotsDir, { recursive: true });

const files = readdirSync(mockupsDir)
  .filter((f) => f.endsWith(".html"))
  .sort();

const viewports = [
  { label: "393", width: 393, height: 852 },
  { label: "1280", width: 1280, height: 900 },
];
const themes = ["light", "dark"];

let failed = false;
const shots = [];

const browser = await chromium.launch();

for (const file of files) {
  const slug = file.replace(/\.html$/, "");
  for (const viewport of viewports) {
    for (const theme of themes) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });

      const consoleIssues = [];
      const badRequests = [];
      page.on("console", (msg) => {
        if (["error", "warning"].includes(msg.type())) {
          consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      page.on("pageerror", (err) => consoleIssues.push(String(err)));
      page.on("request", (req) => {
        if (!req.url().startsWith("file://")) {
          badRequests.push(req.url());
        }
      });

      const url = `file://${join(mockupsDir, file)}?theme=${theme}`;
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);

      const outName = `${slug}-${viewport.label}-${theme}.png`;
      await page.screenshot({
        path: join(shotsDir, outName),
        fullPage: true,
      });
      shots.push({ slug, viewport: viewport.label, theme, file: outName });

      if (consoleIssues.length) {
        failed = true;
        console.error(`CONSOLE ISSUES: ${file} @${viewport.label} ${theme}`);
        consoleIssues.forEach((m) => console.error("  " + m));
      }
      if (badRequests.length) {
        failed = true;
        console.error(`NON-FILE REQUESTS: ${file} @${viewport.label} ${theme}`);
        badRequests.forEach((u) => console.error("  " + u));
      }

      await page.close();
    }
  }
}

await browser.close();

// Contact sheet for review.
const bySlug = {};
for (const s of shots) {
  (bySlug[s.slug] ??= []).push(s);
}
const contactSheet = `<!doctype html>
<html><head><meta charset="UTF-8"><title>Phase 2 screenshots</title>
<style>
  body { font-family: system-ui, sans-serif; background: #222; color: #eee; margin: 0; padding: 24px; }
  h2 { border-bottom: 1px solid #444; padding-bottom: 4px; }
  .row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
  figure { margin: 0; background: #333; padding: 8px; border-radius: 6px; }
  figure img { display: block; max-width: 300px; max-height: 400px; object-fit: contain; background: #fff; }
  figcaption { font-size: 12px; margin-top: 4px; text-align: center; }
</style></head>
<body>
<h1>Phase 2 mockup screenshots</h1>
${Object.entries(bySlug)
  .map(
    ([slug, list]) =>
      `<h2>${slug}</h2><div class="row">${list
        .map(
          (s) =>
            `<figure><img src="screenshots/${s.file}" loading="lazy"><figcaption>${s.viewport}px / ${s.theme}</figcaption></figure>`
        )
        .join("\n")}</div>`
  )
  .join("\n")}
</body></html>
`;
writeFileSync(join(here, "index.html"), contactSheet);

console.log(`Captured ${shots.length} screenshots.`);
if (failed) {
  console.error("FAILED: console issues or non-file:// requests detected.");
  process.exit(1);
}
