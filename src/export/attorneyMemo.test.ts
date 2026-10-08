import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GOLDEN_CASES, buildV2Profile } from "../documents/will/goldenFixtures";
import { migrateProfile } from "../model/migrate";
import { DOCUMENTS } from "../documents/registry";
import { documentMemo, generateAttorneyMemo } from "./attorneyMemo";

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

describe("documentMemo", () => {
  const baseline = GOLDEN_CASES.find((c) => c.slug === "03-baseline")!;
  const migrated = migrateProfile(
    "profile-1",
    buildV2Profile(baseline.slug, baseline.overlay)
  );
  if (!migrated.success) throw new Error("fixture does not migrate");
  const plan = migrated.plan;

  it("is registered for every document", () => {
    for (const document of DOCUMENTS) {
      expect(document.memo(plan)).toContain("ATTORNEY MEMORANDUM");
    }
  });

  it("lists answered fields and advisories for a non-will document", () => {
    const directive = DOCUMENTS.find((d) => d.id === "remains-directive")!;
    const withAgent = {
      ...plan,
      fiduciaries: {
        ...plan.fiduciaries,
        remains: { ...plan.fiduciaries.remains, agent: "Pat Doe" },
      },
    };
    const memo = directive.memo(withAgent);
    expect(memo).toContain(directive.title);
    expect(memo).toContain("DESIGNATION OF AGENT (ARTICLE 1)");
    expect(memo).toContain("- Agent: Pat Doe");
    expect(memo).toContain("ADVISORIES RAISED");
    expect(memo).toBe(documentMemo(directive, withAgent));
  });

  it("leaves the execution record out", () => {
    for (const document of DOCUMENTS.filter((d) => d.id !== "will")) {
      expect(document.memo(plan)).not.toContain("City of Execution");
    }
  });
});
