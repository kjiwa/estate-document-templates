import { createContext } from "preact";
import { useContext } from "preact/hooks";

import type { Advisory } from "../../model/advisory";
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
  // A path with no field in the active document (a locked value such as the
  // domicile) renders as plain markup with no edit affordance.
  isEditable: (path: string) => boolean;
  // Advisories concerning a path — defaulting to a no-op keeps
  // `standaloneHtml.ts` and every golden render, which mount
  // `<Value>`/`<Blank>` with no provider, on plain markup.
  advisoriesFor: (path: string) => Advisory[];
}

export const EditingContext = createContext<EditingState>({
  activePath: null,
  interactive: false,
  labelFor: (path) => path,
  isEditable: () => false,
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

// Base path of the document's own execution record, e.g. "executions.will".
// Each document's Body provides it so the shared signature components read
// and write that document's record rather than a shared one.
export const ExecutionContext = createContext<string | null>(null);

export function useExecutionPath(): (suffix: string) => Path<Plan> {
  const base = useContext(ExecutionContext);
  if (!base) {
    throw new Error(
      "useExecutionPath() called outside an <ExecutionContext.Provider>"
    );
  }
  return (suffix) => `${base}.${suffix}` as Path<Plan>;
}
