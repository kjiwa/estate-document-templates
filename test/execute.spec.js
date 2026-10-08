// @ts-check
const { test, expect } = require("@playwright/test");
const { seedPlans } = require("./fixtures");

test.describe("Execute flow (signing day)", () => {
  test.beforeEach(async ({ page }) => {
    await seedPlans(page);
    await page.goto("/");
  });

  test("the Execute button opens the flow at group 1 of 4", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Execute" }).click();

    await expect(page.locator(".execute-flow")).toBeVisible();
    await expect(page.locator(".rail-progress-label")).toHaveText(
      "Group 1 of 4 — City and date of execution"
    );
    await expect(page.locator(".execute-flow h1")).toBeFocused();
    await expect(page.locator("a.skip-link")).toHaveText(
      "Skip to signing steps"
    );
  });

  test("Back/Continue walks all four groups, and Back at group 1 exits to the document", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Execute" }).click();

    const label = page.locator(".rail-progress-label");
    await expect(label).toHaveText("Group 1 of 4 — City and date of execution");

    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(label).toHaveText("Group 2 of 4 — Witness one");

    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(label).toHaveText("Group 3 of 4 — Witness two");

    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(label).toHaveText("Group 4 of 4 — Notary");

    await page.getByRole("button", { name: "← Back" }).click();
    await expect(label).toHaveText("Group 3 of 4 — Witness two");

    await page.getByRole("button", { name: "← Back" }).click();
    await page.getByRole("button", { name: "← Back" }).click();
    await expect(label).toHaveText("Group 1 of 4 — City and date of execution");

    await page.getByRole("button", { name: "← Back" }).click();
    await expect(page.locator(".execute-flow")).toBeHidden();
    await expect(page.locator("#document-sheet")).toBeVisible();
  });

  test("the last Continue lands on the pre-print checklist", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Execute" }).click();
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Continue →" }).click();
    }

    await expect(page.locator(".print-checklist")).toBeVisible();
  });

  test("the 'Also in this flow' rows tick as groups complete", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Execute" }).click();

    const rows = page.locator(".execute-flow .card-list .checklist-item");
    const cityRow = rows.filter({ hasText: "City and date of execution" });
    await expect(cityRow.locator(".rail-check.done")).toHaveCount(0);

    // PLAN_1 already has `executions.will.city` set; filling the composite date
    // field is the group's one remaining blank.
    await page
      .locator("#field-executions-will-executionDate")
      .fill("2026-09-01");
    await page.getByRole("button", { name: "Continue →" }).click();

    await expect(cityRow.locator(".rail-check.done")).toHaveCount(1);
  });

  test("switching to a document with fewer groups resets to group 1", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Execute" }).click();
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Continue →" }).click();
    }
    await expect(page.locator(".rail-progress-label")).toHaveText(
      /^Group 4 of 4/
    );

    await page
      .getByLabel("Active document")
      .selectOption("general-power-of-attorney");

    await expect(page.locator(".execute-flow")).toBeVisible();
    await expect(page.locator(".rail-progress-label")).toHaveText(
      /^Group 1 of \d/
    );
  });

  test("Copy signing details copies another document's record without touching the source", async ({
    page,
  }) => {
    await page.getByLabel("Active document").selectOption("remains-directive");
    await page.getByRole("button", { name: "Execute" }).click();

    await expect(
      page.locator("#field-executions-remainsDirective-city")
    ).toHaveValue("");
    await page
      .getByRole("button", {
        name: "Copy signing details from Last Will and Testament",
      })
      .click();
    await expect(
      page.locator("#field-executions-remainsDirective-city")
    ).toHaveValue("Tacoma");

    await page
      .locator("#field-executions-remainsDirective-city")
      .fill("Olympia");

    await page.getByLabel("Active document").selectOption("will");
    await expect(page.locator("#field-executions-will-city")).toHaveValue(
      "Tacoma"
    );
  });
});
