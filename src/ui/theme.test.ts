import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function stubDom(stored: string | null, prefersDark?: boolean) {
  const attrs: Record<string, string> = {};
  const metas = [{ content: "" }, { content: "" }].map((meta) => ({
    ...meta,
    setAttribute: function (k: string, v: string) {
      if (k === "content") this.content = v;
    },
  }));
  const storage = { getItem: () => stored, setItem: () => {} };
  vi.stubGlobal(
    "window",
    prefersDark === undefined
      ? { localStorage: storage }
      : {
          localStorage: storage,
          matchMedia: () => ({
            matches: prefersDark,
            addEventListener: () => {},
          }),
        }
  );
  vi.stubGlobal("document", {
    documentElement: {
      setAttribute: (k: string, v: string) => {
        attrs[k] = v;
      },
    },
    querySelectorAll: (selector: string) =>
      selector === 'meta[name="theme-color"]' ? metas : [],
  });
  return { attrs, metas };
}

describe("theme without matchMedia", () => {
  it("loads and resolves system to light", async () => {
    const { attrs } = stubDom(null);
    await import("./theme");
    expect(attrs["data-theme"]).toBe("light");
  });
});

describe("theme-color meta", () => {
  it("follows a chosen light theme over a dark OS", async () => {
    const { attrs, metas } = stubDom("light", true);
    await import("./theme");
    expect(attrs["data-theme"]).toBe("light");
    expect(metas.map((m) => m.content)).toEqual(["#f5f1ea", "#f5f1ea"]);
  });

  it("follows a chosen dark theme and updates on change", async () => {
    const { attrs, metas } = stubDom("dark", false);
    const { setTheme } = await import("./theme");
    expect(attrs["data-theme"]).toBe("dark");
    expect(metas.map((m) => m.content)).toEqual(["#141311", "#141311"]);
    setTheme("light");
    expect(metas.map((m) => m.content)).toEqual(["#f5f1ea", "#f5f1ea"]);
  });
});
