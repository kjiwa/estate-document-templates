// @ts-check
const { test, expect } = require("@playwright/test");
const { seedPlans } = require("./fixtures");

const DOCUMENT_IDS = [
  "will",
  "remains-directive",
  "health-care-directive",
  "general-power-of-attorney",
  "durable-power-of-attorney",
];

// One edit per input kind the open section offers. Text covers both the
// "text" and "date" field kinds, which render the same input.
const EDITS = {
  text: async (surface) => {
    const input = surface.locator('input[type="text"][id^="field-"]').first();
    await input.fill("Edited Value");
    await expect(input).toHaveValue("Edited Value");
  },
  number: async (surface) => {
    const input = surface.locator('input[type="number"]').first();
    await input.fill("45");
    await expect(input).toHaveValue("45");
  },
  executionDate: async (surface) => {
    const input = surface.locator('input[type="date"]').first();
    await input.fill("2026-05-01");
    await expect(input).toHaveValue("2026-05-01");
  },
  select: async (surface) => {
    const select = surface.locator("select").first();
    const value = await select
      .locator("option")
      .last()
      .evaluate((option) => /** @type {HTMLOptionElement} */ (option).value);
    await select.selectOption(value);
    await expect(select).toHaveValue(value);
  },
  checkbox: async (surface) => {
    const box = surface.locator('input[type="checkbox"]').first();
    const before = await box.isChecked();
    await box.setChecked(!before);
    await expect(box).toBeChecked({ checked: !before });
  },
  list: async (surface) => {
    const add = surface.locator(".field-list > button.btn").first();
    const rows = surface.locator(".field-list-row");
    const before = await rows.count();
    await add.click();
    await expect(rows).toHaveCount(before + 1);
  },
};

const PROBES = {
  text: 'input[type="text"][id^="field-"]',
  number: 'input[type="number"]',
  executionDate: 'input[type="date"]',
  select: "select",
  checkbox: 'input[type="checkbox"]',
  list: ".field-list > button.btn",
};

async function editKindsPresent(surface, done) {
  for (const kind of Object.keys(EDITS)) {
    if (done.has(kind)) continue;
    if ((await surface.locator(PROBES[kind]).count()) === 0) continue;
    await EDITS[kind](surface);
    done.add(kind);
  }
}

async function stepWhileEnabled(page, name, onStep) {
  const button = page.getByRole("button", { name });
  let steps = 0;
  while (await button.isEnabled()) {
    await button.click();
    steps++;
    await onStep();
    expect(steps).toBeLessThan(200);
  }
  return steps;
}

test.describe("Every document", () => {
  for (const id of DOCUMENT_IDS) {
    test(`${id}: navigate, edit each field kind, execute, console clean`, async ({
      page,
    }) => {
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      await seedPlans(page);
      await page.goto("/");
      await page.getByLabel("Active document").selectOption(id);
      await expect(page).toHaveURL(new RegExp(`#/document/${id}$`));
      await expect(page.locator("#document-sheet")).toBeVisible();

      await page.locator("#document-sheet [data-path]").first().click();
      const surface = page.locator(".context-panel, .bottom-sheet");
      await expect(surface).toBeVisible();

      const done = new Set();
      const back = await stepWhileEnabled(page, "← Prev", () =>
        editKindsPresent(surface, done)
      );
      expect(back).toBeGreaterThanOrEqual(0);
      const forward = await stepWhileEnabled(page, "Next →", () =>
        editKindsPresent(surface, done)
      );
      expect(forward).toBeGreaterThan(0);
      expect(done.size).toBeGreaterThan(0);

      await page.getByRole("button", { name: "Close" }).click();
      await page.getByRole("button", { name: "Execute" }).click();
      const label = page.locator(".rail-progress-label");
      const total = Number(
        (await label.textContent())?.match(/of (\d+)/)?.[1] ?? 0
      );
      expect(total).toBeGreaterThan(0);
      for (let i = 0; i < total; i++) {
        await page.getByRole("button", { name: "Continue →" }).click();
      }
      await expect(page.locator(".print-checklist")).toBeVisible();

      expect(consoleErrors).toEqual([]);
    });
  }
});
