import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { TERMS_VERSION } from "./terms";

describe("TERMS_VERSION", () => {
  it("matches the version the e2e fixtures seed", () => {
    const fixtures = readFileSync("test/fixtures.js", "utf8");
    expect(fixtures).toContain(`"${TERMS_VERSION}"`);
  });
});
