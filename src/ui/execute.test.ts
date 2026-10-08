import { beforeEach, describe, expect, it } from "vitest";

import { activeDocumentId, plans, setField } from "../store/index";
import { copySources } from "./execute";

beforeEach(() => {
  setField("executions.will.city", "");
  setField("executions.remainsDirective.city", "");
  activeDocumentId.value = "remains-directive";
});

describe("copySources", () => {
  it("is empty when no other document has a record", () => {
    expect(copySources.value).toEqual([]);
  });

  it("offers documents with answers when the active record is empty", () => {
    setField("executions.will.city", "Tacoma");
    expect(copySources.value.map((d) => d.id)).toEqual(["will"]);
  });

  it("is empty once the active document's own record has an answer", () => {
    setField("executions.will.city", "Tacoma");
    setField("executions.remainsDirective.city", "Olympia");
    expect(copySources.value).toEqual([]);
    expect(plans.value["profile-1"]).toBeDefined();
  });
});
