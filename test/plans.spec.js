// @ts-check
const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { seedPlans, disableFilePickers } = require("./fixtures");

async function openFirstDocument(card) {
  await card.locator(".plan-doc").first().click();
}

const WILL_TITLE = "Last Will and Testament";
const DOCUMENT_TITLES = [
  WILL_TITLE,
  "Disposition of Remains Directive",
  "Health Care Directive",
  "General Power of Attorney",
  "Durable Power of Attorney",
];

async function chooseMenuItem(card, name) {
  await card.getByRole("button", { name: /^More/ }).click();
  await card.getByRole("button", { name }).click();
}

test.describe("Plan management", () => {
  test.beforeEach(async ({ page }) => {
    await seedPlans(page);
    await page.goto("/app/#/document");
  });

  test("the Plans button opens the plans view with one card per plan", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    await expect(page.locator(".plans-view")).toBeVisible();
    await expect(page.locator(".plan-card")).toHaveCount(2);
  });

  test("New plan creates a plan, makes it active, and returns to the document view", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();
    await page.getByRole("button", { name: "New plan" }).click();

    await expect(page.locator(".plans-view")).toBeHidden();
    await expect(page.locator("#document-sheet")).toBeVisible();
  });

  test("Rename swaps the title for an input and commits on Enter", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const firstCard = page.locator(".plan-card").first();
    await chooseMenuItem(firstCard, "Rename");

    const input = firstCard.getByLabel("Plan name");
    await input.fill("Renamed Plan");
    await input.press("Enter");

    await expect(firstCard.locator("h2")).toHaveText("Renamed Plan");
  });

  test("Duplicate adds a card and makes the copy active", async ({ page }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();
    await chooseMenuItem(page.locator(".plan-card").first(), "Duplicate");

    await expect(page.locator(".plan-card")).toHaveCount(3);
    await expect(
      page.locator(".plan-card", { hasText: "(copy)" })
    ).toBeVisible();
  });

  test("Delete is disabled at one plan, and confirms in-card otherwise", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const cards = page.locator(".plan-card");
    await expect(cards).toHaveCount(2);

    const secondCard = cards.nth(1);
    await secondCard.getByRole("button", { name: /^More/ }).click();
    await secondCard.getByRole("button", { name: /^Delete/ }).click();
    await expect(
      secondCard.getByRole("button", { name: "Confirm delete" })
    ).toBeVisible();
    await secondCard.getByRole("button", { name: "Confirm delete" }).click();

    await expect(page.locator(".plan-card")).toHaveCount(1);
    const lastCard = page.locator(".plan-card");
    await lastCard.getByRole("button", { name: /^More/ }).click();
    await expect(
      lastCard.getByRole("button", { name: /^Delete/ })
    ).toBeDisabled();
  });

  test("opening a document of another plan renders that plan", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    await openFirstDocument(page.locator(".plan-card").nth(1));

    await expect(
      page.locator('[data-path="party.testator.name"]').first()
    ).toHaveText("Morgan T. Ramos");
  });

  test("Create spouse plan produces a correct reciprocal document", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    await chooseMenuItem(
      page.locator(".plan-card").first(),
      "Create spouse plan"
    );

    await openFirstDocument(page.locator(".plan-card").last());

    // PLAN_1's testator is Avery Q. Ramos, spouse is Morgan T. Ramos — the
    // reciprocal swaps identity, so the new document's testator is Morgan.
    await expect(
      page.locator('[data-path="party.testator.name"]').first()
    ).toHaveText("Morgan T. Ramos");
    await expect(
      page.locator('[data-path="party.spouse.name"]').first()
    ).toHaveText("Avery Q. Ramos");
  });

  test("the More menu downloads an attorney memo for each document", async ({
    page,
  }) => {
    await disableFilePickers(page);
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const card = page.locator(".plan-card").first();
    await card.getByRole("button", { name: /^More/ }).click();
    const group = card.getByRole("group", { name: "Attorney memos" });
    await expect(group.getByRole("button")).toHaveCount(DOCUMENT_TITLES.length);
    await page.keyboard.press("Escape");

    for (const title of DOCUMENT_TITLES) {
      await card.getByRole("button", { name: /^More/ }).click();
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        group.getByRole("button", { name: title, exact: true }).click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/-memo\.txt$/);
      const lines = fs.readFileSync(await download.path(), "utf8").split("\n");
      expect(lines[0]).toBe("ATTORNEY MEMORANDUM");
      if (title !== WILL_TITLE) expect(lines[1]).toBe(title);
    }
  });

  test("Download all saves one HTML file with every document", async ({
    page,
  }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await disableFilePickers(page);
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page
        .locator(".plan-card")
        .first()
        .getByRole("button", { name: "Download all" })
        .click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/-all-documents\.html$/);
    const html = fs.readFileSync(await download.path(), "utf8");
    expect(html.match(/<article\b[^>]*\bpaged-sheet\b/g)).toHaveLength(5);
    expect(consoleErrors).toEqual([]);
  });

  test("the Data card downloads a JSON save of every plan", async ({
    page,
  }) => {
    await disableFilePickers(page);
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

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
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const firstCard = page.locator(".plan-card").first();
    await chooseMenuItem(firstCard, "Rename");
    await firstCard.getByLabel("Plan name").fill("Saved Before Reopen");
    await firstCard.getByLabel("Plan name").press("Enter");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Save plans to file" }).click(),
    ]);
    const savedPath = await download.path();

    await chooseMenuItem(firstCard, "Rename");
    await firstCard.getByLabel("Plan name").fill("Overwritten Name");
    await firstCard.getByLabel("Plan name").press("Enter");
    await expect(firstCard.locator("h2")).toHaveText("Overwritten Name");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Open plans from file" }).click(),
    ]);
    await fileChooser.setFiles(savedPath);
    await page.getByRole("button", { name: "Confirm replace" }).click();

    await expect(
      page.locator(".plan-card", { hasText: "Saved Before Reopen" })
    ).toBeVisible();
  });

  test("Open plans from file imports a schema v3 export and gives every document its own copy of the shared execution record", async ({
    page,
  }) => {
    await disableFilePickers(page);
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Open plans from file" }).click(),
    ]);
    await fileChooser.setFiles(path.join(__dirname, "data", "v3-export.json"));
    await page.getByRole("button", { name: "Confirm replace" }).click();

    await expect(
      page.locator(".plan-card", { hasText: "Imported V3 Plan" })
    ).toBeVisible();

    await openFirstDocument(page.locator(".plan-card").first());
    await page
      .getByLabel("Active document")
      .selectOption("durable-power-of-attorney");
    await expect(
      page
        .locator('[data-path="executions.durablePowerOfAttorney.city"]')
        .first()
    ).toHaveText("Spokane");
  });

  test("Open plans from file asks before replacing and Cancel keeps the current plans", async ({
    page,
  }) => {
    await disableFilePickers(page);
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Save plans to file" }).click(),
    ]);
    const savedPath = await download.path();

    const firstCard = page.locator(".plan-card").first();
    await chooseMenuItem(firstCard, "Rename");
    await firstCard.getByLabel("Plan name").fill("Edited After Save");
    await firstCard.getByLabel("Plan name").press("Enter");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Open plans from file" }).click(),
    ]);
    await fileChooser.setFiles(savedPath);

    await expect(
      page.getByText(/^Replace 2 plans with 2 plans from /)
    ).toBeVisible();
    await expect(firstCard.locator("h2")).toHaveText("Edited After Save");

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText(/^Replace 2 plans/)).toHaveCount(0);
    await expect(firstCard.locator("h2")).toHaveText("Edited After Save");

    const [secondChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Open plans from file" }).click(),
    ]);
    await secondChooser.setFiles(savedPath);
    await page.getByRole("button", { name: "Confirm replace" }).click();

    await expect(firstCard.locator("h2")).not.toHaveText("Edited After Save");
  });

  test("Create spouse plan is hidden when marital status is unmarried", async ({
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

    await page.getByRole("link", { name: "Plans", exact: true }).click();
    const firstCard = page.locator(".plan-card").first();
    await firstCard.getByRole("button", { name: /^More/ }).click();
    await expect(
      firstCard.getByRole("button", { name: "Create spouse plan" })
    ).toBeHidden();
  });

  test("each card lists the five documents with a stage chip", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const rows = page
      .locator(".plan-card")
      .first()
      .locator(".plan-overview-row");
    await expect(rows).toHaveCount(5);
    await expect(rows.first().locator(".stage-chip")).toHaveText(
      /In progress|Ready to sign|Ready to print/
    );
  });

  test("each card carries a stage summary line", async ({ page }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const cards = page.locator(".plan-card");
    for (const index of [0, 1]) {
      await expect(cards.nth(index).locator(".field-hint").first()).toHaveText(
        /^Documents: [^;]+(; \d+ to review)?$/
      );
    }
  });

  test("optional-blank lines appear only once a document is out of in-progress", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const inProgress = page
      .locator(".plan-card")
      .first()
      .locator(".plan-overview-row")
      .filter({
        has: page.locator(".stage-chip", { hasText: /^In progress$/ }),
      });
    await expect(inProgress.filter({ hasText: "Left blank" })).toHaveCount(0);
  });

  test("cards have no Make active control", async ({ page }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    await expect(page.getByRole("button", { name: /Make active/ })).toHaveCount(
      0
    );
  });

  test("the header shows the active plan name as a label, not a picker", async ({
    page,
  }) => {
    await expect(page.getByLabel("Active plan")).toHaveCount(0);
    const label = page.locator(".plan-name");
    await expect(label).toHaveAttribute("title", /\S/);
    const first = await label.textContent();

    await page.getByRole("link", { name: "Plans", exact: true }).click();
    await openFirstDocument(page.locator(".plan-card").nth(1));

    await expect(label).not.toHaveText(first);
  });

  test("opening Plans focuses its heading and renames the skip link", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: "Plans" })
    ).toBeFocused();
    await expect(page.locator("a.skip-link")).toHaveText("Skip to plans");
  });

  test("the stage chip is vertically centered on the document title", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const row = page.locator(".plan-doc").first();
    const title = await row.locator(".plan-doc-title").boundingBox();
    const chip = await row.locator(".stage-chip").boundingBox();
    const center = (box) => box.y + box.height / 2;
    expect(Math.abs(center(title) - center(chip))).toBeLessThan(1.5);
  });

  test("a document row opens that document for that plan", async ({ page }) => {
    await page.getByRole("link", { name: "Plans", exact: true }).click();

    const card = page.locator(".plan-card").nth(1);
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
    await page.getByRole("link", { name: "Plans", exact: true }).click();

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
      data.plans["profile-1"].executions.will.witnesses[0].name =
        "Devin Okafor";
      window.localStorage.setItem(KEY, JSON.stringify(data));
    });
    await page.reload();
    await page.getByRole("link", { name: "Plans", exact: true }).click();

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
