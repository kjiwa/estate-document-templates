import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { editAffordance } from "./editAffordance";
import { EditingContext, HighlightContext, PlanContext } from "./PlanContext";

interface ValueProps {
  path?: Path<Plan>;
  // Overrides the value read from `path`. When both are given, `path` still
  // supplies `data-path`.
  value?: unknown;
}

function toText(raw: unknown): string {
  return raw === null || raw === undefined ? "" : String(raw);
}

// Highlighted values render inside `<mark class="dynamic-var">`, carrying
// `data-path`; plain text has no element to carry an attribute on.
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
    const { activeClass, editingProps, marker } = editAffordance(editing, path);
    return (
      <>
        <mark
          class={`dynamic-var${activeClass}`}
          data-path={path}
          {...editingProps}
        >
          {text}
        </mark>
        {marker}
      </>
    );
  }
  return <>{text}</>;
}
