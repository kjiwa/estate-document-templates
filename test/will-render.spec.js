// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Phase 2 Will Template Engine & Rendering", () => {
  test("template generates all 10 articles and required legal blocks", async ({
    page,
  }) => {
    await page.goto("/");

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

    const expectedArticles = [
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

    for (const title of expectedArticles) {
      await expect(
        sheet.locator(".article-header", { hasText: title })
      ).toBeVisible();
    }

    const powersList = sheet.locator(".powers-list li");
    await expect(powersList).toHaveCount(11);
    await expect(powersList.nth(0)).toContainText("5.1 General Powers");
    await expect(powersList.nth(1)).toContainText(
      "5.2 Investment and Retention"
    );
    await expect(powersList.nth(10)).toContainText("5.11 Governing Law");

    await expect(sheet.locator(".testimonium")).toContainText(
      "IN WITNESS WHEREOF"
    );
    await expect(sheet.locator(".sig-block-principal")).toContainText(
      "Testator"
    );
    await expect(sheet.locator(".witness-block")).toContainText(
      "Attestation of Witnesses"
    );
    await expect(sheet.locator(".notary-block")).toContainText(
      "Self-Proving Affidavit"
    );
  });

  test("correctly sets initial profile data for Avery Q. Ramos", async ({
    page,
  }) => {
    await page.goto("/");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText("Avery Q. Ramos");
    await expect(sheet.locator(".doc-preamble")).toContainText("Avery Q. Ramos");
    await expect(sheet.locator(".doc-preamble")).toContainText(
      "King County, Washington"
    );

    const article1 = sheet.locator(".clause").first();
    await expect(article1).toContainText("Morgan T. Ramos");
    await expect(article1).toContainText("are to her");

    await expect(sheet).toContainText("Casey Delacroix as Trustee");
    await expect(sheet).toContainText("Priya Nandakumar as alternate Trustee");
    await expect(sheet).toContainText(
      "Morgan T. Ramos, as Personal Representative"
    );
    await expect(sheet).toContainText(
      "Devin Okafor as alternate Personal Representative"
    );

    await expect(sheet.locator(".witness-declaration")).toContainText(
      "to be his Last Will and Testament"
    );
    await expect(sheet.locator(".notary-body")).toContainText(
      "declared this instrument to be his Last Will and Testament"
    );
  });
  test("switching profile to Morgan inverts pronouns and fiduciaries correctly", async ({
    page,
  }) => {
    await page.goto("/");

    await page.selectOption("#select-profile", "profile-2");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText(
      "Morgan T. Ramos"
    );
    await expect(sheet.locator(".doc-preamble")).toContainText(
      "Morgan T. Ramos"
    );

    const article1 = sheet.locator(".clause").first();
    await expect(article1).toContainText("Avery Q. Ramos");
    await expect(article1).toContainText("are to him");

    await expect(sheet).toContainText("Avery Q. Ramos, as Personal Representative");
    await expect(sheet).toContainText(
      "Devin Okafor as alternate Personal Representative"
    );

    await expect(sheet.locator(".witness-declaration")).toContainText(
      "to be her Last Will and Testament"
    );
    await expect(sheet.locator(".notary-body")).toContainText(
      "declared this instrument to be her Last Will and Testament"
    );

    const a11yStatus = page.locator("#a11y-status");
    await expect(a11yStatus).toContainText("Morgan T. Ramos");
  });

  test("toggle profile button swaps between profiles", async ({ page }) => {
    await page.goto("/");

    const toggleBtn = page.locator("#btn-toggle-profile");
    await expect(toggleBtn).toContainText("Avery Q. Ramos");

    await toggleBtn.click();
    await expect(toggleBtn).toContainText("Morgan T. Ramos");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText(
      "Morgan T. Ramos"
    );

    await toggleBtn.click();
    await expect(toggleBtn).toContainText("Avery Q. Ramos");
    await expect(sheet.locator(".doc-title")).toContainText("Avery Q. Ramos");
  });

  test("live form input updates document preview reactively", async ({
    page,
  }) => {
    await page.goto("/");

    const inputName = page.locator("#input-testator-name");
    await inputName.fill("Jane Doe");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText("Jane Doe");
    await expect(sheet.locator(".doc-preamble")).toContainText("Jane Doe");
  });

  test("sanitizes input strings against HTML injection", async ({ page }) => {
    await page.goto("/");

    const inputName = page.locator("#input-testator-name");
    await inputName.fill(
      '<script id="xss-test">alert("xss")</script><b>Bold Name</b>'
    );

    const injectedScript = page.locator("#xss-test");
    await expect(injectedScript).toHaveCount(0);

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toContainText(
      '<script id="xss-test">alert("xss")</script><b>Bold Name</b>'
    );
  });

  test("template registry provides valid registered templates", async ({
    page,
  }) => {
    await page.goto("/");

    const registryCheck = await page.evaluate(async () => {
      // @ts-ignore
      const { getTemplate, listTemplates } =
        await import("./js/templates/registry.js");
      const will = getTemplate("will");
      const all = listTemplates();
      return {
        willExists: !!will,
        willName: will?.name,
        totalTemplates: all.length,
      };
    });

    expect(registryCheck.willExists).toBe(true);
    expect(registryCheck.willName).toBe(
      "Washington State Last Will and Testament"
    );
    expect(registryCheck.totalTemplates).toBeGreaterThanOrEqual(1);
  });
});
