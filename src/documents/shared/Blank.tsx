import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import type { Advisory } from "../will/review";
import { showAdvisory } from "../../ui/advisories";
import { EditingContext, PlanContext } from "./PlanContext";
import { Value } from "./Value";

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

interface BlankProps {
  path?: Path<Plan>;
  // Overrides the value read from `path` — e.g. `will.js`'s uppercased
  // notary venue.
  value?: unknown;
  chars?: number;
}

// Reproduces `fillIn`: empty renders a ruled blank sized in `ch` units;
// otherwise defers to `<Value>`.
export function Blank({ path, value, chars = 10 }: BlankProps) {
  const plan = useContext(PlanContext);
  const editing = useContext(EditingContext);
  const raw =
    value !== undefined
      ? value
      : path !== undefined
        ? plan && getPath(plan, path)
        : undefined;

  if (raw === null || raw === undefined || raw === "") {
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
        <span
          class={`fill-in${activeClass}`}
          data-path={path}
          style={{ width: `${chars}ch` }}
          {...editingProps}
        />
        {pathAdvisories.length > 0 ? (
          <AdvisoryMarker advisories={pathAdvisories} />
        ) : null}
      </>
    );
  }
  return <Value path={path} value={value} />;
}
