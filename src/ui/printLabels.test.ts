import { describe, expect, it } from "vitest";

import { escapeCssString } from "./printLabels";

describe("escapeCssString", () => {
  it("escapes backslash and quote", () => {
    expect(escapeCssString('a\\b"c')).toBe('a\\\\b\\"c');
  });

  it("hex-escapes angle brackets so </style> cannot appear", () => {
    const out = escapeCssString("</style>");
    expect(out).not.toContain("<");
    expect(out).toContain("\\3C ");
  });

  it("hex-escapes newlines and control characters", () => {
    const out = escapeCssString("a\nb\rc\fd\u0000e\u001ff");
    expect(Array.from(out).every((c) => c.charCodeAt(0) >= 0x20)).toBe(true);
    expect(out).toContain("\\A ");
  });
});
