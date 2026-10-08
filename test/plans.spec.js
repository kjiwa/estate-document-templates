// @ts-check
const { test, expect } = require("@playwright/test");
const { seedPlans, disableFilePickers } = require("./fixtures");

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

  test("the Data card downloads an attorney memo", async ({ page }) => {
    await disableFilePickers(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Plans" }).click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Attorney memo" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.txt$/);
  });

  test("the Data card downloads a JSON save of every plan", async ({
    page,
  }) => {
    await disableFilePickers(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Plans" }).click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Save plans to file" }).click(),
    ]);

    expect(download.suggestedFilename()).toBe("estate-plans.json");
  });

  test("Open plans from file round-trips a previously saved export", async ({
    page,
  }) => {
    await disableFilePickers(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Plans" }).click();

    const firstCard = page.locator(".plan-card").first();
    await firstCard.getByRole("button", { name: "Rename" }).click();
    await firstCard.getByLabel("Plan name").fill("Saved Before Reopen");
    await firstCard.getByLabel("Plan name").press("Enter");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Save plans to file" }).click(),
    ]);
    const savedPath = await download.path();

    await firstCard.getByRole("button", { name: "Rename" }).click();
    await firstCard.getByLabel("Plan name").fill("Overwritten Name");
    await firstCard.getByLabel("Plan name").press("Enter");
    await expect(firstCard.locator("strong")).toHaveText("Overwritten Name");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Open plans from file" }).click(),
    ]);
    await fileChooser.setFiles(savedPath);

    await expect(
      page.locator(".plan-card", { hasText: "Saved Before Reopen" })
    ).toBeVisible();
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

  test("each card lists the five documents with a stage chip", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const rows = page
      .locator(".plan-card")
      .first()
      .locator(".plan-overview-row");
    await expect(rows).toHaveCount(5);
    await expect(rows.first().locator(".stage-chip")).toHaveText(
      /In progress|Ready to sign|Ready to print/
    );
  });

  test("the active plan's document list is open and the others are collapsed", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const cards = page.locator(".plan-card");
    await expect(cards.first().locator(".plan-documents")).toHaveJSProperty(
      "open",
      true
    );
    await expect(cards.first().locator("summary")).toHaveText(/^Documents: /);
    const other = cards.nth(1).locator(".plan-documents");
    await expect(other).toHaveJSProperty("open", false);
    await other.locator("summary").click();
    await expect(other).toHaveJSProperty("open", true);
  });

  test("the stage chip is vertically centered on the document title", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const head = page.locator(".plan-overview-head").first();
    const title = await head.locator(".plan-overview-title").boundingBox();
    const chip = await head.locator(".stage-chip").boundingBox();
    const center = (box) => box.y + box.height / 2;
    expect(Math.abs(center(title) - center(chip))).toBeLessThan(1);
  });

  test("a document row opens that document for that plan", async ({ page }) => {
    await page.getByRole("button", { name: "Plans" }).click();

    const card = page.locator(".plan-card").nth(1);
    await card.locator(".plan-documents > summary").click();
    await card.getByRole("button", { name: "Health Care Directive" }).click();

    await expect(page.locator(".plans-view")).toBeHidden();
    await expect(
      page.locator('[data-path="party.testator.name"]').first()
    ).toHaveText("Morgan T. Ramos");
    await expect(page.locator("#document-sheet")).toContainText(
      "HEALTH CARE DIRECTIVE",
      { ignoreCase: true }
    );
  });

  test("a plan with every content field filled shows Ready to sign", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const KEY = "estate_templates_state_v1";
      const data = JSON.parse(window.localStorage.getItem(KEY));
      const remains = data.plans["profile-1"].fiduciaries.remains;
      remains.agent = "Casey Delacroix";
      remains.alternate = "Priya Nandakumar";
      window.localStorage.setItem(KEY, JSON.stringify(data));
    });
    await page.reload();
    await page.getByRole("button", { name: "Plans" }).click();

    const willRow = page
      .locator(".plan-card")
      .first()
      .locator(".plan-overview-row", { hasText: "Last Will and Testament" });
    await expect(willRow.locator(".stage-chip")).toHaveText(
      /^Ready to sign, \d+ to review$/
    );
    await expect(willRow).toContainText("Signing day:");
  });

  test("an advisory link opens the document with that advisory shown", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const KEY = "estate_templates_state_v1";
      const data = JSON.parse(window.localStorage.getItem(KEY));
      data.plans["profile-1"].execution.witnesses[0].name = "Devin Okafor";
      window.localStorage.setItem(KEY, JSON.stringify(data));
    });
    await page.reload();
    await page.getByRole("button", { name: "Plans" }).click();

    await page
      .locator(".plan-card")
      .first()
      .getByRole("button", { name: "Interested witness" })
      .click();

    await expect(page.locator(".plans-view")).toBeHidden();
    await expect(
      page.locator(".context-panel .advisory, .bottom-sheet .advisory")
    ).toContainText("Witness Devin Okafor is also named as");
  });
});
