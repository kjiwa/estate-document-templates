// @ts-check
const { test, expect } = require("@playwright/test");
const { seedPlans, disableFilePickers } = require("./fixtures");

async function openChecklist(page) {
  await page.getByRole("button", { name: "Execute" }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Continue →" }).click();
  }
}

test.describe("Pre-print checklist and output", () => {
  test.beforeEach(async ({ page }) => {
    await seedPlans(page);
    await page.goto("/");
  });

  test("renders both checklist items and both buttons", async ({ page }) => {
    await openChecklist(page);

    const items = page.locator(".print-checklist .checklist-item");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("Turn off headers and footers");
    await expect(items.nth(1)).toContainText("Letter, portrait, single-sided");

    await expect(page.getByRole("button", { name: "Print" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Export standalone HTML" })
    ).toBeVisible();
  });

  test("Export standalone HTML fires a download", async ({ page }) => {
    await disableFilePickers(page);
    await page.goto("/");
    await openChecklist(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export standalone HTML" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.html$/);
  });

  test("Print returns to the document view with #document-sheet mounted", async ({
    page,
  }) => {
    await openChecklist(page);

    await page.getByRole("button", { name: "Print" }).click();

    await expect(page.locator(".print-checklist")).toBeHidden();
    await expect(page.locator("#document-sheet")).toBeVisible();
  });
});
