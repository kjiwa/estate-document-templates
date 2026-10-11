import { createContext } from "preact";
import { useContext } from "preact/hooks";

import type { Advisory } from "../../model/advisory";
import type { Path } from "../../model/paths";
import type { Plan } from "../../model/plan";

// Set to the live plan in the app and to a literal `Plan` in tests, so clause
// components stay pure functions of the context plan.
export const PlanContext = createContext<Plan | null>(null);

export const HighlightContext = createContext<boolean>(true);

export interface EditingState {
  activePath: string | null;
  // False (the default) keeps providerless renders (standalone export,
  // goldens) on plain markup.
  interactive: boolean;
  labelFor: (path: string) => string;
  // A path with no field in the active document (a locked value such as the
  // domicile) renders as plain markup with no edit affordance.
  isEditable: (path: string) => boolean;
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
