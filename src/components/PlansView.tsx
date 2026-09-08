import { useRef, useState } from "preact/hooks";

import { DOCUMENTS } from "../documents/registry";
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
  setActivePlan,
} from "../store/index";
import { documentCompletion } from "../ui/completion";
import { lastSavedAt, openFile, saveFile } from "../ui/files";
import { view } from "../ui/view";

interface PlanCardProps {
  plan: Plan;
  canDelete: boolean;
}

function PlanCard({ plan, canDelete }: PlanCardProps) {
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const { answered, total } = document
    ? documentCompletion(plan, document.sections)
    : { answered: 0, total: 0 };
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const isActive = activePlanId.value === plan.id;

  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function commitRename() {
    const value = inputRef.current?.value.trim();
    if (value) renamePlan(plan.id, value);
    setRenaming(false);
  }

  return (
    <div class="card plan-card">
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
              if (event.key === "Escape") setRenaming(false);
            }}
            onBlur={commitRename}
          />
        ) : (
          <strong>{plan.label}</strong>
        )}
        <div class="field-hint">{percent}% complete</div>
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
  );
}

function formatLastSaved(date: Date | null): string {
  if (!date) return "Not saved this session";
  return `Last saved ${date.toLocaleTimeString()}`;
}

// Exports split by purpose from the pre-print checklist's Print/Export
// pair: this card carries the attorney memo and the full-state JSON
// backup/restore, since neither is part of getting the document onto
// paper.
function DataCard() {
  const [importError, setImportError] = useState<string | null>(null);

  function handleMemo() {
    const plan = activePlan.value;
    const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
    if (!plan || !document) return;
    const name = plan.party.testator.name || "plan";
    void saveFile(
      `${name.replace(/\s+/g, "-").toLowerCase()}-memo.txt`,
      "text/plain",
      document.memo(plan)
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
    const contents = await openFile(".json");
    if (contents === null) return;
    let raw: unknown;
    try {
      raw = JSON.parse(contents);
    } catch {
      setImportError("That file isn't valid JSON.");
      return;
    }
    const parsed = parsePersisted(raw);
    if (!parsed) {
      setImportError("That file doesn't look like a saved plans export.");
      return;
    }
    plans.value = parsed.plans;
    activePlanId.value = parsed.activePlanId;
  }

  return (
    <div class="card" style={{ marginTop: "var(--space-6)" }}>
      <strong>Data</strong>
      <div class="card-list" style={{ marginTop: "var(--space-3)" }}>
        <button type="button" class="btn" onClick={handleMemo}>
          Attorney memo
        </button>
        <button type="button" class="btn" onClick={handleSave}>
          Save plans to file
        </button>
        <button type="button" class="btn" onClick={handleOpen}>
          Open plans from file
        </button>
      </div>
      {importError ? <div class="field-hint">{importError}</div> : null}
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
      <DataCard />
    </main>
  );
}
