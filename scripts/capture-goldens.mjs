#!/usr/bin/env node
// Freezes the current app's rendered will output for every reachable branch,
// so Phase 3's JSX port of js/templates/will.js can be checked structurally
// against these goldens instead of by eye. Drives Playwright directly
// (rather than through the test runner) so it can be re-run on demand
// without touching test-results/. See
// /Users/kjiwa/.claude/plans/implement-the-next-step-piped-tome.md.

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { BLANK_PROFILE } from "../js/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GOLDEN_DIR = path.join(ROOT, "test/golden");
const BASE_URL = "http://127.0.0.1:8080";
const STORAGE_KEY = "estate_templates_state_v1";

// Shared by every case derived from the married baseline (03-20 except the
// blank-profile pair). Each derived case overlays only the fields that pin
// the branch it's named for.
const BASE_OVERLAY = {
  testator: {
    name: "Jordan A. Whitfield",
    gender: "male",
    county: "King",
    state: "Washington",
  },
  maritalStatus: "married",
  spouse: { name: "Taylor B. Whitfield", gender: "female" },
  children: ["Rowan C. Whitfield", "Sage D. Whitfield"],
  guardians: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
  conservators: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
  personalRepresentatives: {
    primary: "Taylor B. Whitfield",
    alternate: "Devin G. Osei",
  },
  trustees: { primary: "Casey E. Nolan", alternate: "Priya F. Iyer" },
  ultimateBeneficiary: {
    relationship: "sister",
    name: "Robin H. Whitfield",
    gender: "female",
  },
  survivorshipDays: 60,
  spousalGift: "outright",
  communityPropertyAgreement: { exists: false, date: "" },
  remains: { agent: "", alternate: "", preference: "" },
  witnesses: [
    {
      name: "Alex I. Kowalski",
      address: "100 Main St",
      cityStateZip: "Tacoma, WA 98402",
    },
    {
      name: "Morgan J. Petrova",
      address: "200 Oak St",
      cityStateZip: "Tacoma, WA 98402",
    },
  ],
  notary: { name: "Jamie K. Okonkwo", commissionExpires: "2028-01-01" },
  city: "Tacoma",
  executionDate: { day: "15", month: "March", year: "2026" },
};

const CASES = [
  { slug: "01-blank-highlights-on", highlights: true, overlay: {} },
  { slug: "02-blank-highlights-off", highlights: false, overlay: {} },
  { slug: "03-baseline", overlay: BASE_OVERLAY },
  {
    slug: "04-cpa-on",
    overlay: {
      ...BASE_OVERLAY,
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
    },
  },
  {
    slug: "05-disclaimer-trust",
    overlay: { ...BASE_OVERLAY, spousalGift: "disclaimerTrust" },
  },
  {
    slug: "06-disclaimer-trust-cpa",
    overlay: {
      ...BASE_OVERLAY,
      spousalGift: "disclaimerTrust",
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
    },
  },
  {
    slug: "07-unmarried-2-children",
    overlay: { ...BASE_OVERLAY, maritalStatus: "unmarried" },
  },
  {
    slug: "08-unmarried-0-children",
    overlay: { ...BASE_OVERLAY, maritalStatus: "unmarried", children: [] },
  },
  {
    slug: "09-married-0-children",
    overlay: { ...BASE_OVERLAY, children: [] },
  },
  {
    slug: "10-one-child",
    overlay: { ...BASE_OVERLAY, children: ["Rowan C. Whitfield"] },
  },
  {
    slug: "11-three-children",
    overlay: {
      ...BASE_OVERLAY,
      children: ["Rowan C. Whitfield", "Sage D. Whitfield", "Wren E. Ito"],
    },
  },
  { slug: "12-pr-is-spouse", overlay: BASE_OVERLAY },
  {
    slug: "13-pr-not-spouse",
    overlay: {
      ...BASE_OVERLAY,
      personalRepresentatives: {
        primary: "Elliot L. Marsh",
        alternate: "Devin G. Osei",
      },
    },
  },
  {
    slug: "14-unmarried-stale-spouse",
    overlay: {
      ...BASE_OVERLAY,
      maritalStatus: "unmarried",
      personalRepresentatives: {
        primary: "Taylor B. Whitfield",
        alternate: "Devin G. Osei",
      },
    },
  },
  {
    slug: "15-remains-preference",
    overlay: {
      ...BASE_OVERLAY,
      remains: {
        agent: "Casey E. Nolan",
        alternate: "Priya F. Iyer",
        preference: "cremation, with ashes scattered at sea",
      },
    },
  },
  {
    slug: "16a-gender-male",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "male" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "male" },
      ultimateBeneficiary: {
        ...BASE_OVERLAY.ultimateBeneficiary,
        gender: "male",
      },
    },
  },
  {
    slug: "16b-gender-female",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "female" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "female" },
      ultimateBeneficiary: {
        ...BASE_OVERLAY.ultimateBeneficiary,
        gender: "female",
      },
    },
  },
  {
    slug: "16c-gender-nonbinary",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "nonbinary" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "nonbinary" },
      ultimateBeneficiary: {
        ...BASE_OVERLAY.ultimateBeneficiary,
        gender: "nonbinary",
      },
    },
  },
  {
    slug: "16d-gender-unset",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, gender: "" },
      spouse: { ...BASE_OVERLAY.spouse, gender: "" },
      ultimateBeneficiary: { ...BASE_OVERLAY.ultimateBeneficiary, gender: "" },
    },
  },
  {
    slug: "17-survivorship-5",
    overlay: { ...BASE_OVERLAY, survivorshipDays: 5 },
  },
  {
    slug: "18-escaping",
    overlay: {
      ...BASE_OVERLAY,
      testator: {
        ...BASE_OVERLAY.testator,
        name: `<script>alert(1)</script> & "quoted" 'quoted'`,
      },
    },
  },
  {
    slug: "19-unmarried-cpa-flag",
    overlay: {
      ...BASE_OVERLAY,
      maritalStatus: "unmarried",
      communityPropertyAgreement: { exists: true, date: "2020-06-01" },
    },
  },
  {
    slug: "20-blank-county-state",
    overlay: {
      ...BASE_OVERLAY,
      testator: { ...BASE_OVERLAY.testator, county: "", state: "" },
    },
  },
];

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (Array.isArray(value)) {
      target[key] = value;
    } else if (value && typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object") target[key] = {};
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function buildProfile(slug, overlay) {
  const profile = {
    id: "profile-1",
    label: slug,
    ...structuredClone(BLANK_PROFILE),
  };
  deepMerge(profile, overlay);
  return profile;
}

async function isServerUp() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

async function startServer() {
  if (await isServerUp()) {
    return async () => {};
  }

  const server = spawn(
    "python3",
    ["-m", "http.server", "8080", "--bind", "127.0.0.1"],
    { cwd: ROOT, stdio: "ignore" }
  );

  const deadline = Date.now() + 10000;
  while (!(await isServerUp())) {
    if (Date.now() > deadline) {
      server.kill();
      throw new Error("Timed out waiting for http://127.0.0.1:8080");
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return async () => {
    server.kill();
  };
}

function seedPayload(profile, highlights) {
  return {
    schemaVersion: 2,
    activeProfileId: "profile-1",
    profiles: { "profile-1": profile },
    highlightVariables: highlights ?? true,
    zoom: "100",
  };
}

async function writeGolden(filename, content) {
  await writeFile(path.join(GOLDEN_DIR, filename), `${content}\n`);
}

async function captureCase(browser, testCase) {
  const profile = buildProfile(testCase.slug, testCase.overlay);
  const context = await browser.newContext({ baseURL: BASE_URL });
  await context.addInitScript(
    ({ key, payload }) =>
      window.localStorage.setItem(key, JSON.stringify(payload)),
    { key: STORAGE_KEY, payload: seedPayload(profile, testCase.highlights) }
  );

  const page = await context.newPage();
  await page.goto("/");
  await page.waitForSelector("#document-sheet .article-header");

  const html = await page.locator("#document-sheet").innerHTML();
  await writeGolden(`${testCase.slug}.html`, html);

  const memo = await page.evaluate(async () => {
    // @ts-ignore
    const { generateAttorneyMemo } = await import("./js/export.js");
    // @ts-ignore
    const { getActiveProfile } = await import("./js/state.js");
    return generateAttorneyMemo(getActiveProfile());
  });
  await writeGolden(`${testCase.slug}.memo.txt`, memo);

  if (testCase.slug === "03-baseline") {
    const standalone = await page.evaluate(async () => {
      // @ts-ignore
      const { generateStandaloneHtml } = await import("./js/export.js");
      return generateStandaloneHtml("will");
    });
    await writeGolden("standalone.html", standalone);
  }

  await context.close();
}

async function main() {
  await mkdir(GOLDEN_DIR, { recursive: true });
  const stopServer = await startServer();
  const browser = await chromium.launch();

  try {
    for (const testCase of CASES) {
      await captureCase(browser, testCase);
      console.log(`captured ${testCase.slug}`);
    }
  } finally {
    await browser.close();
    await stopServer();
  }

  console.log(`\nWrote ${CASES.length * 2 + 1} golden files to test/golden/`);
}

main().catch((err) => {
  console.error("Golden capture crashed:", err);
  process.exitCode = 1;
});
