import { describe, expect, it } from "vitest";

import { normalizeName } from "./names";

describe("normalizeName", () => {
  it("trims and lowercases", () => {
    expect(normalizeName("  Jordan A. Whitfield  ")).toBe(
      "jordan a. whitfield"
    );
  });

  it("returns an empty string for null/undefined", () => {
    expect(normalizeName(undefined)).toBe("");
    expect(normalizeName(null)).toBe("");
  });
});
