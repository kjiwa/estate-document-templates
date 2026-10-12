import { useRef, useState } from "preact/hooks";

import { DOCUMENTS, type DocumentDefinition } from "../documents/registry";
import { generateStandaloneBundle } from "../export/standaloneHtml";
import type { Plan } from "../model/plan";
import {
  applyParsed,
  createPlan,
  createReciprocalPlan,
  deletePlan,
  duplicatePlan,
  parsePersisted,
  plans,
  renamePlan,
  serializeState,
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
  isReady,
  STAGE_LABELS,
  type DocumentReadiness,
  type ReadinessStage,
} from "../ui/completion";
import { fileSlug, lastSavedAt, openFile, saveFile } from "../ui/files";
import { printAllDocuments } from "../ui/print";
import { view } from "../ui/view";

function openDocument(plan: Plan, document: DocumentDefinition) {
  setActivePlan(plan.id);
  setActiveDocument(document.id);
  view.value = "document";
}

function detailLines(readiness: DocumentReadiness): string[] {
  const { stage, content, signing, remainingSigningGroups } = readiness;
  const lines: string[] = [];
  if (!isReady(stage)) {
    const answered = content.answered + signing.answered;
    lines.push(
      `${answered} / ${content.total + signing.total} required fields`
    );
  } else if (stage === "ready-to-sign") {
    lines.push(`Signing day: ${remainingSigningGroups.join(", ")}`);
  }
  if (isReady(stage) && readiness.blankOptionalSections.length > 0) {
    const legends = readiness.blankOptionalSections.map((s) => s.legend);
    lines.push(`Left blank (optional): ${legends.join(", ")}`);
  }
  return lines;
}

function Icon({ path }: { path: string }) {
  return (
    <svg
      class="icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function ChevronIcon() {
  return <Icon path="M6 3l5 5-5 5" />;
}

interface DocumentRowProps {
  plan: Plan;
  document: DocumentDefinition;
}

function DocumentRow({ plan, document }: DocumentRowProps) {
  const readiness = documentReadiness(plan, document);
  const advisories = overviewAdvisories(plan, document);
  const ready = isReady(readiness.stage);
  const chip =
    ready && advisories.length > 0
      ? `${STAGE_LABELS[readiness.stage]}, ${advisories.length} to review`
      : STAGE_LABELS[readiness.stage];

  const { content, signing } = readiness;
  const total = content.total + signing.total;
  const answered = content.answered + signing.answered;
  const percent =
    ready || total === 0 ? 100 : Math.round((answered / total) * 100);

  return (
    <li class="plan-overview-row">
      <button
        type="button"
        class="plan-doc"
        onClick={() => openDocument(plan, document)}
      >
        <span class="plan-doc-title">{document.title}</span>
        <span class={`stage-chip ${ready ? "ready" : ""}`}>{chip}</span>
        <ChevronIcon />
        {detailLines(readiness).map((line) => (
          <span class="plan-doc-detail" key={line}>
            {line}
          </span>
        ))}
        <span class="progress-bar" aria-hidden="true">
          <span class="progress-fill" style={{ width: `${percent}%` }} />
        </span>
      </button>
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

function downloadAll(plan: Plan) {
  void saveFile(
    `${fileSlug(plan.party.testator.name, "plan")}-all-documents.html`,
    "text/html",
    generateStandaloneBundle(plan, DOCUMENTS)
  );
}

const MEMO_DOCUMENT = DOCUMENTS.find((document) => document.id === "will");

function downloadMemo(plan: Plan) {
  if (!MEMO_DOCUMENT) return;
  void saveFile(
    `${fileSlug(plan.party.testator.name, "plan")}-memo.txt`,
    "text/plain",
    MEMO_DOCUMENT.memo(plan)
  );
}

function closeMenu(event: Event) {
  (event.currentTarget as HTMLElement)
    .closest<HTMLElement>("[popover]")
    ?.hidePopover();
}

interface PlanCardProps {
  plan: Plan;
  canDelete: boolean;
}

function PlanCard({ plan, canDelete }: PlanCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuId = `plan-menu-${plan.id}`;

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
    <div class="card plan-card">
      <div class="plan-card-header">
        <div class="plan-card-title">
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
            <h2>{plan.label}</h2>
          )}
          <div class="field-hint">{stageSummary(plan)}</div>
        </div>
        <div class="plan-card-actions">
          <button
            type="button"
            class="btn"
            onClick={() => printAllDocuments(plan.id)}
          >
            Print all
          </button>
          <button type="button" class="btn" onClick={() => downloadAll(plan)}>
            Download all
          </button>
          <button
            type="button"
            class="btn"
            popovertarget={menuId}
            aria-label={`More actions for ${plan.label}`}
          >
            More
          </button>
          <div id={menuId} class="plan-menu" popover="auto">
            <button
              type="button"
              class="btn btn-quiet"
              onClick={(event) => {
                closeMenu(event);
                setRenaming(true);
              }}
            >
              Rename
            </button>
            <button
              type="button"
              class="btn btn-quiet"
              onClick={(event) => {
                closeMenu(event);
                duplicatePlan(plan.id);
              }}
            >
              Duplicate
            </button>
            {plan.party.maritalStatus !== "unmarried" ? (
              <button
                type="button"
                class="btn btn-quiet"
                onClick={(event) => {
                  closeMenu(event);
                  createReciprocalPlan(plan.id);
                }}
              >
                Create spouse plan
              </button>
            ) : null}
            <button
              type="button"
              class="btn btn-quiet"
              onClick={(event) => {
                closeMenu(event);
                downloadMemo(plan);
              }}
            >
              Download attorney memo
            </button>
            <hr class="plan-menu-separator" />
            <button
              type="button"
              class="btn btn-quiet btn-danger"
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
        </div>
      </div>
      <ul class="plan-overview">
        {DOCUMENTS.map((document) => (
          <DocumentRow plan={plan} document={document} key={document.id} />
        ))}
      </ul>
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

interface PendingImport {
  fileName: string;
  parsed: NonNullable<ReturnType<typeof parsePersisted>>;
}

function DataCard() {
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(
    null
  );

  function handleSave() {
    void saveFile("estate-plans.json", "application/json", serializeState(2));
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
    applyParsed(parsed);
    setPendingImport(null);
  }

  return (
    <div class="card data-card">
      <h2>Data</h2>
      <div class="card-list">
        <button type="button" class="btn" onClick={handleSave}>
          Save plans to file
        </button>
        <button type="button" class="btn" onClick={handleOpen}>
          Open plans from file
        </button>
      </div>
      {pendingImport ? (
        <div class="card-list">
          <span>
            Replace {planCount(Object.keys(plans.value).length)} with{" "}
            {planCount(Object.keys(pendingImport.parsed.plans).length)} from{" "}
            {pendingImport.fileName}
            {pendingImport.parsed.skipped > 0
              ? ` (${planCount(pendingImport.parsed.skipped)} in the file can't be read and will be skipped)`
              : ""}
            ?
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
      <div class="plans-header">
        <h1>Plans</h1>
        <button
          type="button"
          class="btn btn-primary"
          onClick={() => {
            createPlan();
            view.value = "document";
          }}
        >
          <Icon path="M8 3v10M3 8h10" />
          New plan
        </button>
      </div>
      <div class="card-list">
        {allPlans.map((plan) => (
          <PlanCard plan={plan} canDelete={canDelete} key={plan.id} />
        ))}
      </div>
      <p class="field-hint plan-overview-note">
        Ready to sign means everything except the signing-day details (date,
        witnesses, notary) is filled. Drafts are not reviewed by an attorney.
        Bring each draft and its attorney memo to a Washington attorney,
        including optional sections left blank, before signing.
      </p>
      <DataCard />
    </main>
  );
}
