import { describe, expect, it } from "vitest";

import { getPronouns } from "./pronouns";

describe("getPronouns", () => {
  it("returns female pronouns", () => {
    expect(getPronouns("female").subjective).toBe("she");
    expect(getPronouns("F").possessive).toBe("her");
  });

  it("returns male pronouns", () => {
    expect(getPronouns("male").subjective).toBe("he");
    expect(getPronouns("M").possessive).toBe("his");
  });

  it("returns neutral pronouns for nonbinary", () => {
    expect(getPronouns("nonbinary").subjective).toBe("they");
  });

  it("returns neutral pronouns for absent or unrecognized gender", () => {
    expect(getPronouns(undefined).subjective).toBe("they");
    expect(getPronouns("").subjective).toBe("they");
    expect(getPronouns("unicorn").subjective).toBe("they");
  });
});
