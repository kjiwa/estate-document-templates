import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("theme without matchMedia", () => {
  it("loads and resolves system to light", async () => {
    const attrs: Record<string, string> = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", {
      documentElement: {
        setAttribute: (k: string, v: string) => {
          attrs[k] = v;
        },
      },
    });
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
    });
    await import("./theme");
    expect(attrs["data-theme"]).toBe("light");
  });
});
