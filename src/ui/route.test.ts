import { describe, expect, it } from "vitest";

import { parseRoute, serializeRoute } from "./route";

describe("parseRoute", () => {
  it("parses a view and document id", () => {
    expect(parseRoute("#/document/will")).toEqual({
      view: "document",
      documentId: "will",
    });
  });

  it("parses a view without a document id", () => {
    expect(parseRoute("#/plans")).toEqual({
      view: "plans",
      documentId: undefined,
    });
  });

  it("ignores unknown views and foreign hashes", () => {
    expect(parseRoute("#/nowhere/will")).toBeNull();
    expect(parseRoute("#main-content")).toBeNull();
    expect(parseRoute("")).toBeNull();
  });
});

describe("serializeRoute", () => {
  it("round-trips through parseRoute", () => {
    expect(parseRoute(serializeRoute("execute", "will"))).toEqual({
      view: "execute",
      documentId: "will",
    });
  });
});
