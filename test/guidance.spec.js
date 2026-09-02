// @ts-check
const { test, expect } = require("@playwright/test");
const { seedProfiles, PROFILE_2 } = require("./fixtures");

test.describe("Guidance Layer: disclosures, review advisories, and leak prevention", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfiles(page);
    await page.goto("/");
  });

  test("guidance renders as a <details> disclosure in the sidebar", async ({
    page,
  }) => {
    const guardianGuidance = page.locator(
      '[data-guidance-id="guardians"] details.guidance'
    );
    await expect(guardianGuidance).toBeAttached();
    await expect(guardianGuidance.locator("summary")).toBeVisible();
    await expect(guardianGuidance).toContainText("RCW 11.130.010");
  });

  test("no .guidance element appears inside #document-sheet, and the standalone export contains no guidance text", async ({
    page,
  }) => {
    await expect(page.locator("#document-sheet .guidance")).toHaveCount(0);

    const standaloneHtml = await page.evaluate(async () => {
      // @ts-ignore
      const { generateStandaloneHtml } = await import("./js/export.js");
      return generateStandaloneHtml("will");
    });

    expect(standaloneHtml).not.toContain('class="guidance"');
    expect(standaloneHtml).not.toContain("what this means");
  });

  test("review panel is a role=status region that updates as fields change", async ({
    page,
  }) => {
    const reviewPanel = page.locator(".review-panel");
    await expect(reviewPanel).toHaveAttribute("role", "status");

    // profile-1's guardian, conservator, and trustee roles are each held by
    // the same two people, and the execution date is unset — so at least
    // one advisory should already be present.
    await expect(page.locator("#review-list li").first()).toBeVisible();
  });

  test("naming a witness who is also a named fiduciary raises the interested-witness advisory", async ({
    page,
  }) => {
    await page.fill("#input-witness-0-name", "Casey Delacroix");

    const reviewList = page.locator("#review-list");
    await expect(reviewList).toContainText("Interested witness");
    await expect(reviewList).toContainText("RCW 11.12.160");
  });

  test("analyzeProfile: a witness who is also a beneficiary raises the RCW 11.12.160 advisory", async ({
    page,
  }) => {
    const advisories = await page.evaluate(async () => {
      // @ts-ignore
      const { analyzeProfile } = await import("./js/review.js");
      const profile = {
        spouse: { name: "Spouse Name" },
        ultimateBeneficiary: { relationship: "sister", name: "Bene Ficiary" },
        guardians: { primary: "", alternate: "" },
        conservators: { primary: "", alternate: "" },
        personalRepresentatives: { primary: "", alternate: "" },
        trustees: { primary: "", alternate: "" },
        remains: { agent: "", alternate: "" },
        children: [],
        witnesses: [{ name: "Bene Ficiary" }, { name: "" }],
        executionDate: { day: "1", month: "January", year: "2026" },
        spousalGift: "outright",
      };
      return analyzeProfile(profile);
    });

    const interestedWitness = advisories.find(
      (a) => a.id === "interested-witness-0"
    );
    expect(interestedWitness).toBeDefined();
    expect(interestedWitness.message).toContain("RCW 11.12.160");
  });

  test("analyzeProfile: a person holding four roles is reported once with all four listed", async ({
    page,
  }) => {
    const advisories = await page.evaluate(async (profile) => {
      // @ts-ignore
      const { analyzeProfile } = await import("./js/review.js");
      return analyzeProfile(profile);
    }, PROFILE_2);

    const multiRole = advisories.find(
      (a) =>
        a.id.startsWith("multi-role-") &&
        a.message.startsWith("Casey Delacroix")
    );
    expect(multiRole).toBeDefined();
    expect(multiRole.message).toContain("4 roles");
    expect(multiRole.message).toContain("primary guardian");
    expect(multiRole.message).toContain("primary conservator");
    expect(multiRole.message).toContain("primary trustee");
    expect(multiRole.message).toContain("ultimate contingent beneficiary");
  });

  test("attorney memo export is not injected into the document sheet or standalone export", async ({
    page,
  }) => {
    const sheetText = await page.locator("#document-sheet").innerText();
    expect(sheetText).not.toContain("ATTORNEY MEMORANDUM");

    const standaloneHtml = await page.evaluate(async () => {
      // @ts-ignore
      const { generateStandaloneHtml } = await import("./js/export.js");
      return generateStandaloneHtml("will");
    });
    expect(standaloneHtml).not.toContain("ATTORNEY MEMORANDUM");
  });
});
