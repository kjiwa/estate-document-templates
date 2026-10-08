import { useRef, useState } from "preact/hooks";

import { DOCUMENTS, type DocumentDefinition } from "../documents/registry";
import { CURRENT_SCHEMA_VERSION } from "../model/migrate";
import type { Plan } from "../model/plan";
import {
  activeDocumentId,
  activePlan,
  activePlanId,
  createPlan,
  createReciprocalPlan,
  deletePlan,
  duplicatePlan,
  parsePersisted,
  plans,
  renamePlan,
  setActiveDocument,
  setActivePlan,
} from "../store/index";
import {
  groupByTitle,
  overviewAdvisories,
  showAdvisory,
} from "../ui/advisories";
import {
  documentReadiness,
  STAGE_LABELS,
  type DocumentReadiness,
  type ReadinessStage,
} from "../ui/completion";
import { lastSavedAt, openFile, saveFile } from "../ui/files";
import { view } from "../ui/view";

function openDocument(plan: Plan, document: DocumentDefinition) {
  setActivePlan(plan.id);
  setActiveDocument(document.id);
  view.value = "document";
}

function detailLines(readiness: DocumentReadiness): string[] {
  const { stage, content, signing, remainingSigningGroups } = readiness;
  const lines: string[] = [];
  if (stage === "in-progress") {
    const answered = content.answered + signing.answered;
    lines.push(
      `${answered} / ${content.total + signing.total} required fields`
    );
  } else if (stage === "ready-to-sign") {
    lines.push(`Signing day: ${remainingSigningGroups.join(", ")}`);
  }
  if (stage !== "in-progress" && readiness.blankOptionalSections.length > 0) {
    const legends = readiness.blankOptionalSections.map((s) => s.legend);
    lines.push(`Left blank (optional): ${legends.join(", ")}`);
  }
  return lines;
}

interface DocumentRowProps {
  plan: Plan;
  document: DocumentDefinition;
}

function DocumentRow({ plan, document }: DocumentRowProps) {
  const readiness = documentReadiness(plan, document);
  const advisories = overviewAdvisories(plan, document);
  const ready = readiness.stage !== "in-progress";
  const chip =
    ready && advisories.length > 0
      ? `${STAGE_LABELS[readiness.stage]}, ${advisories.length} to review`
      : STAGE_LABELS[readiness.stage];

  return (
    <li class="plan-overview-row">
      <div class="plan-overview-head">
        <button
          type="button"
          class="plan-overview-title"
          onClick={() => openDocument(plan, document)}
        >
          {document.title}
        </button>
        <span class={`stage-chip ${ready ? "ready" : ""}`}>{chip}</span>
      </div>
      {detailLines(readiness).map((line) => (
        <div class="field-hint" key={line}>
          {line}
        </div>
      ))}
      {advisories.length > 0 ? (
        <ul class="plan-overview-advisories">
          {groupByTitle(advisories).map(({ title, count, first }) => (
            <li key={first.id}>
              <button
                type="button"
                class="plan-overview-advisory"
                onClick={() => {
                  openDocument(plan, document);
                  showAdvisory(first);
                }}
              >
                {count > 1 ? `${title} (${count})` : title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function stageSummary(plan: Plan): string {
  const counts = new Map<ReadinessStage, number>();
  let toReview = 0;
  for (const document of DOCUMENTS) {
    const { stage } = documentReadiness(plan, document);
    counts.set(stage, (counts.get(stage) ?? 0) + 1);
    toReview += overviewAdvisories(plan, document).length;
  }
  const stages = (Object.keys(STAGE_LABELS) as ReadinessStage[])
    .filter((stage) => counts.has(stage))
    .map((stage) => `${counts.get(stage)} ${STAGE_LABELS[stage].toLowerCase()}`)
    .join(", ");
  return toReview > 0
    ? `Documents: ${stages}; ${toReview} to review`
    : `Documents: ${stages}`;
}

interface PlanCardProps {
  plan: Plan;
  canDelete: boolean;
}

function PlanCard({ plan, canDelete }: PlanCardProps) {
  const isActive = activePlanId.value === plan.id;

  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function commitRename() {
    const value = inputRef.current?.value.trim();
    if (value) renamePlan(plan.id, value);
    setRenaming(false);
  }

  function cancelRename() {
    inputRef.current = null;
    setRenaming(false);
  }

  return (
    <div class={`card plan-card${isActive ? " plan-card-active" : ""}`}>
      <div>
        {renaming ? (
          <input
            ref={(el) => {
              inputRef.current = el;
              el?.focus();
            }}
            type="text"
            value={plan.label}
            aria-label="Plan name"
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") cancelRename();
            }}
            onBlur={commitRename}
          />
        ) : (
          <strong>{plan.label}</strong>
        )}
      </div>
      <div class="plan-card-actions">
        <button
          type="button"
          class="btn"
          aria-pressed={isActive}
          onClick={() => setActivePlan(plan.id)}
        >
          {isActive ? "Active" : "Make active"}
        </button>
        <button type="button" class="btn" onClick={() => setRenaming(true)}>
          Rename
        </button>
        <button
          type="button"
          class="btn"
          onClick={() => duplicatePlan(plan.id)}
        >
          Duplicate
        </button>
        {plan.party.maritalStatus !== "unmarried" ? (
          <button
            type="button"
            class="btn"
            onClick={() => createReciprocalPlan(plan.id)}
          >
            Create reciprocal spouse plan
          </button>
        ) : null}
        <button
          type="button"
          class="btn btn-danger"
          disabled={!canDelete}
          aria-label={
            confirmingDelete
              ? `Confirm delete ${plan.label}`
              : `Delete ${plan.label}`
          }
          onBlur={() => setConfirmingDelete(false)}
          onClick={() => {
            if (confirmingDelete) {
              deletePlan(plan.id);
            } else {
              setConfirmingDelete(true);
            }
          }}
        >
          {confirmingDelete ? "Confirm delete" : "Delete"}
        </button>
      </div>
      <details class="plan-documents">
        <summary>{stageSummary(plan)}</summary>
        <ul class="plan-overview">
          {DOCUMENTS.map((document) => (
            <DocumentRow plan={plan} document={document} key={document.id} />
          ))}
        </ul>
      </details>
    </div>
  );
}

function planCount(n: number): string {
  return `${n} ${n === 1 ? "plan" : "plans"}`;
}

function formatLastSaved(date: Date | null): string {
  if (!date) return "Not saved this session";
  return `Last saved ${date.toLocaleTimeString()}`;
}

// Exports split by purpose from the pre-print checklist's Print/Export
// pair: this card carries the attorney memo and the full-state JSON
// backup/restore, since neither is part of getting the document onto
// paper.
interface PendingImport {
  fileName: string;
  parsed: NonNullable<ReturnType<typeof parsePersisted>>;
}

function DataCard() {
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(
    null
  );

  const activeDocument = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const memo = activeDocument?.memo;

  function handleMemo() {
    const plan = activePlan.value;
    if (!plan || !memo) return;
    const name = plan.party.testator.name || "plan";
    void saveFile(
      `${name.replace(/\s+/g, "-").toLowerCase()}-memo.txt`,
      "text/plain",
      memo(plan)
    );
  }

  function handleSave() {
    const data = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      activePlanId: activePlanId.value,
      activeDocumentId: activeDocumentId.value,
      plans: plans.value,
    };
    void saveFile(
      "estate-plans.json",
      "application/json",
      JSON.stringify(data, null, 2)
    );
  }

  async function handleOpen() {
    setImportError(null);
    setPendingImport(null);
    const file = await openFile(".json");
    if (file === null) return;
    let raw: unknown;
    try {
      raw = JSON.parse(file.contents);
    } catch {
      setImportError("That file isn't valid JSON.");
      return;
    }
    const parsed = parsePersisted(raw);
    if (!parsed) {
      setImportError("That file doesn't look like a saved plans export.");
      return;
    }
    setPendingImport({ fileName: file.name, parsed });
  }

  function confirmImport() {
    if (!pendingImport) return;
    const { parsed } = pendingImport;
    plans.value = parsed.plans;
    activePlanId.value = parsed.activePlanId;
    activeDocumentId.value = parsed.activeDocumentId;
    setPendingImport(null);
  }

  return (
    <div class="card" style={{ marginTop: "var(--space-6)" }}>
      <strong>Data</strong>
      <div class="card-list" style={{ marginTop: "var(--space-3)" }}>
        {memo ? (
          <button type="button" class="btn" onClick={handleMemo}>
            Attorney memo
          </button>
        ) : null}
        <button type="button" class="btn" onClick={handleSave}>
          Save plans to file
        </button>
        <button type="button" class="btn" onClick={handleOpen}>
          Open plans from file
        </button>
      </div>
      {pendingImport ? (
        <div class="card-list" style={{ marginTop: "var(--space-3)" }}>
          <span>
            Replace {planCount(Object.keys(plans.value).length)} with{" "}
            {planCount(Object.keys(pendingImport.parsed.plans).length)} from{" "}
            {pendingImport.fileName}?
          </span>
          <button type="button" class="btn btn-danger" onClick={confirmImport}>
            Confirm replace
          </button>
          <button
            type="button"
            class="btn"
            onClick={() => setPendingImport(null)}
          >
            Cancel
          </button>
        </div>
      ) : null}
      {importError ? (
        <div class="field-hint" role="alert">
          {importError}
        </div>
      ) : null}
      <div class="field-hint">{formatLastSaved(lastSavedAt.value)}</div>
    </div>
  );
}

export function PlansView() {
  const allPlans = Object.values(plans.value);
  const canDelete = allPlans.length > 1;

  return (
    <main id="main-content" class="plans-view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-4)",
        }}
      >
        <h1 style={{ fontSize: "var(--font-size-xl)", margin: 0 }}>Plans</h1>
        <button
          type="button"
          class="btn btn-primary"
          onClick={() => {
            createPlan();
            view.value = "document";
          }}
        >
          + New plan
        </button>
      </div>
      <div class="card-list">
        {allPlans.map((plan) => (
          <PlanCard plan={plan} canDelete={canDelete} key={plan.id} />
        ))}
      </div>
      <p class="field-hint plan-overview-note">
        Ready to sign means everything except the signing-day details (date,
        witnesses, notary) is filled. Have a Washington attorney review each
        document, including optional sections left blank, before signing.
      </p>
      <DataCard />
    </main>
  );
}
