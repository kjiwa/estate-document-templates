import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GOLDEN_CASES, buildV2Profile } from "../documents/will/goldenFixtures";
import { migrateProfile } from "../model/migrate";
import { generateAttorneyMemo } from "./attorneyMemo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN_DIR = path.resolve(__dirname, "../../test/golden");

describe("generateAttorneyMemo golden gate", () => {
  for (const testCase of GOLDEN_CASES) {
    it(`matches test/golden/${testCase.slug}.memo.txt exactly`, async () => {
      const v2Profile = buildV2Profile(testCase.slug, testCase.overlay);
      const migrated = migrateProfile("profile-1", v2Profile);
      expect(migrated.success).toBe(true);
      if (!migrated.success) return;

      const memo = generateAttorneyMemo(migrated.plan);
      const golden = (
        await readFile(
          path.join(GOLDEN_DIR, `${testCase.slug}.memo.txt`),
          "utf8"
        )
      ).replace(/\n$/, "");

      expect(memo).toBe(golden);
    });
  }
});
