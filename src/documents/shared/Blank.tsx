import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { PlanContext } from "./PlanContext";
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
  const raw =
    value !== undefined
      ? value
      : path !== undefined
        ? plan && getPath(plan, path)
        : undefined;

  if (raw === null || raw === undefined || raw === "") {
    return (
      <span class="fill-in" data-path={path} style={{ width: `${chars}ch` }} />
    );
  }
  return <Value path={path} value={value} />;
}
