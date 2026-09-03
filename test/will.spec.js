// @ts-check
const { test, expect } = require("@playwright/test");
const { seedProfiles } = require("./fixtures");

const EXPECTED_ARTICLES = [
  "Article 1: Family, Guardians, and Conservators",
  "Article 2: Disposition of Remains",
  "Article 3: Disposition of Property",
  "Article 4: Trust Beneficiaries and Distributions",
  "Article 5: Spendthrift Provision",
  "Article 6: Powers and Duties of Trustee",
  "Article 7: Administration and Fiduciaries",
  "Article 8: No Contest Provision",
  "Article 9: Ancillary Administration",
  "Article 10: Severability and Governing Law",
];

test.describe("Will Template Engine & Rendering", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfiles(page);
    await page.goto("/");
  });

  test("template generates all 10 articles in the resulting order with required legal blocks", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).toBeVisible();

    const headers = sheet.locator(".article-header");
    await expect(headers).toHaveCount(10);
    for (let i = 0; i < EXPECTED_ARTICLES.length; i++) {
      await expect(headers.nth(i)).toContainText(EXPECTED_ARTICLES[i]);
    }

    const powersList = sheet.locator(".powers-list li");
    await expect(powersList).toHaveCount(10);
    await expect(powersList.nth(0)).toContainText("6.1 General Powers");
    await expect(powersList.nth(9)).toContainText(
      "6.10 Reliance in Good Faith"
    );

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

  test("correctly sets initial profile data for profile-1", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText("Avery Q. Ramos");
    await expect(sheet.locator(".doc-preamble")).toContainText(
      "Avery Q. Ramos"
    );
    await expect(sheet.locator(".doc-preamble")).toContainText(
      "Pierce County, Washington"
    );

    const article1 = sheet.locator(".clause").first();
    await expect(article1).toContainText("Morgan T. Ramos");
    await expect(article1).toContainText("are to her");
    await expect(article1).toContainText("I have two children");

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

  test("switching profile to profile-2 inverts pronouns and fiduciaries correctly", async ({
    page,
  }) => {
    await page.selectOption("#select-profile", "profile-2");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText("Morgan T. Ramos");
    await expect(sheet.locator(".doc-preamble")).toContainText(
      "Morgan T. Ramos"
    );

    const article1 = sheet.locator(".clause").first();
    await expect(article1).toContainText("Avery Q. Ramos");
    await expect(article1).toContainText("are to him");

    await expect(sheet).toContainText(
      "Avery Q. Ramos, as Personal Representative"
    );
    await expect(sheet).toContainText(
      "Devin Okafor as alternate Personal Representative"
    );
    await expect(sheet).toContainText(
      "distributed to my sister, Casey Delacroix"
    );

    const a11yStatus = page.locator("#a11y-status");
    await expect(a11yStatus).toContainText("Morgan T. Ramos");
  });

  test("live form input updates document preview reactively", async ({
    page,
  }) => {
    const inputName = page.locator("#input-testator-name");
    await inputName.fill("Jane Doe");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".doc-title")).toContainText("Jane Doe");
    await expect(sheet.locator(".doc-preamble")).toContainText("Jane Doe");
  });

  test("sanitizes input strings against HTML injection", async ({ page }) => {
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

  test("naming a guardian different from the conservator renders both nominations", async ({
    page,
  }) => {
    await page.fill("#input-guardian-primary", "Guardian Person");
    await page.fill("#input-conservator-primary", "Conservator Person");

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toContainText(
      "Guardian Person as Guardian of the person"
    );
    await expect(sheet).toContainText(
      "Conservator Person as Conservator of the estate"
    );
  });

  test("changing survivorshipDays changes the clause text", async ({
    page,
  }) => {
    await page.fill("#input-survivorship-days", "90");

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toContainText("survive me by 90 full days");
  });

  test("selecting disclaimerTrust emits the RCW 11.86.031 clause; outright does not", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).not.toContainText("RCW 11.86.031");

    await page.selectOption("#select-spousal-gift", "disclaimerTrust");
    await expect(sheet).toContainText("RCW 11.86.031");
    await expect(sheet).toContainText("disclaimed portion");
  });

  test("the rendered document contains no per stirpes and no King County Superior Court", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).not.toContainText("per stirpes");
    await expect(sheet).not.toContainText("King County Superior Court");

    const text = await sheet.innerText();
    expect(text).toContain("by right of representation");
  });

  test("the document expresses digital-asset content-disclosure consent naming the Personal Representative, and the jurat contains a date line", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    await expect(sheet).toContainText(
      "I consent to the disclosure of the content of my electronic communications to my Personal Representative and to my Trustee"
    );

    await expect(sheet.locator(".notary-jurat")).toContainText(
      "Subscribed and sworn to before me this"
    );
  });

  test("witness and notary names appear in the attestation and affidavit; the affidavit contains testator and two witness signature lines", async ({
    page,
  }) => {
    await page.fill("#input-witness-0-name", "Wanda Witness");
    await page.fill("#input-witness-1-name", "Walter Witness");
    await page.fill("#input-notary-name", "Nora Notary");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".witness-block")).toContainText(
      "Wanda Witness"
    );
    await expect(sheet.locator(".witness-block")).toContainText(
      "Walter Witness"
    );
    await expect(sheet.locator(".notary-block")).toContainText("Nora Notary");

    const affidavitRow = sheet.locator(".affidavit-sig-row");
    await expect(affidavitRow).toContainText("Testator Signature");
    await expect(affidavitRow).toContainText("Wanda Witness");
    await expect(affidavitRow).toContainText("Walter Witness");
  });

  test("the witness declaration and affidavit no longer require signing in the presence of each other", async ({
    page,
  }) => {
    const sheet = page.locator("#document-sheet");
    const text = await sheet.innerText();
    expect(text).not.toContain("presence of each other");
    expect(text).not.toContain("each other's presence");
  });

  test("naming a non-spouse Personal Representative drops the spouse apposition from Article 7.2", async ({
    page,
  }) => {
    await page.fill("#input-pr-primary", "Jordan Rivera");

    const sheet = page.locator("#document-sheet");
    await expect(sheet).toContainText(
      "I appoint Jordan Rivera as Personal Representative"
    );
    await expect(sheet).toContainText("If Jordan Rivera is unable");

    const text = await sheet.innerText();
    expect(text).not.toContain("my spouse, Jordan Rivera");
  });

  test("switching to unmarried renumbers Article 3 and removes every spousal reference", async ({
    page,
  }) => {
    await page.selectOption("#select-marital-status", "unmarried");

    const sheet = page.locator("#document-sheet");
    await expect(sheet.locator(".article-header")).toHaveCount(10);
    await expect(sheet.locator(".clause").first()).toContainText(
      "I am not married."
    );

    const article3Labels = await sheet
      .locator("p.clause > strong")
      .allInnerTexts();
    const clauseNumbers = article3Labels
      .filter((label) => label.startsWith("3."))
      .map((label) => label.split(" ")[0]);
    expect(clauseNumbers).toEqual(["3.1", "3.2", "3.3"]);

    const text = await sheet.innerText();
    expect(text).not.toMatch(/spouse/i);
  });

  test("resetting the active profile renders ruled blanks and they/them pronouns", async ({
    page,
  }) => {
    await page.click("#btn-reset-profile");

    const sheet = page.locator("#document-sheet");
    const prClause = sheet.locator("p.clause", {
      hasText: "Personal Representative Appointment",
    });
    await expect(prClause.locator(".fill-in").first()).toBeVisible();

    const trusteeClause = sheet.locator("p.clause", {
      hasText: "Trustee Appointment",
    });
    await expect(trusteeClause.locator(".fill-in").first()).toBeVisible();

    const article1 = sheet.locator(".clause").first();
    await expect(article1).toContainText("are to them");
  });

  test("template registry provides valid registered templates", async ({
    page,
  }) => {
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
