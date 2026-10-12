// @ts-check
const { test, expect } = require("@playwright/test");
const { acceptTerms } = require("./fixtures");

test.describe("Application Shell, Layout & Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await acceptTerms(page);
  });

  test("renders page without console errors and contains accessible landmarks", async ({
    page,
  }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/#/document");

    expect(consoleErrors).toEqual([]);

    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Footer" });
    await expect(nav).toBeAttached();

    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();
  });

  test("skip link becomes visible and accessible on focus", async ({
    page,
  }) => {
    await page.goto("/app/#/document");

    const skipLink = page.locator("a.skip-link");
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    await page.waitForTimeout(200);

    const boundingBox = await skipLink.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.y).toBeGreaterThanOrEqual(0);
  });

  test("theme select sets data-theme", async ({ page }) => {
    await page.goto("/app/#/document");

    const select = page.getByLabel("Theme");
    await select.selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await select.selectOption("light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(select).toHaveValue("light");
  });

  test("system theme follows the emulated color scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/app/#/document");
    await page.getByLabel("Theme").selectOption("system");
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
    await page.goto("/app/#/document");

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
    await page.goto("/app/#/document");

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
    await page.goto("/app/#/document");

    const summary = page.locator(".rail-details > summary");
    await expect(summary).toHaveText(
      /^Sections, \d+ of \d+ required fields, (In progress|Ready to sign|Ready to print)$/
    );
    await expect(page.locator(".app-rail")).toBeHidden();

    await summary.click();
    await expect(page.locator(".app-rail")).toBeVisible();
  });

  test("first run has one plan labelled My plan", async ({ page }) => {
    await page.goto("/app/#/document");

    await expect(page.locator(".plan-name")).toHaveText("My plan");
  });

  test("rail scrolls itself while the window scrolls the document at 1280px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/#/document");

    const railScrollable = await page.locator(".app-rail").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.overflowY === "auto" || style.overflowY === "scroll";
    });
    expect(railScrollable).toBe(true);

    const surfaceOverflow = await page
      .locator("main.doc-surface")
      .evaluate((el) => window.getComputedStyle(el).overflowY);
    expect(surfaceOverflow).toBe("visible");

    const doc = await page.evaluate(() => ({
      scrollable:
        document.documentElement.scrollHeight >
        document.documentElement.clientHeight,
    }));
    expect(doc.scrollable).toBe(true);

    await page.evaluate(() => window.scrollTo(0, 400));
    const header = await page
      .locator(".app-header")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(header).toBe(0);
    const railTop = await page
      .locator(".app-rail")
      .evaluate((el) => el.getBoundingClientRect().top);
    const headerBottom = await page
      .locator(".app-header")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(Math.abs(railTop - headerBottom)).toBeLessThanOrEqual(1);
  });

  test("footer sits below the fold on a document view at 1280px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/#/document");
    const top = await page
      .locator(".footer")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(900);
  });

  test("CSS design tokens resolve properly", async ({ page }) => {
    await page.goto("/app/#/document");

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
    await page.goto("/app/#/document");

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
    await page.goto("/app/#/document");

    await page
      .locator('[aria-label="Presentation"] button:has-text("Paper")')
      .click();

    const overflowsX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflowsX).toBe(false);
  });
});

test.describe("Terms", () => {
  test("first visit blocks the app until accepted; Escape does nothing", async ({
    page,
  }) => {
    await page.goto("/app/#/document");
    const dialog = page.getByRole("dialog", {
      name: "Terms of use",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close" })).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      await expect(dialog.locator(":focus")).toHaveCount(1);
    }

    await dialog
      .getByRole("button", { name: "I understand and accept" })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => document.activeElement.tagName))
      .not.toBe("BODY");
  });

  test("acceptance persists across reload", async ({ page }) => {
    await page.goto("/app/#/document");
    await page.getByRole("button", { name: "I understand and accept" }).click();
    await page.reload();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("footer links open the site pages and Back returns to the app", async ({
    page,
  }) => {
    await acceptTerms(page);
    await page.goto("/app/#/document");
    const footer = page.locator("footer.footer");
    await expect(footer).toContainText("Drafting aid, not legal advice");
    await expect(
      footer.getByRole("link", { name: "Source on GitHub" })
    ).toHaveAttribute("href", /github\.com\/kjiwa\/estate-document-templates$/);
    await expect(footer.getByLabel("Theme")).toBeVisible();

    for (const [name, heading] of [
      ["Terms", "Terms of use"],
      ["Privacy", "Privacy"],
    ]) {
      await footer.getByRole("link", { name }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: heading })
      ).toBeVisible();
      await page.goBack();
      await expect(page.locator("#document-sheet")).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });

  test("an older accepted version asks again", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("estate_templates_terms", "2000-01-01");
    });
    await page.goto("/app/#/document");
    await expect(
      page.getByRole("dialog", { name: "Terms of use" })
    ).toBeVisible();
  });

  test("at 393px the dialog fits the viewport and its body scrolls", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 480 });
    await page.goto("/app/#/document");
    const box = await page.locator(".terms-dialog").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(393);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(480);
    await expect(
      page.getByRole("button", { name: "I understand and accept" })
    ).toBeInViewport();
  });

  test("footer follows the app body at desktop width", async ({ page }) => {
    await acceptTerms(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/#/document");
    const body = await page.locator(".app-body").boundingBox();
    const footer = await page.locator(".footer").boundingBox();
    expect(footer.y).toBeGreaterThanOrEqual(body.y + body.height - 1);
  });
  test("hash routing: reload stays on Plans and Back leaves execute", async ({
    page,
  }) => {
    await acceptTerms(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/#/plans");
    await expect(page.locator(".plans-view")).toBeVisible();
    await page.reload();
    await expect(page.locator(".plans-view")).toBeVisible();

    await page.goto("/app/#/document/will");
    await expect(page.locator("#document-sheet")).toBeVisible();
    await page.getByRole("button", { name: "Signing day" }).click();
    await expect(page.locator(".execute-flow")).toBeVisible();
    await expect(page).toHaveURL(/#\/execute\/will$/);
    await page.goBack();
    await expect(page.locator(".execute-flow")).toBeHidden();
    await expect(page.locator("#document-sheet")).toBeVisible();
  });

  test("a bare visit opens Plans with only the brand", async ({ page }) => {
    await acceptTerms(page);
    await page.goto("/app/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Plans" })
    ).toBeVisible();
    await expect(page.locator(".app-title")).toHaveText("WA Estate Docs");
    await expect(page.locator(".app-title")).toHaveAttribute("href", "../");
    await expect(page.locator(".back-link")).toBeHidden();
    await expect(page.getByLabel("Active plan")).toBeHidden();
    await expect(page.getByLabel("Active document")).toBeHidden();
  });

  test("the back link returns to Plans and Back returns to the document", async ({
    page,
  }) => {
    await acceptTerms(page);
    await page.goto("/app/#/document/will");
    await page.getByRole("link", { name: "Plans", exact: true }).click();
    await expect(page.locator(".plans-view")).toBeVisible();
    await expect(page).toHaveURL(/#\/plans\/will$/);
    await page.goBack();
    await expect(page.locator("#document-sheet")).toBeVisible();
  });
});
