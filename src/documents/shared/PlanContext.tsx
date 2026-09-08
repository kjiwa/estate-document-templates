import { createContext } from "preact";
import { useContext } from "preact/hooks";

import type { Advisory } from "../will/review";
import { getPath, type Path } from "../../model/paths";
import type { Plan } from "../../model/plan";

// Set to the live `activePlan` signal's value in the app, and to an
// arbitrary literal `Plan` in tests and `preact-render-to-string` calls, so
// every clause component stays a pure function of "whatever plan is in
// context" rather than importing the store module directly.
export const PlanContext = createContext<Plan | null>(null);

// Mirrors `renderWill`'s `options.highlightVariables`.
export const HighlightContext = createContext<boolean>(true);

export interface EditingState {
  activePath: string | null;
  // Whether click/keyboard editing affordances should render at all —
  // false (the default) keeps `standaloneHtml.ts` and every golden render,
  // which mount `<Value>`/`<Blank>` with no provider, on plain markup.
  interactive: boolean;
  labelFor: (path: string) => string;
  // Advisories concerning a path — defaulting to a no-op keeps
  // `standaloneHtml.ts` and every golden render, which mount
  // `<Value>`/`<Blank>` with no provider, on plain markup.
  advisoriesFor: (path: string) => Advisory[];
}

export const EditingContext = createContext<EditingState>({
  activePath: null,
  interactive: false,
  labelFor: (path) => path,
  advisoriesFor: () => [],
});

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
