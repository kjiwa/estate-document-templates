// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Reactive State, Persistence & Data Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("initial state has correct defaults including the named ultimate beneficiary", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

    const relInput = page.locator("#input-ultimate-beneficiary-relationship");
    await expect(relInput).toHaveValue("sister");
    const nameInput = page.locator("#input-ultimate-beneficiary-name");
    await expect(nameInput).toHaveValue("Robin Ramos");
    await expect(sheet).toContainText("distributed to my sister, Robin Ramos");

    const prAltInput = page.locator("#input-pr-alt");
    await expect(prAltInput).toHaveValue("Devin Okafor");
    await expect(sheet).toContainText(
      "Devin Okafor as alternate Personal Representative"
    );

    const cityInput = page.locator("#input-city");
    await expect(cityInput).toHaveValue("Seattle");
    await expect(sheet.locator(".testimonium")).toContainText(
      "City of Seattle"
    );
  });

  test("two-way binding updates document reactively across all sections", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");

    await page.fill("#input-city", "Bellevue");
    await page.fill("#input-county", "Pierce");
    await expect(sheet.locator(".testimonium")).toContainText(
      "City of Bellevue, Pierce County"
    );

    await page.fill("#input-ultimate-beneficiary-name", "Yasmin Ramos");
    await expect(sheet).toContainText("distributed to my sister, Yasmin Ramos");

    await page.fill("#input-date-day", "15th");
    await page.fill("#input-date-month", "October");
    await page.fill("#input-date-year", "2026");
    await expect(sheet.locator(".testimonium")).toContainText(
      "on this 15th day of October, 2026"
    );
  });

  test("persists state to localStorage across page reloads", async ({
    page,
  }) => {
    await page.fill("#input-testator-name", "Avery Alexander Ramos");
    await page.fill("#input-ultimate-beneficiary-name", "Children's Hospital");
    await page.fill("#input-date-year", "2027");

    await page.reload();

    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Avery Alexander Ramos"
    );
    await expect(page.locator("#input-ultimate-beneficiary-name")).toHaveValue(
      "Children's Hospital"
    );
    await expect(page.locator("#input-date-year")).toHaveValue("2027");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText(
      "Avery Alexander Ramos"
    );
    await expect(sheet).toContainText(
      "distributed to my sister, Children's Hospital"
    );
  });

  test("resets active profile back to defaults", async ({ page }) => {
    await page.fill("#input-testator-name", "Custom Testator Name");
    await page.fill("#input-ultimate-beneficiary-name", "Custom Beneficiary");

    const a11yStatus = page.locator("#a11y-status");

    await page.click("#btn-reset-profile");

    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Avery Q. Ramos"
    );
    await expect(page.locator("#input-ultimate-beneficiary-name")).toHaveValue(
      "Robin Ramos"
    );
    await expect(a11yStatus).toContainText("Active profile reset");
  });

  test("toggles dynamic variable highlighting and updates a11y announcement", async ({
    page,
  }) => {
    const highlightBtn = page.locator("#btn-toggle-highlights");
    const sheet = page.locator("#document-sheet");
    const a11yStatus = page.locator("#a11y-status");

    await expect(highlightBtn).toContainText("Highlights: ON");
    await expect(highlightBtn).toHaveAttribute("aria-pressed", "true");
    await expect(sheet).toHaveAttribute("data-highlights", "true");

    await highlightBtn.click();
    await expect(highlightBtn).toContainText("Highlights: OFF");
    await expect(sheet).toHaveAttribute("data-highlights", "false");
    await expect(a11yStatus).toContainText("Dynamic highlights turned off");

    await highlightBtn.click();
    await expect(highlightBtn).toContainText("Highlights: ON");
    await expect(sheet).toHaveAttribute("data-highlights", "true");
  });

  test("children are repeatable: add and remove rows update the document", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).toContainText("I have two children");

    await page.click("#btn-add-child");
    const childInputs = page.locator("[data-child-index]");
    await expect(childInputs).toHaveCount(3);

    await childInputs.nth(2).fill("Third Child Name");
    await expect(sheet).toContainText("I have three children");
    await expect(sheet).toContainText("Third Child Name");

    await page.locator("[data-remove-child]").first().click();
    await expect(page.locator("[data-child-index]")).toHaveCount(2);
  });

  test("JSON export and import works roundtrip", async ({ page }) => {
    await page.fill("#input-testator-name", "Export Testator");
    await page.fill("#input-city", "Kirkland");

    const exportedJson = await page.evaluate(async () => {
      // @ts-ignore
      const { exportStateAsJson } = await import("./js/state.js");
      return exportStateAsJson();
    });

    const parsed = JSON.parse(exportedJson);
    expect(parsed.profile-1.testator.name).toBe("Export Testator");
    expect(parsed.profile-1.city).toBe("Kirkland");

    await page.click("#btn-reset-all");
    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Avery Q. Ramos"
    );

    const importResult = await page.evaluate(async (jsonStr) => {
      // @ts-ignore
      const { importStateFromJson } = await import("./js/state.js");
      return importStateFromJson(jsonStr);
    }, exportedJson);

    expect(importResult.success).toBe(true);

    await page.reload();
    await expect(page.locator("#input-testator-name")).toHaveValue(
      "Export Testator"
    );
    await expect(page.locator("#input-city")).toHaveValue("Kirkland");
  });

  test("JSON import surfaces a field-level error via role=alert instead of alert()", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      // @ts-ignore
      const { importStateFromJson } = await import("./js/state.js");
      return importStateFromJson(
        JSON.stringify({ profile-1: { label: "no testator" } })
      );
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("testator.name");

    const importErrorEl = page.locator("#import-error");
    await expect(importErrorEl).toHaveAttribute("role", "alert");
  });

  test("seeding a v1-shaped localStorage value still yields both profiles and a complete document, with no invented county fallback", async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        "estate_templates_state_v1",
        JSON.stringify({
          activeProfileId: "profile-1",
          profiles: {
            profile-1: {
              testator: { name: "Avery Q. Ramos", gender: "male", county: "" },
              tertiaryBeneficiary: "my sister",
            },
          },
        })
      );
    });
    await page.reload();

    const optionValues = await page
      .locator("#select-profile option")
      .evaluateAll((opts) => opts.map((o) => o.value));
    expect(optionValues).toEqual(["profile-1", "profile-2"]);

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".article-header")).toHaveCount(10);
    await expect(sheet).not.toContainText("King County");

    const preambleFillIn = sheet.locator(".doc-preamble .fill-in");
    await expect(preambleFillIn).toHaveCount(1);

    await page.selectOption("#select-profile", "profile-2");
    await expect(sheet.locator(".doc-title")).toContainText(
      "Morgan T. Ramos"
    );
  });

  test("standalone HTML export generates valid self-contained HTML with no guidance and no highlight marks", async ({
    page,
  }) => {
    const standaloneHtml = await page.evaluate(async () => {
      // @ts-ignore
      const { generateStandaloneHtml } = await import("./js/export.js");
      return generateStandaloneHtml("will");
    });

    expect(standaloneHtml).toContain("<!DOCTYPE html>");
    expect(standaloneHtml).toContain(
      "<title>Last Will and Testament - Avery Q. Ramos</title>"
    );
    expect(standaloneHtml).toContain(
      "Article 1: Family, Guardians, and Conservators"
    );
    expect(standaloneHtml).toContain(
      "Article 10: Severability and Governing Law"
    );
    expect(standaloneHtml).toContain("Self-Proving Affidavit");
    expect(standaloneHtml).not.toContain('<mark class="dynamic-var">');
    expect(standaloneHtml).not.toContain('class="guidance"');
  });

  test("attorney memo export lists choices and advisories as plain text", async ({
    page,
  }) => {
    const memo = await page.evaluate(async () => {
      // @ts-ignore
      const { generateAttorneyMemo } = await import("./js/export.js");
      // @ts-ignore
      const { getActiveProfile } = await import("./js/state.js");
      return generateAttorneyMemo(getActiveProfile());
    });

    expect(memo).toContain("ATTORNEY MEMORANDUM");
    expect(memo).toContain("CHOICES MADE");
    expect(memo).toContain("ADVISORIES RAISED");
    expect(memo).toContain("OPEN QUESTIONS FOR COUNSEL");
  });
});
