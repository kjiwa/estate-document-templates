import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";

import { migrateProfile } from "../../model/migrate";
import type { Plan } from "../../model/plan";
import { EditingContext, HighlightContext, PlanContext } from "./PlanContext";
import { Value } from "./Value";

function plan(): Plan {
  const result = migrateProfile("profile-1", { label: "Profile 1" });
  if (!result.success) throw new Error(result.error);
  return result.plan;
}

function renderValue(isEditable: (path: string) => boolean): string {
  return render(
    <PlanContext.Provider value={plan()}>
      <HighlightContext.Provider value={true}>
        <EditingContext.Provider
          value={{
            activePath: null,
            interactive: true,
            labelFor: (path) => path,
            isEditable,
            advisoriesFor: () => [],
          }}
        >
          <Value path="party.testator.state" />
        </EditingContext.Provider>
      </HighlightContext.Provider>
    </PlanContext.Provider>
  );
}

describe("Value editing affordance", () => {
  it("is a button when the path is an editable field", () => {
    expect(renderValue(() => true)).toContain('role="button"');
  });

  it("is plain markup when the path is not an editable field", () => {
    const html = renderValue(() => false);
    expect(html).toContain("Washington");
    expect(html).not.toContain('role="button"');
  });
});
