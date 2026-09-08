import type { DocumentDefinition } from "../documents/registry";
import type { Plan } from "../model/plan";
import { documentCompletion, sectionCompletion } from "../ui/completion";

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

  return (
    <aside class="app-rail" aria-label="Document sections">
      <div class="rail-progress">
        <div class="rail-progress-bar">
          <div class="rail-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span class="rail-progress-label">
          {answered} / {total} fields
        </span>
      </div>
      <nav>
        <ul class="rail-list">
          {visibleSections.map((section) => {
            const { complete } = sectionCompletion(plan, section);
            return (
              <li key={section.id} class="rail-item">
                <span class={`rail-check ${complete ? "done" : ""}`} />
                <span>{section.legend}</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
