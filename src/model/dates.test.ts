import { describe, expect, it } from "vitest";

import { fromIsoDate, toIsoDate } from "./dates";

describe("toIsoDate", () => {
  it("converts a stored execution date to ISO", () => {
    expect(toIsoDate({ day: "1st", month: "September", year: "2026" })).toBe(
      "2026-09-01"
    );
  });

  it("pads single-digit days and months", () => {
    expect(toIsoDate({ day: "3rd", month: "January", year: "2026" })).toBe(
      "2026-01-03"
    );
  });

  it("returns empty string when the day is missing", () => {
    expect(toIsoDate({ day: "", month: "September", year: "2026" })).toBe("");
  });

  it("returns empty string when the month is missing", () => {
    expect(toIsoDate({ day: "1st", month: "", year: "2026" })).toBe("");
  });

  it("returns empty string when the year is missing", () => {
    expect(toIsoDate({ day: "1st", month: "September", year: "" })).toBe("");
  });

  it("returns empty string for an unparseable day", () => {
    expect(toIsoDate({ day: "first", month: "September", year: "2026" })).toBe(
      ""
    );
  });

  it("returns empty string for an unparseable month", () => {
    expect(toIsoDate({ day: "1st", month: "Septober", year: "2026" })).toBe("");
  });

  it("returns empty string for a non-four-digit year", () => {
    expect(toIsoDate({ day: "1st", month: "September", year: "26" })).toBe("");
  });
});

describe("fromIsoDate", () => {
  it("returns empty parts for an empty string", () => {
    expect(fromIsoDate("")).toEqual({ day: "", month: "", year: "" });
  });

  it("returns empty parts for a malformed string", () => {
    expect(fromIsoDate("not-a-date")).toEqual({
      day: "",
      month: "",
      year: "",
    });
  });

  const cases: Array<[string, string]> = [
    ["2026-09-01", "1st"],
    ["2026-09-02", "2nd"],
    ["2026-09-03", "3rd"],
    ["2026-09-04", "4th"],
    ["2026-09-11", "11th"],
    ["2026-09-12", "12th"],
    ["2026-09-13", "13th"],
    ["2026-09-21", "21st"],
    ["2026-09-22", "22nd"],
    ["2026-09-23", "23rd"],
    ["2026-09-31", "31st"],
  ];

  for (const [iso, expectedDay] of cases) {
    it(`renders the ordinal suffix for ${iso}`, () => {
      expect(fromIsoDate(iso)).toEqual({
        day: expectedDay,
        month: "September",
        year: "2026",
      });
    });
  }

  it("round-trips through toIsoDate", () => {
    const stored = { day: "21st", month: "September", year: "2026" };
    expect(fromIsoDate(toIsoDate(stored))).toEqual(stored);
  });

  it("round-trips through fromIsoDate", () => {
    const iso = "2026-01-11";
    expect(toIsoDate(fromIsoDate(iso))).toBe(iso);
  });
});
