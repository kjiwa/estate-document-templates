import { beforeEach, describe, expect, it } from "vitest";

import { activePlanId } from "../store/index";
import {
  activeFieldPath,
  activeSectionId,
  canStepNext,
  canStepPrev,
  closeEditor,
  openField,
  openSection,
  stepField,
} from "./editing";

beforeEach(() => {
  closeEditor();
  activePlanId.value = "profile-1";
});

describe("openField", () => {
  it("sets the active path and its section for a known path", () => {
    openField("party.testator.name");
    expect(activeFieldPath.value).toBe("party.testator.name");
    expect(activeSectionId.value).toBe("testator");
  });

  it("ignores an unrecognized path", () => {
    openField("not.a.real.path");
    expect(activeFieldPath.value).toBeNull();
    expect(activeSectionId.value).toBeNull();
  });

  it("opens a field with no ruled blank in the document (marital status)", () => {
    openField("party.maritalStatus");
    expect(activeFieldPath.value).toBe("party.maritalStatus");
    expect(activeSectionId.value).toBe("family");
  });
});

describe("openSection", () => {
  it("opens the section's first field", () => {
    openSection("family");
    expect(activeSectionId.value).toBe("family");
    expect(activeFieldPath.value).toBe("party.maritalStatus");
  });

  it("ignores an unrecognized section id", () => {
    openSection("not-a-section");
    expect(activeSectionId.value).toBeNull();
  });
});

describe("closeEditor", () => {
  it("clears both signals and restores focus to the trigger element", () => {
    let focused = false;
    const trigger = {
      focus: () => {
        focused = true;
      },
    } as unknown as HTMLElement;

    openField("party.testator.name", trigger);
    closeEditor();

    expect(activeFieldPath.value).toBeNull();
    expect(activeSectionId.value).toBeNull();
    expect(focused).toBe(true);
  });
});

describe("stepField", () => {
  it("moves forward through orderedFields declaration order", () => {
    openField("party.testator.name");
    stepField(1);
    expect(activeFieldPath.value).toBe("party.testator.gender");
  });

  it("moves backward through orderedFields declaration order", () => {
    openField("party.testator.gender");
    stepField(-1);
    expect(activeFieldPath.value).toBe("party.testator.name");
  });

  it("clamps at the start: canStepPrev is false and stepField(-1) is a no-op", () => {
    openField("party.testator.name");
    expect(canStepPrev.value).toBe(false);
    stepField(-1);
    expect(activeFieldPath.value).toBe("party.testator.name");
  });

  it("clamps at the end: canStepNext is false and stepField(1) is a no-op", () => {
    openField("execution.executionDate");
    expect(canStepNext.value).toBe(false);
    stepField(1);
    expect(activeFieldPath.value).toBe("execution.executionDate");
  });
});
