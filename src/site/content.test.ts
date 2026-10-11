import { describe, expect, it } from "vitest";

import { DOCUMENTS } from "../documents/registry";
import { CONTENT } from "./content";
import { SITE_PAGES } from "./pages";

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

describe("site content", () => {
  it("has an entry for every registered document and no others", () => {
    expect(Object.keys(CONTENT).sort()).toEqual(
      DOCUMENTS.map((doc) => doc.id).sort()
    );
  });

  it("gives every page a unique path, title, and description", () => {
    for (const field of ["path", "title", "description"] as const) {
      const values = SITE_PAGES.map((page) => page[field]);
      expect(unique(values), field).toBe(true);
    }
    for (const page of SITE_PAGES) {
      expect(page.title.trim()).not.toBe("");
      expect(page.description.trim()).not.toBe("");
    }
  });

  it("has a page for every document", () => {
    for (const doc of DOCUMENTS) {
      expect(SITE_PAGES.map((page) => page.path)).toContain(
        `documents/${doc.id}/`
      );
    }
  });
});
