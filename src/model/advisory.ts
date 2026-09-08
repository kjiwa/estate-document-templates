import type { Path } from "./paths";
import type { Plan } from "./plan";

// A review finding tied to a field. Lives here, not under any one
// document's `review.ts`, because `documents/shared/` (PlanContext, Value,
// Blank) reads this type and must not depend on a specific document.
export interface Advisory {
  id: string;
  severity: "info" | "warning";
  title: string;
  message: string;
  path: Path<Plan>;
}
