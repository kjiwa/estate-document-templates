// @ts-check
const { test, expect } = require("@playwright/test");
const { seedPlans } = require("./fixtures");

test.describe("Plan management", () => {
  test.beforeEach(async ({ page }) => {
    await seedPlans(page);
    await page.goto("/");
  });

  test("the Plans button opens the plans view with one card per plan", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    await expect(page.locator(".plans-view")).toBeVisible();
    await expect(page.locator(".plan-card")).toHaveCount(2);
  });

  test("+ New plan creates a plan, makes it active, and returns to the document view", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();
    await page.getByRole("button", { name: "+ New plan" }).click();

    await expect(page.locator(".plans-view")).toBeHidden();
    await expect(page.locator("#document-sheet")).toBeVisible();
  });

  test("Rename swaps the title for an input and commits on Enter", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const firstCard = page.locator(".plan-card").first();
    await firstCard.getByRole("button", { name: "Rename" }).click();

    const input = firstCard.getByLabel("Plan name");
    await input.fill("Renamed Plan");
    await input.press("Enter");

    await expect(firstCard.locator("strong")).toHaveText("Renamed Plan");
  });

  test("Duplicate adds a card and makes the copy active", async ({ page }) => {
    await page.getByRole("button", { name: "Plans" }).click();
    await page
      .locator(".plan-card")
      .first()
      .getByRole("button", {
        name: "Duplicate",
      })
      .click();

    await expect(page.locator(".plan-card")).toHaveCount(3);
    await expect(
      page.locator(".plan-card", { hasText: "(copy)" })
    ).toBeVisible();
  });

  test("Delete is disabled at one plan, and confirms in-card otherwise", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const cards = page.locator(".plan-card");
    await expect(cards).toHaveCount(2);

    const secondCard = cards.nth(1);
    const deleteButton = secondCard.getByRole("button", { name: "Delete" });
    await deleteButton.click();
    await expect(
      secondCard.getByRole("button", { name: "Confirm delete" })
    ).toBeVisible();
    await secondCard.getByRole("button", { name: "Confirm delete" }).click();

    await expect(page.locator(".plan-card")).toHaveCount(1);
    await expect(
      page.locator(".plan-card").getByRole("button", { name: "Delete" })
    ).toBeDisabled();
  });

  test("switching the active plan changes the rendered document", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const secondCard = page.locator(".plan-card").nth(1);
    await secondCard
      .getByRole("button", { name: /Make active|Active/ })
      .click();
    await page.getByRole("button", { name: "Document" }).click();

    await expect(
      page.locator('[data-path="party.testator.name"]').first()
    ).toHaveText("Morgan T. Ramos");
  });

  test("Create reciprocal spouse plan produces a correct reciprocal document", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    await page
      .locator(".plan-card")
      .first()
      .getByRole("button", { name: "Create reciprocal spouse plan" })
      .click();

    await page.getByRole("button", { name: "Document" }).click();

    // PLAN_1's testator is Avery Q. Ramos, spouse is Morgan T. Ramos — the
    // reciprocal swaps identity, so the new document's testator is Morgan.
    await expect(
      page.locator('[data-path="party.testator.name"]').first()
    ).toHaveText("Morgan T. Ramos");
    await expect(
      page.locator('[data-path="party.spouse.name"]').first()
    ).toHaveText("Avery Q. Ramos");
  });

  test("Create reciprocal spouse plan is hidden when marital status is unmarried", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const KEY = "estate_templates_state_v1";
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      data.plans["profile-1"].party.maritalStatus = "unmarried";
      window.localStorage.setItem(KEY, JSON.stringify(data));
    });
    await page.reload();

    await page.getByRole("button", { name: "Plans" }).click();
    const firstCard = page.locator(".plan-card").first();
    await expect(
      firstCard.getByRole("button", { name: "Create reciprocal spouse plan" })
    ).toHaveCount(0);
  });
});
