#!/usr/bin/env node
// Regexes every RCW citation out of src/documents/**/*.{ts,tsx} (the only
// place citations live now that js/ is retired), fetches each section from
// app.leg.wa.gov, and diffs its history note against the checked-in
// legal/citations.json snapshot. Run monthly by
// .github/workflows/citation-check.yml, or by hand via
// `npm run check:citations`.
//
// Deviation from the original plan: app.leg.wa.gov returns HTTP 200 for an
// unknown citation, not 404 (verified this session) — a repealed or
// renumbered section is detected by the page containing the literal text
// "Citation not found" instead.

import { glob, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE_GLOB = "src/documents/**/*.{ts,tsx}";
const CITATIONS_SNAPSHOT_PATH = path.join(ROOT, "legal/citations.json");
const CITATION_PATTERN = /RCW\s+(\d+\.\d+(?:\.\d+)?)/g;

async function extractCitations() {
  const citations = new Set();
  for await (const relativePath of glob(SOURCE_GLOB, { cwd: ROOT })) {
    const text = await readFile(path.join(ROOT, relativePath), "utf8");
    for (const match of text.matchAll(CITATION_PATTERN)) {
      citations.add(match[1]);
    }
  }
  return [...citations].sort();
}

function extractHistoryNote(html) {
  const matches = [...html.matchAll(/<div[^>]*>\[(.*?)\]<\/div>/gs)];
  if (matches.length === 0) return null;
  const raw = matches[matches.length - 1][1];
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchCitation(cite) {
  const url = `https://app.leg.wa.gov/RCW/default.aspx?cite=${encodeURIComponent(cite)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "estate-document-templates-citation-check" },
  });
  const html = await response.text();
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  if (text.includes("Citation not found")) {
    return { cite, notFound: true, history: null };
  }
  return { cite, notFound: false, history: extractHistoryNote(html) };
}

async function loadSnapshot() {
  const raw = await readFile(CITATIONS_SNAPSHOT_PATH, "utf8");
  return JSON.parse(raw).citations;
}

async function main() {
  const citations = await extractCitations();
  const snapshot = await loadSnapshot();
  const failures = [];

  console.log(
    `Checking ${citations.length} RCW citation(s) against app.leg.wa.gov...`
  );

  for (const cite of citations) {
    let result;
    try {
      result = await fetchCitation(cite);
    } catch (err) {
      failures.push(`RCW ${cite}: fetch failed — ${err.message}`);
      continue;
    }

    if (result.notFound) {
      failures.push(
        `RCW ${cite}: citation not found at app.leg.wa.gov — likely repealed or renumbered.`
      );
      continue;
    }

    const snapshotHistory = snapshot[cite];
    if (snapshotHistory === undefined) {
      failures.push(
        `RCW ${cite}: cited in source but missing from legal/citations.json — add its history note to the snapshot.`
      );
      continue;
    }

    if (result.history !== snapshotHistory) {
      failures.push(
        `RCW ${cite}: history note changed.\n    was: ${snapshotHistory}\n    now: ${result.history}`
      );
      continue;
    }

    console.log(`  OK  RCW ${cite}`);
  }

  if (failures.length > 0) {
    console.error("\nCitation check failed:\n");
    failures.forEach((message) => console.error(`  - ${message}`));
    console.error(
      "\nIf a change is legitimate (a real amendment), update legal/citations.json to match and commit it."
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nAll citations match the checked-in snapshot.");
}

main().catch((err) => {
  console.error("Citation check crashed:", err);
  process.exitCode = 1;
});
