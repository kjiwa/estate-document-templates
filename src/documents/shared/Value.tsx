import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import type { Advisory } from "../../model/advisory";
import { showAdvisory } from "../../ui/advisories";
import { EditingContext, HighlightContext, PlanContext } from "./PlanContext";

// Sits outside the `<mark>`/`[data-path]` element so `DocumentSurface`'s
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

interface ValueProps {
  path?: Path<Plan>;
  // Overrides the value read from `path` — e.g. `will.js`'s uppercased
  // notary venue. When both are given, `path` still supplies `data-path`.
  value?: unknown;
}

function toText(raw: unknown): string {
  return raw === null || raw === undefined ? "" : String(raw);
}

// Reproduces `wrapVar`: highlighted values render inside
// `<mark class="dynamic-var">`, carrying `data-path` for Phase 4b; plain
// text has no element to carry an attribute on, same as the original.
export function Value({ path, value }: ValueProps) {
  const highlight = useContext(HighlightContext);
  const plan = useContext(PlanContext);
  const editing = useContext(EditingContext);
  const fieldValue =
    value !== undefined
      ? value
      : path !== undefined
        ? plan && getPath(plan, path)
        : undefined;
  const text = toText(fieldValue);

  if (highlight) {
    const interactive = editing.interactive && path !== undefined;
    const activeClass =
      interactive && editing.activePath === path ? " field-active" : "";
    const editingProps = interactive
      ? {
          tabindex: 0,
          role: "button" as const,
          "aria-label": `Edit ${editing.labelFor(path as string)}`,
        }
      : {};
    const pathAdvisories = interactive
      ? editing.advisoriesFor(path as string)
      : [];
    return (
      <>
        <mark
          class={`dynamic-var${activeClass}`}
          data-path={path}
          {...editingProps}
        >
          {text}
        </mark>
        {pathAdvisories.length > 0 ? (
          <AdvisoryMarker advisories={pathAdvisories} />
        ) : null}
      </>
    );
  }
  return <>{text}</>;
}
