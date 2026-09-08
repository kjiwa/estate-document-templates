// @ts-check
const { test, expect } = require("@playwright/test");
const { PLAN_1 } = require("./fixtures");

// PLAN_1 with witness 1 renamed to match the PR alternate ("Devin Okafor"),
// so `analyzeProfile` fires an interested-witness advisory concerning
// `execution.witnesses.0.name` — the scenario the rail badge, the rail's
// advisory list, and the inline marker beside the attestation blank all
// need something real to render.
// Also fills in the execution date, which PLAN_1 leaves blank — otherwise
// "execution-date-unset" fires alongside the interested-witness advisory,
// muddying the single-advisory assertions below.
const PLAN_WITH_INTERESTED_WITNESS = {
  ...PLAN_1,
  execution: {
    ...PLAN_1.execution,
    executionDate: { day: "1st", month: "September", year: "2026" },
    witnesses: [
      {
        name: "Devin Okafor",
        address: "1 Main St",
        cityStateZip: "Tacoma, WA",
      },
      { name: "", address: "", cityStateZip: "" },
    ],
  },
};

async function seedInterestedWitnessPlan(page) {
  await page.addInitScript((plan) => {
    const KEY = "estate_templates_state_v1";
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        schemaVersion: 3,
        activePlanId: "profile-1",
        activeDocumentId: "will",
        plans: { "profile-1": plan },
      })
    );
  }, PLAN_WITH_INTERESTED_WITNESS);
}

test.describe("Review advisories", () => {
  test.beforeEach(async ({ page }) => {
    await seedInterestedWitnessPlan(page);
  });

  test("desktop: rail shows an advisory badge on the witnesses section and lists the advisory", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "rail is desktop-only"
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const witnessesItem = page.locator(".rail-item", {
      hasText: "Witnesses",
    });
    await expect(witnessesItem.locator(".rail-advisory-count")).toHaveText("1");

    // PLAN_1 has other, unrelated advisories baked in (e.g. Casey Delacroix
    // holding several fiduciary roles), so the rail's total isn't 1 — only
    // the witnesses section's own badge is asserted above; here just confirm
    // the interested-witness advisory is present in the flat list.
    await expect(
      page.locator(".advisory", { hasText: "Interested witness" })
    ).toBeVisible();
  });

  test("desktop: the inline warning marker sits beside the attestation blank and 'View' opens the field with the advisory text in the panel", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "context panel is desktop-only"
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const marker = page
      .locator('[data-path="execution.witnesses.0.name"]')
      .locator(
        "xpath=following-sibling::button[contains(@class,'advisory-inline')]"
      )
      .first();
    await expect(marker).toBeVisible();
    await marker.click();

    const panel = page.locator(".context-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".advisory")).toContainText(
      "Witness Devin Okafor is also named as alternate personal representative"
    );
    await expect(
      page.locator("#field-execution-witnesses-0-name")
    ).toBeVisible();
  });

  test("desktop: rail's 'View' button opens the field with the advisory visible in the panel", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "rail is desktop-only"
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page
      .locator(".advisory", { hasText: "Interested witness" })
      .getByRole("button", { name: "View" })
      .click();

    const panel = page.locator(".context-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".advisory")).toContainText(
      "Witness Devin Okafor is also named as alternate personal representative"
    );
  });

  test("mobile: the inline warning marker opens the bottom sheet with the advisory text visible", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chrome",
      "bottom sheet is mobile-only"
    );
    await page.goto("/");

    const marker = page
      .locator('[data-path="execution.witnesses.0.name"]')
      .locator(
        "xpath=following-sibling::button[contains(@class,'advisory-inline')]"
      )
      .first();
    await marker.click();

    const sheet = page.locator(".bottom-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.locator(".advisory")).toContainText(
      "Witness Devin Okafor is also named as alternate personal representative"
    );
  });
});
