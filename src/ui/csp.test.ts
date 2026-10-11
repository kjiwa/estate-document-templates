import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const PAGES = ["index.html", "app/index.html"];

const pages = PAGES.map((path) => ({
  path,
  html: readFileSync(path, "utf8"),
}));

function inlineScriptBodies(source: string): string[] {
  return [
    ...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
  ].map((match) => match[1] ?? "");
}

function scriptSrc(source: string): string {
  const csp = source.match(
    /http-equiv="Content-Security-Policy"\s+content="([^"]*)"/
  );
  const directive = (csp?.[1] ?? "")
    .split(";")
    .find((d) => d.trim().startsWith("script-src"));
  return directive ?? "";
}

describe.each(pages)("$path CSP", ({ html }) => {
  it("allows every inline script by sha256 hash", () => {
    const bodies = inlineScriptBodies(html);
    expect(bodies.length).toBeGreaterThan(0);
    const allowed = scriptSrc(html);
    for (const body of bodies) {
      const hash = createHash("sha256").update(body).digest("base64");
      expect(allowed).toContain(`'sha256-${hash}'`);
    }
  });
});

describe("page theme scripts", () => {
  it("are byte-identical across pages", () => {
    const [first, ...rest] = pages.map(
      ({ html }) => inlineScriptBodies(html)[0]
    );
    expect(first).toBeTruthy();
    for (const body of rest) expect(body).toBe(first);
  });
});
