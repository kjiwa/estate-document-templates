import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { editAffordance } from "./editAffordance";
import { EditingContext, PlanContext } from "./PlanContext";
import { Value } from "./Value";

interface BlankProps {
  path?: Path<Plan>;
  // Overrides the value read from `path`.
  value?: unknown;
  chars?: number;
}

// Empty renders a ruled blank sized in `ch` units;
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
    const { activeClass, editingProps, marker } = editAffordance(editing, path);
    return (
      <>
        <span
          class={`fill-in${activeClass}`}
          data-path={path}
          style={{ width: `${chars}ch` }}
          {...editingProps}
        />
        {marker}
      </>
    );
  }
  return <Value path={path} value={value} />;
}
