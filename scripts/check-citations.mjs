#!/usr/bin/env node
// Extracts RCW citations from src/documents (excluding tests and fixtures)
// and diffs each section's history note on app.leg.wa.gov against
// legal/citations.json. Run monthly by .github/workflows/citation-check.yml.
//
// app.leg.wa.gov returns HTTP 200 for an unknown citation, so a missing
// section is detected by the literal text "Citation not found".

import { glob, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE_GLOB = "src/documents/**/*.{ts,tsx}";
const EXCLUDED_SOURCE = /\.test\.|goldenFixtures/;
const FETCH_TIMEOUT_MS = 30000;
const CITATIONS_SNAPSHOT_PATH = path.join(ROOT, "legal/citations.json");
// Matches a section cite ("RCW 68.50.160") or a whole-chapter cite ("chapter
// 11.130 RCW"). A chapter page has no history note, so its snapshot is `null`.
const CITATION_PATTERN =
  /RCW\s+(\d+\.\d+(?:\.\d+)?)|chapter\s+(\d+\.\d+)\s+RCW/g;

async function extractCitations() {
  const citations = new Set();
  for await (const relativePath of glob(SOURCE_GLOB, { cwd: ROOT })) {
    if (EXCLUDED_SOURCE.test(relativePath)) continue;
    const text = await readFile(path.join(ROOT, relativePath), "utf8");
    for (const match of text.matchAll(CITATION_PATTERN)) {
      citations.add(match[1] ?? match[2]);
    }
  }
  return [...citations].sort();
}

function htmlToText(html, replacement) {
  return html
    .replace(/<[^>]+>/g, replacement)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHistoryNote(html) {
  const matches = [...html.matchAll(/<div[^>]*>\[(.*?)\]<\/div>/gs)];
  if (matches.length === 0) return null;
  return htmlToText(matches[matches.length - 1][1], "");
}

async function fetchCitation(cite) {
  const url = `https://app.leg.wa.gov/RCW/default.aspx?cite=${encodeURIComponent(cite)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "estate-document-templates-citation-check" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const text = htmlToText(html, " ");

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
      failures.push(`RCW ${cite}: fetch failed - ${err.message}`);
      continue;
    }

    if (result.notFound) {
      failures.push(
        `RCW ${cite}: citation not found at app.leg.wa.gov - likely repealed or renumbered.`
      );
      continue;
    }

    const snapshotHistory = snapshot[cite];
    if (snapshotHistory === undefined) {
      failures.push(
        `RCW ${cite}: cited in source but missing from legal/citations.json - add its history note to the snapshot.`
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
