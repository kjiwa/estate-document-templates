// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Application Shell, Layout & Accessibility", () => {
  test("renders page without console errors and contains accessible landmarks", async ({
    page,
  }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    expect(consoleErrors).toEqual([]);

    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const nav = page.locator("nav");
    await expect(nav).toBeAttached();

    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();
  });

  test("skip link becomes visible and accessible on focus", async ({
    page,
  }) => {
    await page.goto("/");

    const skipLink = page.locator("a.skip-link");
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    await page.waitForTimeout(200);

    const boundingBox = await skipLink.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.y).toBeGreaterThanOrEqual(0);
  });

  test("theme toggle sets data-theme and aria-pressed", async ({ page }) => {
    await page.goto("/");

    const darkButton = page.locator(
      '[aria-label="Theme"] button:has-text("Dark")'
    );
    await darkButton.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(darkButton).toHaveAttribute("aria-pressed", "true");

    const lightButton = page.locator(
      '[aria-label="Theme"] button:has-text("Light")'
    );
    await lightButton.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(lightButton).toHaveAttribute("aria-pressed", "true");
    await expect(darkButton).toHaveAttribute("aria-pressed", "false");
  });

  test("presentation toggle swaps the document sheet and aria-pressed", async ({
    page,
  }) => {
    await page.goto("/");

    const readingButton = page.locator(
      '[aria-label="Presentation"] button:has-text("Reading")'
    );
    const paperButton = page.locator(
      '[aria-label="Presentation"] button:has-text("Paper")'
    );

    await readingButton.click();
    await expect(page.locator("article.reading-sheet")).toBeVisible();
    await expect(readingButton).toHaveAttribute("aria-pressed", "true");
    await expect(paperButton).toHaveAttribute("aria-pressed", "false");

    await paperButton.click();
    await expect(page.locator("article.paged-sheet")).toBeVisible();
    await expect(paperButton).toHaveAttribute("aria-pressed", "true");
    await expect(readingButton).toHaveAttribute("aria-pressed", "false");
  });

  test("document structure contains 10 articles and execution/attestation blocks", async ({
    page,
  }) => {
    await page.goto("/");

    const articleHeaders = page.locator(".article-header");
    await expect(articleHeaders).toHaveCount(10);

    await expect(page.locator(".testimonium")).toBeVisible();
    await expect(page.locator(".sig-block-principal")).toBeVisible();
    await expect(page.locator(".witness-block")).toBeVisible();
    await expect(page.locator(".notary-block")).toBeVisible();
  });

  test("rail is hidden below 900px", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");

    await expect(page.locator(".app-rail")).toBeHidden();
  });

  test("rail and document surface scroll independently at 1280px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const railScrollable = await page.locator(".app-rail").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.overflowY === "auto" || style.overflowY === "scroll";
    });
    expect(railScrollable).toBe(true);

    const surfaceScrollable = await page
      .locator("main.doc-surface")
      .evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowY === "auto" || style.overflowY === "scroll";
      });
    expect(surfaceScrollable).toBe(true);
  });

  test("CSS design tokens resolve properly", async ({ page }) => {
    await page.goto("/");

    const tokens = await page.evaluate(() => {
      const root = document.documentElement;
      const style = window.getComputedStyle(root);
      return {
        fontPaper: style.getPropertyValue("--font-paper").trim(),
        inkStrong: style.getPropertyValue("--ink-strong").trim(),
        focusRing: style.getPropertyValue("--focus-ring").trim(),
        sheetWidth: style.getPropertyValue("--sheet-width").trim(),
      };
    });

    expect(tokens.fontPaper).toContain("Times");
    expect(tokens.inkStrong).not.toBe("");
    expect(tokens.focusRing).not.toBe("");
    expect(tokens.sheetWidth).toBe("8.5in");
  });

  test("at 393px the sheet stays within the viewport in Reading, no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");

    await page
      .locator('[aria-label="Presentation"] button:has-text("Reading")')
      .click();

    const overflowsX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflowsX).toBe(false);
  });

  test("at 393px the sheet stays within the viewport in Paper, no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");

    await page
      .locator('[aria-label="Presentation"] button:has-text("Paper")')
      .click();

    const overflowsX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflowsX).toBe(false);
  });
});
