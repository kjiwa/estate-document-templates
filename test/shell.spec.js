// @ts-check
const { test, expect } = require("@playwright/test");
const { acceptDisclaimer } = require("./fixtures");

test.describe("Application Shell, Layout & Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await acceptDisclaimer(page);
  });

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

  test("system theme follows the emulated color scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page
      .locator('[aria-label="Theme"] button:has-text("System")')
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(20, 19, 17)"
    );

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
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

  test("below 900px the rail collapses into a progress summary", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");

    const summary = page.locator(".rail-details > summary");
    await expect(summary).toHaveText(
      /^\d+ \/ \d+ required fields, (In progress|Ready to sign|Ready to print)$/
    );
    await expect(page.locator(".app-rail")).toBeHidden();

    await summary.click();
    await expect(page.locator(".app-rail")).toBeVisible();
  });

  test("first run has one plan labelled My plan", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel("Active plan").locator("option")).toHaveText([
      "My plan",
    ]);
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

test.describe("Disclaimer", () => {
  test("first visit blocks the app until accepted; Escape does nothing", async ({
    page,
  }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog", {
      name: "Before you use this tool",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close" })).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();

    await dialog
      .getByRole("button", { name: "I understand and accept" })
      .click();
    await expect(dialog).toHaveCount(0);
  });

  test("acceptance persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "I understand and accept" }).click();
    await page.reload();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("footer reopens the disclaimer with Close and Escape", async ({
    page,
  }) => {
    await acceptDisclaimer(page);
    await page.goto("/");
    const footer = page.locator("footer.app-footer");
    await expect(footer).toContainText("Drafting aid, not legal advice");

    await footer.getByRole("button", { name: "Disclaimer" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.locator(".app-header")).toHaveJSProperty("inert", true);
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator(".app-header")).toHaveJSProperty("inert", false);
    await expect(
      footer.getByRole("button", { name: "Disclaimer" })
    ).toBeFocused();

    await footer.getByRole("button", { name: "Disclaimer" }).click();
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("at 393px the dialog fits the viewport and its body scrolls", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 480 });
    await page.goto("/");
    const box = await page.locator(".disclaimer-dialog").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(393);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(480);
    await expect(
      page.getByRole("button", { name: "I understand and accept" })
    ).toBeInViewport();
  });

  test("footer does not overlap the app body at desktop width", async ({
    page,
  }) => {
    await acceptDisclaimer(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const body = await page.locator(".app-body").boundingBox();
    const footer = await page.locator(".app-footer").boundingBox();
    expect(footer.y).toBeGreaterThanOrEqual(body.y + body.height - 1);
    expect(footer.y + footer.height).toBeLessThanOrEqual(900);
  });
});
