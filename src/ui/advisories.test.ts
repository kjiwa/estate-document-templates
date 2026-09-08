import { beforeEach, describe, expect, it } from "vitest";

import { activePlanId, plans, setField } from "../store/index";
import {
  advisories,
  advisoriesByPath,
  advisoriesBySection,
  showAdvisory,
} from "./advisories";
import { activeFieldPath, activeSectionId, closeEditor } from "./editing";

beforeEach(() => {
  closeEditor();
  activePlanId.value = "profile-1";
  // A clean slate: no advisories fire against the blank default plan.
  plans.value = {
    ...plans.value,
    "profile-1": plans.value["profile-1"]!,
  };
});

describe("advisoriesByPath / advisoriesBySection", () => {
  it("groups an interested-witness advisory under the witnesses section", () => {
    setField("fiduciaries.personalRepresentatives.alternate", "Alex Kowalski");
    setField("execution.witnesses.0.name", "Alex Kowalski");

    const byPath = advisoriesByPath.value;
    const witnessAdvisories = byPath.get("execution.witnesses.0.name");
    expect(witnessAdvisories?.length).toBe(1);
    expect(witnessAdvisories?.[0]?.title).toBe("Interested witness");

    const bySection = advisoriesBySection.value;
    const witnessesSection = bySection.get("witnesses");
    expect(witnessesSection?.length).toBe(1);
    expect(witnessesSection?.[0]?.title).toBe("Interested witness");
  });

  it("every advisory the plan produces lands in exactly one section bucket", () => {
    const bySection = advisoriesBySection.value;
    const grouped = [...bySection.values()].flat();
    expect(grouped.length).toBe(advisories.value.length);
  });
});

describe("showAdvisory", () => {
  it("opens the field the advisory's path resolves to", () => {
    setField("fiduciaries.personalRepresentatives.alternate", "Alex Kowalski");
    setField("execution.witnesses.0.name", "Alex Kowalski");

    const advisory = advisories.value.find(
      (a) => a.title === "Interested witness"
    )!;
    showAdvisory(advisory);

    expect(activeFieldPath.value).toBe("execution.witnesses.0.name");
    expect(activeSectionId.value).toBe("witnesses");
  });

  // `collectRoleHolders` emits `party.children.0` for a child role holder,
  // one level deeper than the "children" section's declared list field
  // (`party.children`) — `resolveFieldPath`'s prefix fallback (exercised
  // directly in `src/form/registry.test.ts`) is what lets an advisory
  // concerning a specific child still resolve to a real, openable field.
  it("resolves an advisory whose path is a child array element via the party.children.0 prefix fallback", () => {
    setField("party.children", ["Alex Kowalski"]);
    showAdvisory({
      id: "test-child-advisory",
      severity: "info",
      title: "Test",
      message: "Test",
      path: "party.children.0" as never,
    });

    expect(activeFieldPath.value).toBe("party.children");
    expect(activeSectionId.value).toBe("children");
  });

  it("does nothing for an advisory whose path resolves to no field", () => {
    showAdvisory({
      id: "test-unresolvable",
      severity: "info",
      title: "Test",
      message: "Test",
      path: "not.a.real.path" as never,
    });

    expect(activeFieldPath.value).toBeNull();
  });
});
