import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const html = readFileSync("index.html", "utf8");

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

describe("index.html CSP", () => {
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
