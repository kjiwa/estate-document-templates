// @ts-check
const { test, expect } = require("@playwright/test");

// Whichever surface (desktop context panel or mobile bottom sheet) the
// running project renders — the two never render at once (app.css:102's
// breakpoint), so exactly one of these is visible whenever a field is open.
async function openSurfaceLocator(page) {
  const panel = page.locator(".context-panel");
  const sheet = page.locator(".bottom-sheet");
  if (await panel.count()) return panel;
  return sheet;
}

test.describe("Contextual editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking a [data-path] node opens the surface for that path and marks it active", async ({
    page,
  }) => {
    const node = page.locator('[data-path="party.testator.name"]').first();
    await node.click();

    const surface = await openSurfaceLocator(page);
    await expect(surface).toBeVisible();
    await expect(node).toHaveClass(/field-active/);
  });

  test("typing in the opened field changes the rendered document text at that path", async ({
    page,
  }) => {
    const node = page.locator('[data-path="party.testator.name"]').first();
    await node.click();

    const input = page.locator("#field-party-testator-name");
    await input.fill("Jordan Whitfield");

    await expect(
      page.locator('[data-path="party.testator.name"]').first()
    ).toHaveText("Jordan Whitfield");
  });

  test("Prev/Next traverses orderedFields and reaches a field with no ruled blank", async ({
    page,
  }) => {
    const node = page.locator('[data-path="party.testator.name"]').first();
    await node.click();

    // testator: name (active), gender, county, state, execution.city — then
    // family: maritalStatus. Five "Next" presses from name lands there.
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Next →" }).click();
    }

    await expect(page.locator("#field-party-maritalStatus")).toBeVisible();
  });

  test("a rail item opens its section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.locator(".rail-item", { hasText: "Family" }).click();

    const surface = await openSurfaceLocator(page);
    await expect(surface).toBeVisible();
    await expect(surface).toContainText("Family");
  });

  test("keyboard-only: Tab to a field, Enter opens it, Tab cycles inside the sheet, Escape closes and restores focus", async ({
    page,
  }, testInfo) => {
    // The focus trap (and Escape-to-close) is `BottomSheet`'s alone — the
    // desktop `ContextPanel` is explicitly not modal (no `role="dialog"`,
    // no trap), per the plan's mockup 01 reading.
    test.skip(
      testInfo.project.name !== "mobile-chrome",
      "focus trap is the mobile bottom sheet's alone"
    );
    const node = page.locator('[data-path="party.testator.name"]').first();
    await node.focus();
    await expect(node).toBeFocused();

    await page.keyboard.press("Enter");

    const surface = await openSurfaceLocator(page);
    await expect(surface).toBeVisible();

    const surfaceHandle = await surface.elementHandle();
    const focusablesInSurface = await surface
      .locator("button, input, select, textarea, [tabindex]")
      .count();
    expect(focusablesInSurface).toBeGreaterThan(0);

    // Tab enough times to have wrapped at least once within the surface.
    for (let i = 0; i < focusablesInSurface + 2; i++) {
      await page.keyboard.press("Tab");
      const stillInSurface = await page.evaluate(
        (el) => el.contains(document.activeElement),
        surfaceHandle
      );
      expect(stillInSurface).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(surface).toBeHidden();
    await expect(node).toBeFocused();
  });

  test("desktop: opening a field grows the app body to three columns without overflow", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "panel layout is desktop-only"
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.locator('[data-path="party.testator.name"]').first().click();

    await expect(page.locator(".app-body.with-panel")).toBeVisible();
    const overflowsX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflowsX).toBe(false);
  });

  test("tapping the testimonium day blank opens the composite date field, and setting it updates all three blanks", async ({
    page,
  }) => {
    const dayBlank = page
      .locator('[data-path="execution.executionDate.day"]')
      .first();
    await dayBlank.click();

    const surface = await openSurfaceLocator(page);
    await expect(surface).toBeVisible();
    // Resolves up to the composite field, not a per-part text input.
    await expect(page.locator("#field-execution-executionDate")).toBeVisible();

    await page.locator("#field-execution-executionDate").fill("2026-09-21");

    await expect(
      page.locator('[data-path="execution.executionDate.day"]').first()
    ).toHaveText("21st");
    await expect(
      page.locator('[data-path="execution.executionDate.month"]').first()
    ).toHaveText("September");
    await expect(
      page.locator('[data-path="execution.executionDate.year"]').first()
    ).toHaveText("2026");
  });

  test("desktop: Next never scrolls the window", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "window scroll is a desktop layout defect"
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const node = page.locator('[data-path="party.testator.name"]').first();
    await node.click();

    const scrollYBefore = await page.evaluate(() => window.scrollY);
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Next →" }).click();
      const scrollYAfter = await page.evaluate(() => window.scrollY);
      expect(scrollYAfter).toBe(scrollYBefore);
    }
  });

  test("Guardians and Conservators shows both guidance entries", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page
      .locator(".rail-item", { hasText: "Guardians and Conservators" })
      .click();

    const surface = await openSurfaceLocator(page);
    await expect(surface.locator(".field-guidance")).toHaveCount(2);
    await expect(surface).toContainText("Conservator of the Estate");
  });

  test("children list rows lay out horizontally on the mobile bottom sheet", async ({
    page,
  }) => {
    // Rail navigation needs the desktop breakpoint (app.css:102); open the
    // section there, then narrow to the mobile bottom sheet to check the
    // row layout the fix targets.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.locator(".rail-item", { hasText: "Children" }).click();
    await page
      .locator(".context-panel")
      .getByRole("button", { name: "Add Child" })
      .click();

    await page.setViewportSize({ width: 393, height: 852 });

    const row = page.locator(".bottom-sheet .field-list-row").first();
    const input = row.locator("input");
    const button = row.locator("button");

    const inputBox = await input.boundingBox();
    const buttonBox = await button.boundingBox();
    expect(Math.abs(inputBox.y - buttonBox.y)).toBeLessThan(5);
  });

  test("console clean, no non-localhost requests", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const externalRequests = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
        externalRequests.push(request.url());
      }
    });

    await page.goto("/");
    await page.locator('[data-path="party.testator.name"]').first().click();
    await page.getByRole("button", { name: "Close" }).click();

    expect(consoleErrors).toEqual([]);
    expect(externalRequests).toEqual([]);
  });
});
