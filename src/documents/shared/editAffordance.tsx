import type { Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import type { Advisory } from "../../model/advisory";
import { showAdvisory } from "../../ui/advisories";
import type { EditingState } from "./PlanContext";

// Sits outside the `[data-path]` element so `DocumentSurface`'s
// `closest("[data-path]")` click delegation does not also fire and open the
// field editor underneath it.
function AdvisoryMarker({ advisories }: { advisories: Advisory[] }) {
  const advisory = advisories[0]!;
  return (
    <button
      type="button"
      class="advisory-inline"
      aria-label={`${advisory.title}: ${advisory.message}`}
      onClick={(event) => {
        event.stopPropagation();
        showAdvisory(advisory, event.currentTarget as HTMLElement);
      }}
    >
      ⚠
    </button>
  );
}

export function editAffordance(editing: EditingState, path?: Path<Plan>) {
  const interactive =
    editing.interactive && path !== undefined && editing.isEditable(path);
  const activeClass =
    interactive && editing.activePath === path ? " field-active" : "";
  const editingProps = interactive
    ? {
        tabindex: 0,
        role: "button" as const,
        "aria-label": `Edit ${editing.labelFor(path as string)}`,
      }
    : {};
  const advisories = interactive ? editing.advisoriesFor(path as string) : [];
  const marker =
    advisories.length > 0 ? <AdvisoryMarker advisories={advisories} /> : null;
  return { activeClass, editingProps, marker };
}
