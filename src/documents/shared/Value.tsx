import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { EditingContext, HighlightContext, PlanContext } from "./PlanContext";

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
    return (
      <mark
        class={`dynamic-var${activeClass}`}
        data-path={path}
        {...editingProps}
      >
        {text}
      </mark>
    );
  }
  return <>{text}</>;
}
