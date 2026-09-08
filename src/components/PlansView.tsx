import { useRef, useState } from "preact/hooks";

import { DOCUMENTS } from "../documents/registry";
import type { Plan } from "../model/plan";
import {
  activeDocumentId,
  activePlanId,
  createPlan,
  createReciprocalPlan,
  deletePlan,
  duplicatePlan,
  plans,
  renamePlan,
  setActivePlan,
} from "../store/index";
import { documentCompletion } from "../ui/completion";
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
    </main>
  );
}
