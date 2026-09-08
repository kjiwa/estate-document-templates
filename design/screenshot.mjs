// Phase 2 screenshot sweep: each mockup at only the viewports it actually
// claims (see VIEWPORTS_BY_SLUG), both themes. Fails the run on any console
// error/warning, any non-file:// request — the runtime proof that standing
// invariant 6 (no third-party network requests, fonts self-hosted) already
// holds for the design layer — or any horizontal overflow, since `fullPage`
// would otherwise silently widen the shot instead of reporting it.
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

const VIEWPORTS = {
  393: { width: 393, height: 852 },
  1280: { width: 1280, height: 900 },
};

// Every mockup must have an entry — a file with none fails the run rather
// than being silently skipped, so adding a mockup cannot bypass the sweep.
const VIEWPORTS_BY_SLUG = {
  "00-tokens": ["393", "1280"],
  "01-desktop-draft": ["1280"],
  "02-desktop-reading": ["1280"],
  "03-desktop-paper": ["1280"],
  "04-mobile-reading-sheet": ["393"],
  "05-mobile-paper": ["393"],
  "06-signing-day": ["393", "1280"],
  "07-preprint-checklist": ["393", "1280"],
  "08-plan-management": ["393", "1280"],
  "09-review-advisories": ["1280"],
};

const themes = ["light", "dark"];

let failed = false;
const shots = [];

const browser = await chromium.launch();

for (const file of files) {
  const slug = file.replace(/\.html$/, "");
  const viewportLabels = VIEWPORTS_BY_SLUG[slug];
  if (!viewportLabels) {
    failed = true;
    console.error(
      `NO VIEWPORTS DECLARED: ${file} has no entry in VIEWPORTS_BY_SLUG`
    );
    continue;
  }

  for (const label of viewportLabels) {
    const viewport = VIEWPORTS[label];
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

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );

      const outName = `${slug}-${label}-${theme}.png`;
      await page.screenshot({
        path: join(shotsDir, outName),
        fullPage: true,
      });
      shots.push({ slug, viewport: label, theme, file: outName });

      if (consoleIssues.length) {
        failed = true;
        console.error(`CONSOLE ISSUES: ${file} @${label} ${theme}`);
        consoleIssues.forEach((m) => console.error("  " + m));
      }
      if (badRequests.length) {
        failed = true;
        console.error(`NON-FILE REQUESTS: ${file} @${label} ${theme}`);
        badRequests.forEach((u) => console.error("  " + u));
      }
      if (overflow > 0) {
        failed = true;
        console.error(
          `OVERFLOW: ${file} @${label} ${theme} — scrollWidth exceeds viewport by ${overflow}px`
        );
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
