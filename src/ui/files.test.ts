import { parseHTML } from "linkedom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { lastSavedAt, openFile, saveFile } from "./files";

// `saveFile`/`openFile` read the module-global `window`, which does not
// exist in Vitest's `node` environment — stubbed per test via
// `vi.stubGlobal`, restored afterward. The real File System Access picker
// cannot run in headless Chromium either, so both the feature-detected and
// fallback branches are exercised here with stand-ins.
function stubDom() {
  const { window } = parseHTML("<!doctype html><html><body></body></html>");
  // linkedom's `window` shares mutable state across `parseHTML` calls (a
  // property set on one instance is visible on the next) — explicitly
  // clearing the pickers keeps each test's feature-detection independent
  // of whichever earlier test last stubbed one.
  (window as unknown as Record<string, unknown>).showSaveFilePicker = undefined;
  (window as unknown as Record<string, unknown>).showOpenFilePicker = undefined;
  vi.stubGlobal("window", window);
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:stub"),
    revokeObjectURL: vi.fn(),
  });
  return window;
}

beforeEach(() => {
  lastSavedAt.value = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saveFile", () => {
  it("falls back to a Blob + anchor click when no picker is present", async () => {
    const window = stubDom();
    let clicked = false;
    const originalCreateElement = window.document.createElement.bind(
      window.document
    );
    window.document.createElement = ((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        el.click = () => {
          clicked = true;
        };
      }
      return el;
    }) as typeof window.document.createElement;

    const result = await saveFile("plan.json", "application/json", "{}");

    expect(result).toBe(true);
    expect(clicked).toBe(true);
    expect(lastSavedAt.value).not.toBeNull();
  });

  it("writes through showSaveFilePicker when present and sets lastSavedAt", async () => {
    const window = stubDom();
    let written = "";
    (window as unknown as Record<string, unknown>).showSaveFilePicker = vi.fn(
      async () => ({
        createWritable: async () => ({
          write: async (data: string) => {
            written = data;
          },
          close: async () => {},
        }),
      })
    );

    const result = await saveFile("plan.json", "application/json", "{}");

    expect(result).toBe(true);
    expect(written).toBe("{}");
    expect(lastSavedAt.value).not.toBeNull();
  });

  it("returns false and leaves lastSavedAt unset on a picker cancel", async () => {
    const window = stubDom();
    const abortError = Object.assign(new Error("cancelled"), {
      name: "AbortError",
    });
    (window as unknown as Record<string, unknown>).showSaveFilePicker = vi.fn(
      async () => {
        throw abortError;
      }
    );

    const result = await saveFile("plan.json", "application/json", "{}");

    expect(result).toBe(false);
    expect(lastSavedAt.value).toBeNull();
  });
});

describe("openFile", () => {
  it("reads through showOpenFilePicker when present", async () => {
    const window = stubDom();
    (window as unknown as Record<string, unknown>).showOpenFilePicker = vi.fn(
      async () => [
        {
          getFile: async () => ({ text: async () => "file contents" }),
        },
      ]
    );

    const result = await openFile(".json");
    expect(result).toBe("file contents");
  });

  it("resolves null on a picker cancel", async () => {
    const window = stubDom();
    const abortError = Object.assign(new Error("cancelled"), {
      name: "AbortError",
    });
    (window as unknown as Record<string, unknown>).showOpenFilePicker = vi.fn(
      async () => {
        throw abortError;
      }
    );

    const result = await openFile(".json");
    expect(result).toBeNull();
  });

  it("falls back to a hidden file input when no picker is present", async () => {
    const window = stubDom();
    const originalCreateElement = window.document.createElement.bind(
      window.document
    );
    window.document.createElement = ((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "input") {
        Object.defineProperty(el, "files", {
          value: [{ text: async () => "fallback contents" }],
        });
        queueMicrotask(() => el.dispatchEvent(new window.Event("change")));
      }
      return el;
    }) as typeof window.document.createElement;

    const result = await openFile(".json");
    expect(result).toBe("fallback contents");
  });
});
