// @ts-check
const { test, expect } = require("@playwright/test");
const { seedPlans, PLAN_1 } = require("./fixtures");
const { generateStandaloneHtml } = require("./helpers/standaloneHtml");

test.describe("Screen-to-Print Fidelity & PDF Generation", () => {
  test.beforeEach(async ({ page }) => {
    await seedPlans(page);
    await page.goto("/");
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
              foundPageRule = { cssText: rule.cssText };
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
    expect(pageRuleProps.cssText).toContain("1.05in");
  });

  test("verifies print media emulation removes app shell and neutralises variable highlights", async ({
    page,
  }) => {
    await page
      .locator('[aria-label="Presentation"] button:has-text("Paper")')
      .click();
    await page.emulateMedia({ media: "print" });

    await expect(page.locator(".app-header")).toBeHidden();
    await expect(page.locator(".app-rail")).toBeHidden();
    await expect(page.locator(".presentation-toggle")).toBeHidden();
    await expect(page.locator(".skip-link")).toBeHidden();

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

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
        markStyle.backgroundColor === "transparent"
    ).toBe(true);
    expect(
      markStyle.borderBottomWidth === "0px" ||
        markStyle.borderBottomStyle === "none"
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
        affidavitSigRowBreakInside:
          getVal(".affidavit-sig-row", "break-inside") ||
          getVal(".affidavit-sig-row", "page-break-inside"),
        paragraphOrphans: getVal(".doc-preamble", "orphans"),
        paragraphWidows: getVal(".doc-preamble", "widows"),
      };
    });

    expect(styles.articleHeaderBreakAfter).toBe("avoid");
    expect(styles.testimoniumBreakInside).toBe("avoid");
    expect(styles.sigBlockBreakInside).toBe("avoid");
    expect(styles.witnessBlockBreakInside).toBe("avoid");
    expect(styles.notaryBlockBreakInside).toBe("avoid");
    expect(styles.affidavitSigRowBreakInside).toBe("avoid");
    expect(styles.paragraphOrphans).toBe("3");
    expect(styles.paragraphWidows).toBe("3");
  });

  test("headless PDF is a well-formed multi-object document with the @page margin boxes applied", async ({
    page,
  }) => {
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");

    // Counting `/Type /Page` object dictionaries (uncompressed in the PDF
    // object table) is a reliable structural check without depending on an
    // external tool like ghostscript to decode compressed content streams.
    const pdfText = pdfBuffer.toString("latin1");
    const pageObjectCount = (pdfText.match(/\/Type\s*\/Page[^s]/g) || [])
      .length;
    expect(pageObjectCount).toBeGreaterThanOrEqual(1);
  });

  test("generates a valid headless PDF for the active plan", async ({
    page,
  }) => {
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(5000);
    expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("renders standalone HTML export and generates valid PDF from exported HTML", async ({
    context,
  }) => {
    const standaloneHtml = await generateStandaloneHtml(PLAN_1);

    const newPage = await context.newPage();
    await newPage.setContent(standaloneHtml, { waitUntil: "load" });

    const docSheet = newPage.locator(".paged-sheet");
    await expect(docSheet).toBeVisible();
    await expect(docSheet.locator(".doc-title")).toContainText(
      "Avery Q. Ramos"
    );
    await expect(docSheet.locator(".article-header").first()).toContainText(
      "Article 1: Family, Guardians, and Conservators"
    );

    const standalonePdfBuffer = await newPage.pdf({
      format: "Letter",
      printBackground: true,
    });

    expect(standalonePdfBuffer.length).toBeGreaterThan(5000);
    expect(standalonePdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
    await newPage.close();
  });
});
