// @ts-check
const { test, expect } = require("@playwright/test");
const { acceptTerms } = require("./fixtures");

async function sitePaths(request) {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>https:\/\/[^/]+\/([^<]*)<\/loc>/g)].map(
    (match) => match[1]
  );
}

test.describe("Content site", () => {
  test("sitemap lists every page, and robots.txt points at it", async ({
    request,
  }) => {
    const paths = await sitePaths(request);
    expect(paths).toContain("");
    expect(paths).toContain("documents/");
    expect(paths).toContain("documents/will/");
    expect(paths).toContain("terms/");
    expect(paths).toContain("privacy/");
    expect(paths).toContain("about/");
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.some((p) => p.startsWith("app"))).toBe(false);

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Sitemap: https:\/\/[^/]+\/sitemap\.xml/);
    expect(robots).not.toMatch(/Disallow:\s*\S/);
  });

  test("every page has one h1, a unique title, a canonical, noindex, no console errors, and no overflow", async ({
    page,
    request,
  }) => {
    const paths = await sitePaths(request);
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const titles = [];
    for (const path of paths) {
      const response = await page.goto(`/${path}`);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1"), path).toHaveCount(1);
      await expect(page.locator("main"), path).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute(
        "href",
        new RegExp(`/${path}$`)
      );
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute(
        "content",
        /noindex/
      );
      titles.push(await page.title());
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow, `${path} horizontal overflow`).toBeLessThanOrEqual(0);
    }
    expect(titles.every(Boolean)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
    expect(consoleErrors).toEqual([]);
  });

  test("every internal link resolves", async ({ page, request }) => {
    const paths = await sitePaths(request);
    const targets = new Set();
    for (const path of paths) {
      await page.goto(`/${path}`);
      const hrefs = await page
        .locator("a[href]")
        .evaluateAll((anchors) =>
          anchors.map((a) => /** @type {HTMLAnchorElement} */ (a).href)
        );
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin !== new URL(page.url()).origin) continue;
        targets.add(url.pathname);
      }
    }
    expect(targets.size).toBeGreaterThan(0);
    for (const target of targets) {
      const response = await request.get(target);
      expect(response.status(), target).toBe(200);
    }
  });

  test("Start this document opens that document in the app", async ({
    page,
  }) => {
    await acceptTerms(page);
    await page.goto("/documents/will/");
    await page.getByRole("link", { name: "Start this document" }).click();
    await expect(page).toHaveURL(/\/app\/#\/document\/will$/);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator(".back-link")).toBeVisible();
  });

  test("legacy root hash links land in the app", async ({ page }) => {
    await acceptTerms(page);
    await page.goto("/#/document/will");
    await expect(page).toHaveURL(/\/app\/#\/document\/will$/);
  });

  test("theme select on a site page persists into the app", async ({
    page,
  }) => {
    await acceptTerms(page);
    await page.goto("/about/");
    const select = page.locator("footer").getByLabel("Theme");
    await expect(select).toBeVisible();
    await select.selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.goto("/app/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("footer").getByLabel("Theme")).toHaveValue(
      "dark"
    );
  });
});
