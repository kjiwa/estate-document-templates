import type { DocumentDefinition } from "../documents/registry";
import type { Plan } from "../model/plan";
import { advisoriesBySection, showAdvisory } from "../ui/advisories";
import {
  documentCompletion,
  documentReadiness,
  sectionState,
  STAGE_LABELS,
  type SectionState,
} from "../ui/completion";
import { activeSectionId, openSection } from "../ui/editing";

const STATE_LABELS: Record<SectionState, string> = {
  done: "Complete",
  open: "Incomplete",
  "blank-optional": "Optional, left blank",
};

interface RailProps {
  document: DocumentDefinition;
  plan: Plan;
}

export function Rail({ document, plan }: RailProps) {
  const visibleSections = document.sections.filter(
    (section) => !section.hidden?.(plan)
  );
  const { answered, total } = documentCompletion(plan, document.sections);
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const { stage } = documentReadiness(plan, document);
  const bySection = advisoriesBySection.value;
  const allAdvisories = [...bySection.values()].flat();

  return (
    <aside class="app-rail" aria-label="Document sections">
      {stage !== "in-progress" ? (
        <div class="stage-chip ready">{STAGE_LABELS[stage]}</div>
      ) : null}
      <div class="rail-progress">
        <div class="rail-progress-bar">
          <div class="rail-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span class="rail-progress-label">
          {answered} / {total} required fields
        </span>
      </div>
      <nav>
        <ul class="rail-list">
          {visibleSections.map((section) => {
            const state = sectionState(plan, section);
            const count = bySection.get(section.id)?.length ?? 0;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  class="rail-item"
                  aria-current={
                    activeSectionId.value === section.id ? "true" : undefined
                  }
                  onClick={(event) =>
                    openSection(section.id, event.currentTarget as HTMLElement)
                  }
                >
                  <span class={`rail-check ${state}`} aria-hidden="true" />
                  <span>{section.legend}</span>
                  <span class="sr-only">{STATE_LABELS[state]}</span>
                  {count > 0 ? (
                    <span class="rail-advisory-count">{count}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {allAdvisories.length > 0 ? (
        <div class="field-guidance" style={{ marginTop: "var(--space-4)" }}>
          <strong>Advisories ({allAdvisories.length})</strong>
          {allAdvisories.map((advisory) => (
            <div
              class="advisory"
              style={{ marginTop: "var(--space-2)" }}
              key={advisory.id}
            >
              {advisory.title}
              <button
                type="button"
                class="advisory-inline"
                style={{ marginLeft: "auto" }}
                onClick={(event) =>
                  showAdvisory(advisory, event.currentTarget as HTMLElement)
                }
              >
                View
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
