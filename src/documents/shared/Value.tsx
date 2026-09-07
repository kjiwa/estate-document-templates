import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { HighlightContext, PlanContext } from "./PlanContext";

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
  const fieldValue =
    value !== undefined
      ? value
      : path !== undefined
        ? plan && getPath(plan, path)
        : undefined;
  const text = toText(fieldValue);

  if (highlight) {
    return (
      <mark class="dynamic-var" data-path={path}>
        {text}
      </mark>
    );
  }
  return <>{text}</>;
}
