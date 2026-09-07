import { createContext } from "preact";
import { useContext } from "preact/hooks";

import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";

// Set to the live `activePlan` signal's value in the app, and to an
// arbitrary literal `Plan` in tests and `preact-render-to-string` calls, so
// every clause component stays a pure function of "whatever plan is in
// context" rather than importing the store module directly.
export const PlanContext = createContext<Plan | null>(null);

// Mirrors `renderWill`'s `options.highlightVariables`.
export const HighlightContext = createContext<boolean>(true);

export function usePlan(): Plan {
  const plan = useContext(PlanContext);
  if (!plan) {
    throw new Error("usePlan() called outside a <PlanContext.Provider>");
  }
  return plan;
}

export function usePlanField(path: Path<Plan>): unknown {
  const plan = usePlan();
  return getPath(plan, path);
}
