// Assembles design/mockups/*.html from shared chrome partials and the
// _document.html fragment. Not part of the app build — a Phase 2 authoring
// convenience so the ~180 lines of real legal prose in _document.html are
// written once and reused verbatim across every mockup that shows the
// document, instead of being retyped per screen. Run once; the mockups it
// writes are checked-in static files reviewed like any other artifact.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const doc = readFileSync(join(here, "_document.html"), "utf8");

const head = (title, extraCss = []) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link rel="stylesheet" href="../tokens.css" />
<link rel="stylesheet" href="../mockup.css" />
${extraCss.map((h) => `<link rel="stylesheet" href="${h}" />`).join("\n")}
</head>
`;

const themeScript = `<script>
  (function () {
    var t = new URLSearchParams(location.search).get("theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
  })();
</script>`;

const header = (activeToggle) => `
<header class="app-header">
  <div class="header-brand">
    <strong class="app-title">Estate Document Templates</strong>
  </div>
  <div class="header-controls">
    <div class="presentation-toggle" role="group" aria-label="Presentation">
      <button class="${activeToggle === "reading" ? "active" : ""}" type="button">Reading</button>
      <button class="${activeToggle === "paper" ? "active" : ""}" type="button">Paper</button>
    </div>
  </div>
</header>`;

const rail = (activeIndex, extra = "") => `
<aside class="app-rail" aria-label="Document sections">
  <div class="rail-progress">
    <div class="rail-progress-bar"><div class="rail-progress-fill" style="width: 62%"></div></div>
    <span class="rail-progress-label">18 / 29 fields</span>
  </div>
  <ul class="rail-list">
    ${[
      "Family, Guardians, Conservators",
      "Disposition of Remains",
      "Disposition of Property",
      "Trust Beneficiaries",
      "Administration &amp; Fiduciaries",
      "Signing Day",
    ]
      .map(
        (
          label,
          i
        ) => `<li class="rail-item ${i === activeIndex ? "active" : ""}">
      <span class="rail-check ${i < activeIndex ? "done" : ""}"></span>
      <span>${label}</span>
      ${i === 1 ? '<span class="rail-advisory-count">1</span>' : ""}
    </li>`
      )
      .join("\n")}
  </ul>
  ${extra}
</aside>`;

function write(slug, title, body, { extraCss = [] } = {}) {
  const html = `${head(title, extraCss)}<body>
${themeScript}
${body}
</body>
</html>
`;
  mkdirSync(join(here, "mockups"), { recursive: true });
  writeFileSync(join(here, "mockups", `${slug}.html`), html);
}

// ---------------------------------------------------------------------
// 00 — token sheet
// ---------------------------------------------------------------------
const swatch = (varName, label) =>
  `<div class="card" style="padding:var(--space-3)">
    <div style="height:48px;border-radius:var(--radius-md);background:var(--${varName});border:1px solid var(--rule-hairline)"></div>
    <div style="margin-top:var(--space-2);font-size:var(--font-size-xs)"><code>--${varName}</code><br>${label}</div>
  </div>`;

write(
  "00-tokens",
  "Token sheet",
  `<div class="mockup-page">
${header()}
<main class="mockup-content" style="padding:var(--space-8);max-width:1100px;margin:0 auto">
  <h1>Design tokens</h1>
  <p style="color:var(--ink-muted)">Warm ink on paper. Roles redefine under <code>prefers-color-scheme</code> and <code>[data-theme]</code>; nothing is defined only inside a media block.</p>

  <h2>Surfaces</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4)">
    ${swatch("surface-0", "App ground")}
    ${swatch("surface-1", "Rail / panel")}
    ${swatch("surface-2", "Cards, sheet, inputs")}
    ${swatch("surface-3", "Pressed / selected tint")}
  </div>

  <h2>Ink</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4)">
    ${swatch("ink-strong", "Strong (headings) — AA on surface-2")}
    ${swatch("ink-body", "Body — AA on surface-2")}
    ${swatch("ink-muted", "Muted — AA large text on surface-2")}
    ${swatch("rule-hairline", "Hairline rule")}
  </div>

  <h2>Accent &amp; state</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4)">
    ${swatch("accent", "Accent — AA on accent-on")}
    ${swatch("accent-ink", "Accent tint")}
    ${swatch("blank-unfilled-bg", "Unfilled blank")}
    ${swatch("advisory-bg", "Advisory")}
  </div>

  <h2>Type scale (fluid, 393–1280px)</h2>
  <div class="card-list">
    <div style="font-size:var(--font-size-3xl)">3xl — clamp(1.8rem, …, 2.25rem)</div>
    <div style="font-size:var(--font-size-2xl)">2xl — clamp(1.44rem, …, 1.75rem)</div>
    <div style="font-size:var(--font-size-xl)">xl — clamp(1.2rem, …, 1.375rem)</div>
    <div style="font-size:var(--font-size-lg)">lg — clamp(1.08rem, …, 1.2rem)</div>
    <div style="font-size:var(--font-size-base)">base — clamp(0.95rem, …, 1.0625rem)</div>
    <div style="font-size:var(--font-size-sm)">sm — clamp(0.83rem, …, 0.925rem)</div>
    <div style="font-size:var(--font-size-xs)">xs — clamp(0.72rem, …, 0.8rem)</div>
  </div>

  <h2>Reading typeface — Source Serif 4 Variable</h2>
  <p style="font-family:var(--font-reading);font-size:var(--reading-size-body);max-width:var(--measure)">The quick brown fox jumps over the lazy dog. Pursuant to RCW 11.12.260, I may dispose of tangible personal property by a separate written list.</p>

  <h2>Spacing (8pt grid)</h2>
  <div style="display:flex;align-items:flex-end;gap:var(--space-2)">
    ${["1", "2", "3", "4", "5", "6", "8", "10", "12", "16"]
      .map(
        (s) =>
          `<div style="width:var(--space-${s});height:var(--space-${s});background:var(--accent)" title="--space-${s}"></div>`
      )
      .join("\n")}
  </div>

  <h2>Controls</h2>
  <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;align-items:center">
    <button class="btn">Rest</button>
    <button class="btn" style="background:var(--surface-3)">Hover</button>
    <button class="btn" disabled>Disabled</button>
    <button class="btn" style="outline:2px solid var(--focus-ring);outline-offset:2px">Focus</button>
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-danger">Danger</button>
  </div>
  <div class="field" style="max-width:320px;margin-top:var(--space-4)">
    <label for="tok-demo">Text input</label>
    <input id="tok-demo" type="text" value="Jordan A. Whitfield" />
    <span class="field-hint">44px minimum tap target below 900px</span>
  </div>
</main>
</div>`
);

// ---------------------------------------------------------------------
// 01 — desktop draft: rail + paper document + contextual panel
// ---------------------------------------------------------------------
write(
  "01-desktop-draft",
  "Desktop — draft",
  `<div class="mockup-page">
${header("paper")}
<div class="app-body with-panel">
  ${rail(0)}
  <main class="doc-surface">
    <div class="paper-viewport">
      <article id="document-sheet" class="paged-sheet" data-highlights="true">
        ${doc}
      </article>
    </div>
  </main>
  <aside class="context-panel" aria-label="Edit field">
    <div class="panel-heading">
      <h2>Family</h2>
      <button class="btn" aria-label="Close" style="min-height:32px;padding:0 var(--space-2)">✕</button>
    </div>
    <div class="field-guidance">Your spouse's full legal name, as it should appear throughout the Will.</div>
    <div class="panel-field-group">
      <div class="field">
        <label for="p-spouse-name">Spouse's full legal name</label>
        <input id="p-spouse-name" type="text" value="Taylor B. Whitfield" style="outline:2px solid var(--focus-ring);outline-offset:1px" />
      </div>
      <div class="field">
        <label for="p-spouse-gender">Spouse's gender / pronouns</label>
        <select id="p-spouse-gender">
          <option>Female (she / her / hers)</option>
        </select>
      </div>
    </div>
    <div class="field-nav">
      <button class="btn">← Prev</button>
      <button class="btn btn-primary">Next →</button>
    </div>
  </aside>
</div>
</div>`,
  { extraCss: ["../document-content.css", "../document-paper.css"] }
);

// ---------------------------------------------------------------------
// 02 — desktop reading
// ---------------------------------------------------------------------
write(
  "02-desktop-reading",
  "Desktop — reading",
  `<div class="mockup-page">
${header("reading")}
<div class="app-body">
  ${rail(2)}
  <main class="doc-surface">
    <article id="document-sheet" class="reading-sheet" data-highlights="true">
      ${doc}
    </article>
  </main>
</div>
</div>`,
  { extraCss: ["../document-content.css", "../document-reading.css"] }
);

// ---------------------------------------------------------------------
// 03 — desktop paper
// ---------------------------------------------------------------------
write(
  "03-desktop-paper",
  "Desktop — paper",
  `<div class="mockup-page">
${header("paper")}
<div class="app-body">
  ${rail(2)}
  <main class="doc-surface">
    <div class="paper-viewport">
      <article id="document-sheet" class="paged-sheet" data-highlights="true">
        ${doc}
      </article>
    </div>
  </main>
</div>
</div>`,
  { extraCss: ["../document-content.css", "../document-paper.css"] }
);

// ---------------------------------------------------------------------
// 04 — mobile reading with bottom sheet
// ---------------------------------------------------------------------
write(
  "04-mobile-reading-sheet",
  "Mobile — reading + bottom sheet",
  `<div class="mockup-page">
${header("reading")}
<main class="doc-surface" style="padding-bottom:280px">
  <article id="document-sheet" class="reading-sheet" data-highlights="true">
    ${doc}
  </article>
</main>
<div class="bottom-sheet" role="dialog" aria-modal="true" aria-label="Edit field">
  <div class="sheet-grabber"></div>
  <div class="sheet-heading">
    <h2>City of execution</h2>
    <button class="btn" aria-label="Close" style="min-height:32px;padding:0 var(--space-2)">✕</button>
  </div>
  <div class="field-guidance">The city where the Will will be signed — usually where you live or where the signing appointment takes place.</div>
  <div class="field">
    <label for="s-city">City</label>
    <input id="s-city" type="text" value="Tacoma" style="outline:2px solid var(--focus-ring);outline-offset:1px" />
  </div>
  <div class="field-nav">
    <button class="btn" style="min-width:44px">← Prev</button>
    <button class="btn btn-primary" style="min-width:44px">Next →</button>
  </div>
</div>
</div>`,
  { extraCss: ["../document-content.css", "../document-reading.css"] }
);

// ---------------------------------------------------------------------
// 05 — mobile paper, fit-to-width
// ---------------------------------------------------------------------
write(
  "05-mobile-paper",
  "Mobile — paper",
  `<div class="mockup-page">
${header("paper")}
<main class="doc-surface" style="padding:var(--space-4)">
  <div class="paper-viewport">
    <article id="document-sheet" class="paged-sheet" data-highlights="true">
      ${doc}
    </article>
  </div>
  <p style="text-align:center;color:var(--ink-muted);font-size:var(--font-size-xs);margin-top:var(--space-2)">Pinch or double-tap to zoom — the sheet keeps its true 8.5″ proportions.</p>
</main>
</div>`,
  { extraCss: ["../document-content.css", "../document-paper.css"] }
);

// ---------------------------------------------------------------------
// 06 — signing day
// ---------------------------------------------------------------------
write(
  "06-signing-day",
  "Signing day",
  `<div class="mockup-page">
${header()}
<main class="mockup-content" style="max-width:560px;margin:0 auto;padding:var(--space-8) var(--space-4)">
  <div class="rail-progress" style="border-bottom:none;margin-bottom:var(--space-6)">
    <div class="rail-progress-bar"><div class="rail-progress-fill" style="width:50%"></div></div>
    <span class="rail-progress-label">Group 2 of 4 — Witnesses</span>
  </div>
  <h1 style="font-size:var(--font-size-xl);margin-bottom:var(--space-1)">Witness one</h1>
  <p style="color:var(--ink-muted);margin-top:0">Have your first witness fill in their own name and address.</p>
  <div class="panel-field-group">
    <div class="field">
      <label for="w1-name">Full legal name</label>
      <input id="w1-name" type="text" value="Alex I. Kowalski" style="outline:2px solid var(--focus-ring);outline-offset:1px" />
    </div>
    <div class="field">
      <label for="w1-addr">Residence address</label>
      <input id="w1-addr" type="text" value="100 Main St" />
    </div>
    <div class="field">
      <label for="w1-csz">City, state, ZIP</label>
      <input id="w1-csz" type="text" value="Tacoma, WA 98402" />
    </div>
  </div>
  <div class="field-nav" style="margin-top:var(--space-8)">
    <button class="btn">← Back</button>
    <button class="btn btn-primary">Continue →</button>
  </div>
  <hr style="border:none;border-top:1px solid var(--rule-hairline);margin:var(--space-8) 0" />
  <h2 style="font-size:var(--font-size-base);color:var(--ink-muted)">Also in this flow</h2>
  <ul class="card-list" style="list-style:none;padding:0">
    <li class="checklist-item"><span class="rail-check done"></span> City of execution</li>
    <li class="checklist-item"><span class="rail-check"></span> Witness one <em style="color:var(--ink-muted);margin-left:auto">in progress</em></li>
    <li class="checklist-item"><span class="rail-check"></span> Witness two</li>
    <li class="checklist-item"><span class="rail-check"></span> Notary</li>
  </ul>
</main>
</div>`
);

// ---------------------------------------------------------------------
// 07 — pre-print checklist
// ---------------------------------------------------------------------
write(
  "07-preprint-checklist",
  "Pre-print checklist",
  `<div class="mockup-page">
${header()}
<main class="mockup-content" style="max-width:560px;margin:0 auto;padding:var(--space-8) var(--space-4)">
  <h1 style="font-size:var(--font-size-xl)">Before you print</h1>
  <div class="card">
    <div class="checklist-item">
      <input type="checkbox" checked style="width:20px;height:20px;margin-top:2px" />
      <div><strong>Turn off headers and footers</strong><div class="field-hint">Chromium adds its own page headers/footers by default — disable them in the print dialog's "More settings." They collide with the document's own footer.</div></div>
    </div>
    <div class="checklist-item">
      <input type="checkbox" checked style="width:20px;height:20px;margin-top:2px" />
      <div><strong>Letter, portrait, single-sided</strong><div class="field-hint">Confirm paper size is Letter (8.5 × 11in), orientation Portrait, and one-sided printing.</div></div>
    </div>
    <div class="checklist-item">
      <input type="checkbox" style="width:20px;height:20px;margin-top:2px" />
      <div><strong>Using Firefox?</strong><div class="field-hint">Firefox does not yet render the document's page footers (Chromium 131+ and Safari 18.2+ do). Print from Chrome or Safari if the footer matters.</div></div>
    </div>
  </div>
  <div style="display:flex;gap:var(--space-3);margin-top:var(--space-6)">
    <button class="btn btn-primary" style="flex:1">Print</button>
    <button class="btn" style="flex:1">Export standalone HTML</button>
  </div>
</main>
</div>`
);

// ---------------------------------------------------------------------
// 08 — plan management
// ---------------------------------------------------------------------
write(
  "08-plan-management",
  "Plan management",
  `<div class="mockup-page">
${header()}
<main class="mockup-content" style="max-width:680px;margin:0 auto;padding:var(--space-8) var(--space-4)">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
    <h1 style="font-size:var(--font-size-xl);margin:0">Plans</h1>
    <button class="btn btn-primary">+ New plan</button>
  </div>
  <div class="card-list">
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>Jordan's Will</strong>
        <div class="field-hint">Last edited 2 days ago — 62% complete</div>
      </div>
      <div style="display:flex;gap:var(--space-2)">
        <button class="btn">Rename</button>
        <button class="btn">Duplicate</button>
        <button class="btn">Create reciprocal spouse plan</button>
        <button class="btn btn-danger">Delete</button>
      </div>
    </div>
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>Taylor's Will</strong>
        <div class="field-hint">Created from Jordan's Will (reciprocal) — 40% complete</div>
      </div>
      <div style="display:flex;gap:var(--space-2)">
        <button class="btn">Rename</button>
        <button class="btn">Duplicate</button>
        <button class="btn btn-danger">Delete</button>
      </div>
    </div>
  </div>
</main>
</div>`
);

// ---------------------------------------------------------------------
// 09 — review advisories, rail + inline
// ---------------------------------------------------------------------
const advisoryDoc = doc.replace(
  '<h2 class="doc-subtitle">Attestation of Witnesses</h2>',
  `<h2 class="doc-subtitle">Attestation of Witnesses</h2>
  <div class="advisory" role="note" data-path="execution.witnesses.0.name" style="margin-bottom:var(--space-4)">
    <strong>⚠</strong>
    <span>Alex I. Kowalski is also named as a Personal Representative alternate. An interested witness can jeopardize the self-proving affidavit under RCW 11.12.160 — consider a disinterested witness.</span>
  </div>`
);

write(
  "09-review-advisories",
  "Review — advisories",
  `<div class="mockup-page">
${header("reading")}
<div class="app-body">
  ${rail(
    4,
    `<div class="field-guidance" style="margin-top:var(--space-4)">
      <strong>Advisories (1)</strong>
      <div class="advisory" style="margin-top:var(--space-2)">Interested witness: Alex I. Kowalski <button class="advisory-inline" style="margin-left:auto">View</button></div>
    </div>`
  )}
  <main class="doc-surface">
    <article id="document-sheet" class="reading-sheet" data-highlights="true">
      ${advisoryDoc}
    </article>
  </main>
</div>
</div>`,
  { extraCss: ["../document-content.css", "../document-reading.css"] }
);

console.log("Built 10 mockups in design/mockups/");
