import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { EditingContext, PlanContext } from "./PlanContext";
import { Value } from "./Value";

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
    return (
      <span
        class={`fill-in${activeClass}`}
        data-path={path}
        style={{ width: `${chars}ch` }}
        {...editingProps}
      />
    );
  }
  return <Value path={path} value={value} />;
}
