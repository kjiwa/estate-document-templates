import { useState } from "preact/hooks";

import { DOCUMENTS } from "../documents/registry";
import { generateStandaloneHtml } from "../export/standaloneHtml";
import {
  groupByTitle,
  overviewAdvisories,
  showAdvisory,
} from "../ui/advisories";
import { documentReadiness, STAGE_LABELS } from "../ui/completion";
import { saveFile } from "../ui/files";
import { printDocument } from "../ui/print";
import { activeDocumentId, activePlan } from "../store/index";
import { view } from "../ui/view";

// Both checkboxes are a local acknowledgement, not persisted plan data, and
// neither gates the buttons.
export function PrintChecklist() {
  const plan = activePlan.value;
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const stage =
    plan && document ? documentReadiness(plan, document).stage : null;
  const advisories =
    plan && document ? groupByTitle(overviewAdvisories(plan, document)) : [];
  const [headersOff, setHeadersOff] = useState(true);
  const [letterPortrait, setLetterPortrait] = useState(true);

  function handleExport() {
    if (!plan || !document) return;
    const testatorName = plan.party.testator.name || "document";
    const slug = testatorName.replace(/\s+/g, "-").toLowerCase();
    const suggestedName = `${slug}-${document.id}.html`;
    void saveFile(
      suggestedName,
      "text/html",
      generateStandaloneHtml(plan, document)
    );
  }

  return (
    <main id="main-content" class="print-checklist">
      <h1 style={{ fontSize: "var(--font-size-xl)" }}>Before you print</h1>
      {stage ? (
        <div class="card" style={{ marginBottom: "var(--space-4)" }}>
          <strong>{document?.title}</strong>{" "}
          <span class={`stage-chip ${stage !== "in-progress" ? "ready" : ""}`}>
            {STAGE_LABELS[stage]}
          </span>
          {advisories.length > 0 ? (
            <ul class="plan-overview-advisories">
              {advisories.map(({ title, count, first }) => (
                <li key={first.id}>
                  <button
                    type="button"
                    class="plan-overview-advisory"
                    onClick={() => {
                      view.value = "document";
                      showAdvisory(first);
                    }}
                  >
                    {count > 1 ? `${title} (${count})` : title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div class="card">
        <div class="checklist-item">
          <input
            type="checkbox"
            checked={headersOff}
            onChange={(event) =>
              setHeadersOff((event.target as HTMLInputElement).checked)
            }
          />
          <div>
            <strong>Turn off headers and footers</strong>
            <div class="field-hint">
              Chromium adds its own page headers/footers by default — disable
              them in the print dialog&rsquo;s &quot;More settings.&quot; They
              collide with the document&rsquo;s own footer. Page footers print
              in Chrome, Edge, and Safari; Firefox does not render them yet.
            </div>
          </div>
        </div>
        <div class="checklist-item">
          <input
            type="checkbox"
            checked={letterPortrait}
            onChange={(event) =>
              setLetterPortrait((event.target as HTMLInputElement).checked)
            }
          />
          <div>
            <strong>Letter, portrait, single-sided</strong>
            <div class="field-hint">
              Confirm paper size is Letter (8.5 &times; 11in), orientation
              Portrait, and one-sided printing.
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          marginTop: "var(--space-6)",
        }}
      >
        <button
          type="button"
          class="btn btn-primary"
          style={{ flex: 1 }}
          onClick={printDocument}
        >
          Print
        </button>
        <button
          type="button"
          class="btn"
          style={{ flex: 1 }}
          onClick={handleExport}
        >
          Export standalone HTML
        </button>
      </div>
    </main>
  );
}
