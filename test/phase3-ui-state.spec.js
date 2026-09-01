// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Phase 3 WCAG 2.1/2.2 AA Accessible UI & Reactive State", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Clear localStorage to ensure a clean state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("initial state has correct defaults including tertiary sister beneficiary and Devin Okafor", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

    // Verify Tertiary Beneficiary in Form and Document (Article 2.4)
    const tertiaryInput = page.locator("#input-tertiary-beneficiary");
    await expect(tertiaryInput).toHaveValue("my sister");
    await expect(sheet).toContainText("distributed to my sister");

    // Verify Devin Okafor as Alternate PR (Article 6.2)
    const prAltInput = page.locator("#input-pr-alt");
    await expect(prAltInput).toHaveValue("Devin Okafor");
    await expect(sheet).toContainText(
      "Devin Okafor as alternate Personal Representative",
    );

    // Verify City of Execution
    const cityInput = page.locator("#input-city");
    await expect(cityInput).toHaveValue("Seattle");
    await expect(sheet.locator(".testimonium")).toContainText(
      "City of Seattle",
    );
  });

  test("two-way binding updates document reactively across all sections", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");

    // 1. Domicile & City
    await page.fill("#input-city", "Bellevue");
    await page.fill("#input-county", "Pierce");
    await expect(sheet.locator(".testimonium")).toContainText(
      "City of Bellevue, Pierce County",
    );

    // 2. Tertiary Beneficiary (Article 2.4)
    await page.fill("#input-tertiary-beneficiary", "my sister, Yasmin Ramos");
    await expect(sheet).toContainText("distributed to my sister, Yasmin Ramos");

    // 3. Execution Date
    await page.fill("#input-date-day", "15th");
    await page.fill("#input-date-month", "October");
    await page.fill("#input-date-year", "2026");
    await expect(sheet.locator(".testimonium")).toContainText(
      "on this 15th day of October, 2026",
    );
  });

  test("gender select updates pronoun declensions in document", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");

    // Switch Testator gender to female
    await page.selectOption("#select-testator-gender", "female");
    await expect(sheet.locator(".witness-declaration")).toContainText(
      "to be her Last Will and Testament",
    );
    await expect(sheet.locator(".notary-body")).toContainText(
      "to be her Last Will and Testament",
    );

    // Switch Spouse gender to male
    await page.selectOption("#select-spouse-gender", "male");
    const article1 = sheet.locator(".clause").first();
    await expect(article1).toContainText("are to him");
  });
  test("persists state to localStorage across page reloads", async ({
    page,
  }) => {
    // Modify multiple fields
    await page.fill("#input-testator-name", "Avery Alexander Ramos");
    await page.fill(
      "#input-tertiary-beneficiary",
      "Children's Hospital Seattle",
    );
    await page.fill("#input-date-year", "2027");

    // Reload page
    await page.reload();

    // Check that form controls retain values
    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Avery Alexander Ramos",
    );
    await expect(page.locator("#input-tertiary-beneficiary")).toHaveValue(
      "Children's Hospital Seattle",
    );
    await expect(page.locator("#input-date-year")).toHaveValue("2027");

    // Check that rendered document reflects persisted values
    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText(
      "Avery Alexander Ramos",
    );
    await expect(sheet).toContainText(
      "distributed to Children's Hospital Seattle",
    );
  });

  test("resets active profile back to defaults", async ({ page }) => {
    await page.fill("#input-testator-name", "Custom Testator Name");
    await page.fill("#input-tertiary-beneficiary", "Custom Beneficiary");

    const a11yStatus = page.locator("#a11y-status");

    // Click Reset Active Profile
    await page.click("#btn-reset-profile");

    // Expect reset to defaults
    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Avery Q. Ramos",
    );
    await expect(page.locator("#input-tertiary-beneficiary")).toHaveValue(
      "my sister",
    );
    await expect(a11yStatus).toContainText("Active profile reset");
  });

  test("toggles dynamic variable highlighting and updates a11y announcement", async ({
    page,
  }) => {
    const highlightBtn = page.locator("#btn-toggle-highlights");
    const sheet = page.locator("#document-sheet");
    const a11yStatus = page.locator("#a11y-status");

    // Initially Highlights are ON
    await expect(highlightBtn).toContainText("Highlights: ON");
    await expect(highlightBtn).toHaveAttribute("aria-pressed", "true");
    await expect(sheet).toHaveAttribute("data-highlights", "true");

    // Toggle Highlights OFF
    await highlightBtn.click();
    await expect(highlightBtn).toContainText("Highlights: OFF");
    await expect(highlightBtn).toHaveAttribute("aria-pressed", "false");
    await expect(sheet).toHaveAttribute("data-highlights", "false");
    await expect(a11yStatus).toContainText("Dynamic highlights turned off");

    // Toggle Highlights back ON
    await highlightBtn.click();
    await expect(highlightBtn).toContainText("Highlights: ON");
    await expect(highlightBtn).toHaveAttribute("aria-pressed", "true");
    await expect(sheet).toHaveAttribute("data-highlights", "true");
    await expect(a11yStatus).toContainText("Dynamic highlights turned on");
  });

  test("JSON export and import works roundtrip", async ({ page }) => {
    // Modify profile data
    await page.fill("#input-testator-name", "Export Testator");
    await page.fill("#input-city", "Kirkland");

    // Evaluate JSON export from state
    const exportedJson = await page.evaluate(async () => {
      // @ts-ignore
      const { exportStateAsJson } = await import("./js/state.js");
      return exportStateAsJson();
    });

    const parsed = JSON.parse(exportedJson);
    expect(parsed.profile-1.testator.name).toBe("Export Testator");
    expect(parsed.profile-1.city).toBe("Kirkland");

    // Reset profiles
    await page.click("#btn-reset-all");
    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Avery Q. Ramos",
    );

    // Import previously exported JSON
    const importResult = await page.evaluate(async (jsonStr) => {
      // @ts-ignore
      const { importStateFromJson } = await import("./js/state.js");
      return importStateFromJson(jsonStr);
    }, exportedJson);

    expect(importResult.success).toBe(true);

    // Sync check
    await page.reload();
    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Export Testator",
    );
    await expect(page.locator("#input-city")).toHaveValue("Kirkland");
  });

  test("standalone HTML export generates valid self-contained HTML", async ({
    page,
  }) => {
    const standaloneHtml = await page.evaluate(async () => {
      // @ts-ignore
      const { generateStandaloneHtml } = await import("./js/state.js");
      return generateStandaloneHtml("will");
    });

    expect(standaloneHtml).toContain("<!DOCTYPE html>");
    expect(standaloneHtml).toContain(
      "<title>Last Will and Testament - Avery Q. Ramos</title>",
    );
    expect(standaloneHtml).toContain("Article 1: Family and Guardians");
    expect(standaloneHtml).toContain("Article 10: Severability");
    expect(standaloneHtml).toContain("Self-Proving Affidavit");
    expect(standaloneHtml).not.toContain('<mark class="dynamic-var">');
  });
});
