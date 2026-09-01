// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Phase 4 Screen-to-Print Fidelity, Responsive Widths & PDF Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("verifies @page rules and physical print geometry in stylesheet", async ({
    page,
  }) => {
    const pageRuleProps = await page.evaluate(() => {
      let foundPageRule = null;
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule instanceof CSSPageRule) {
              foundPageRule = {
                cssText: rule.cssText,
                selectorText: rule.selectorText,
                style: {
                  size: rule.style.getPropertyValue("size") || "",
                  margin: rule.style.getPropertyValue("margin") || "",
                },
              };
            }
          }
        } catch {
          // Cross-origin stylesheet access handling
        }
      }
      return foundPageRule;
    });

    expect(pageRuleProps).not.toBeNull();
    expect(pageRuleProps.cssText).toContain("letter");
    expect(pageRuleProps.cssText).toContain("0.85in");
    expect(pageRuleProps.cssText).toContain("0.8in");
  });

  test("verifies print media emulation removes app shell, margins, and variable highlights", async ({
    page,
  }) => {
    await page.emulateMedia({ media: "print" });

    // Non-printable elements must be hidden
    await expect(page.locator(".app-header")).toBeHidden();
    await expect(page.locator(".app-sidebar")).toBeHidden();
    await expect(page.locator(".toolbar")).toBeHidden();
    await expect(page.locator(".skip-link")).toBeHidden();

    // Document sheet must remain visible with no box-shadow
    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

    // Check dynamic variable highlights in print media
    const firstMark = sheet.locator("mark.dynamic-var").first();
    const markStyle = await firstMark.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        borderBottomWidth: computed.borderBottomWidth,
        borderBottomStyle: computed.borderBottomStyle,
      };
    });

    expect(
      markStyle.backgroundColor === "rgba(0, 0, 0, 0)" ||
        markStyle.backgroundColor === "transparent",
    ).toBe(true);
    expect(
      markStyle.borderBottomWidth === "0px" ||
        markStyle.borderBottomStyle === "none",
    ).toBe(true);
  });
  test("verifies page-break hardening and orphan/widow properties under print media", async ({
    page,
  }) => {
    await page.emulateMedia({ media: "print" });

    const styles = await page.evaluate(() => {
      const getVal = (selector, prop) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const comp = window.getComputedStyle(el);
        return comp.getPropertyValue(prop);
      };

      return {
        articleHeaderBreakAfter:
          getVal(".article-header", "break-after") ||
          getVal(".article-header", "page-break-after"),
        testimoniumBreakInside:
          getVal(".testimonium", "break-inside") ||
          getVal(".testimonium", "page-break-inside"),
        sigBlockBreakInside:
          getVal(".sig-block-principal", "break-inside") ||
          getVal(".sig-block-principal", "page-break-inside"),
        witnessBlockBreakInside:
          getVal(".witness-block", "break-inside") ||
          getVal(".witness-block", "page-break-inside"),
        notaryBlockBreakInside:
          getVal(".notary-block", "break-inside") ||
          getVal(".notary-block", "page-break-inside"),
        paragraphOrphans: getVal(".doc-preamble", "orphans"),
        paragraphWidows: getVal(".doc-preamble", "widows"),
      };
    });

    expect(styles.articleHeaderBreakAfter).toBe("avoid");
    expect(styles.testimoniumBreakInside).toBe("avoid");
    expect(styles.sigBlockBreakInside).toBe("avoid");
    expect(styles.witnessBlockBreakInside).toBe("avoid");
    expect(styles.notaryBlockBreakInside).toBe("avoid");
    expect(styles.paragraphOrphans).toBe("3");
    expect(styles.paragraphWidows).toBe("3");
  });

  test("generates valid headless PDF for Avery Q. Ramos profile", async ({
    page,
  }) => {
    const pdfBuffer = await page.pdf({
      format: "Letter",
      margin: {
        top: "0.85in",
        bottom: "0.85in",
        left: "0.8in",
        right: "0.8in",
      },
      printBackground: true,
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(5000);
    expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("generates valid headless PDF for Morgan T. Ramos profile after inversion", async ({
    page,
  }) => {
    await page.selectOption("#select-profile", "profile-2");
    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText(
      "Morgan T. Ramos",
    );

    const pdfBuffer = await page.pdf({
      format: "Letter",
      margin: {
        top: "0.85in",
        bottom: "0.85in",
        left: "0.8in",
        right: "0.8in",
      },
      printBackground: true,
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(5000);
    expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("renders standalone HTML export and generates valid PDF from exported HTML", async ({
    page,
    context,
  }) => {
    const standaloneHtml = await page.evaluate(async () => {
      // @ts-ignore
      const { generateStandaloneHtml } = await import("./js/state.js");
      return generateStandaloneHtml("will");
    });

    const newPage = await context.newPage();
    await newPage.setContent(standaloneHtml, { waitUntil: "load" });

    const docSheet = newPage.locator(".paged-sheet");
    await expect(docSheet).toBeVisible();
    await expect(docSheet.locator(".doc-title")).toContainText("Avery Q. Ramos");
    await expect(docSheet.locator(".article-header").first()).toContainText(
      "Article 1: Family and Guardians",
    );

    const standalonePdfBuffer = await newPage.pdf({
      format: "Letter",
      printBackground: true,
    });

    expect(standalonePdfBuffer.length).toBeGreaterThan(5000);
    expect(standalonePdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
    await newPage.close();
  });

  test("verifies responsive rendering and interactions at mobile viewport (393px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });

    const header = page.locator(".app-header");
    await expect(header).toBeVisible();

    const sidebar = page.locator(".app-sidebar");
    await expect(sidebar).toBeVisible();

    const toolbar = page.locator(".toolbar");
    await expect(toolbar).toBeVisible();

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

    await page.fill("#input-testator-name", "Mobile Testator");
    await expect(sheet.locator(".doc-title")).toContainText("Mobile Testator");

    await page.click("#zoom-75");
    const container = page.locator("#sheet-container");
    await expect(container).toHaveAttribute("data-zoom", "75");

    await page.click("#zoom-fit");
    await expect(container).toHaveAttribute("data-zoom", "fit");
  });

  test("verifies zoom toolbar mode transitions and container attributes", async ({
    page,
  }) => {
    const container = page.locator("#sheet-container");

    await expect(container).toHaveAttribute("data-zoom", "100");

    await page.click("#zoom-75");
    await expect(container).toHaveAttribute("data-zoom", "75");

    await page.click("#zoom-fit");
    await expect(container).toHaveAttribute("data-zoom", "fit");

    await page.click("#zoom-100");
    await expect(container).toHaveAttribute("data-zoom", "100");
  });
});
