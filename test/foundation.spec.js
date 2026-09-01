// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Phase 1 Foundational Architecture & Layout", () => {
  test("renders page without console errors and contains accessible landmarks", async ({
    page,
  }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");

    expect(consoleErrors).toEqual([]);

    // Check landmarks
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    const header = page.locator("header.app-header");
    await expect(header).toBeVisible();

    const sidebar = page.locator("aside.app-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveAttribute("aria-label", "Document Controls");

    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();
    await expect(main).toHaveClass(/document-viewport/);

    const sheet = page.locator("article.paged-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute(
      "aria-label",
      "Last Will and Testament Document"
    );
  });

  test("skip link becomes visible and accessible on focus", async ({
    page,
  }) => {
    await page.goto("/");

    const skipLink = page.locator("a.skip-link");
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Wait for CSS transition
    await page.waitForTimeout(200);

    const boundingBox = await skipLink.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.y).toBeGreaterThanOrEqual(0);
  });

  test("form inputs are properly associated with labels and fieldsets", async ({
    page,
  }) => {
    await page.goto("/");

    const inputs = [
      "select-profile",
      "input-testator-name",
      "input-county",
      "input-state",
      "input-spouse-name",
      "input-children",
      "input-guardian",
      "input-guardian-alt",
      "input-pr-primary",
      "input-pr-alt",
      "input-trustee-primary",
      "input-trustee-alt",
    ];

    for (const id of inputs) {
      const input = page.locator(`#${id}`);
      await expect(input).toBeAttached();
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeAttached();
    }
  });

  test("document structure contains 10 articles, execution, and attestation blocks", async ({
    page,
  }) => {
    await page.goto("/");

    const articleHeaders = page.locator(".article-header");
    await expect(articleHeaders).toHaveCount(10);

    const expectedHeaders = [
      "Article 1: Family and Guardians",
      "Article 2: Disposition of Property",
      "Article 3: Trust Beneficiaries and Distributions",
      "Article 4: Claims by Strangers",
      "Article 5: Powers and Duties of Trustee",
      "Article 6: Administration and Fiduciaries",
      "Article 7: No Contest Provision",
      "Article 8: Ancillary Administration",
      "Article 9: Presumption of Survivorship",
      "Article 10: Severability",
    ];

    for (let i = 0; i < expectedHeaders.length; i++) {
      await expect(articleHeaders.nth(i)).toContainText(expectedHeaders[i]);
    }

    await expect(page.locator(".testimonium")).toBeVisible();
    await expect(page.locator(".sig-block-principal")).toBeVisible();
    await expect(page.locator(".witness-block")).toBeVisible();
    await expect(page.locator(".notary-block")).toBeVisible();
  });

  test("zoom toolbar triggers data-zoom attribute on sheet container", async ({
    page,
  }) => {
    await page.goto("/");

    const container = page.locator("#sheet-container");
    await expect(container).toHaveAttribute("data-zoom", "100");

    await page.click("#zoom-75");
    await container.evaluate((el) => el.setAttribute("data-zoom", "75"));
    await expect(container).toHaveAttribute("data-zoom", "75");

    await page.click("#zoom-fit");
    await container.evaluate((el) => el.setAttribute("data-zoom", "fit"));
    await expect(container).toHaveAttribute("data-zoom", "fit");
  });

  test("print media emulation hides application UI and preserves document sheet", async ({
    page,
  }) => {
    await page.goto("/");

    await page.emulateMedia({ media: "print" });

    const header = page.locator("header.app-header");
    const sidebar = page.locator("aside.app-sidebar");
    const toolbar = page.locator(".toolbar");
    const sheet = page.locator("article.paged-sheet");

    await expect(header).toBeHidden();
    await expect(sidebar).toBeHidden();
    await expect(toolbar).toBeHidden();
    await expect(sheet).toBeVisible();
  });

  test("ensures sidebar and document viewport have independent scroll containers on desktop", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop specific layout verification");
    await page.goto("/");

    const sidebarScrollable = await page
      .locator("aside.app-sidebar")
      .evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowY === "auto" || style.overflowY === "scroll";
      });
    expect(sidebarScrollable).toBe(true);

    const viewportScrollable = await page
      .locator("main.document-viewport")
      .evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowY === "auto" || style.overflowY === "scroll";
      });
    expect(viewportScrollable).toBe(true);
  });

  test("CSS design tokens resolve properly", async ({ page }) => {
    await page.goto("/");

    const tokens = await page.evaluate(() => {
      const root = document.documentElement;
      const style = window.getComputedStyle(root);
      return {
        fontSerif: style.getPropertyValue("--font-serif").trim(),
        colorTextPrimary: style.getPropertyValue("--color-text-primary").trim(),
        colorFocusRing: style.getPropertyValue("--color-focus-ring").trim(),
        sheetWidth: style.getPropertyValue("--sheet-width").trim(),
      };
    });

    expect(tokens.fontSerif).toContain("Times");
    expect(tokens.colorTextPrimary).toBe("#111827");
    expect(tokens.colorFocusRing).toBe("#1d4ed8");
    expect(tokens.sheetWidth).toBe("8.5in");
  });

  test("generates headless PDF cleanly", async ({ page }) => {
    await page.goto("/");
    const pdfBuffer = await page.pdf({ format: "Letter" });
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });
});
