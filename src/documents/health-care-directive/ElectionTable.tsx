import type { ComponentChildren } from "preact";

import type { Path } from "../../model/paths";
import type { Plan } from "../../model/plan";
import { Blank } from "../shared/Blank";
import { usePlan } from "../shared/PlanContext";

interface ElectionRowProps {
  path: Path<Plan>;
  value: string;
  doLabel: ComponentChildren;
  doNotLabel: ComponentChildren;
}

// One row = one field. The left mark cell carries `path`, so a click opens
// that field's editor and an unset election's advisory marker anchors there;
// the right mark cell passes no `path`, so it never becomes a second
// editing target for the same field. Reuses `<Blank>` rather than a bespoke
// mark element: passing an explicit `value` of "X" or "" is exactly Blank's
// existing "value overrides the path lookup" branch, so the elected side
// prints through `<Value>` and the other renders Blank's own ruled blank —
// the same fill-in-by-hand affordance every other unanswered field gets.
function ElectionRow({ path, value, doLabel, doNotLabel }: ElectionRowProps) {
  return (
    <tr class="election-row">
      <td class="election-mark-cell">
        <Blank path={path} value={value === "do" ? "X" : ""} chars={3} />
      </td>
      <td class="election-label-cell">{doLabel}</td>
      <td class="election-mark-cell">
        <Blank value={value === "doNot" ? "X" : ""} chars={3} />
      </td>
      <td class="election-label-cell">{doNotLabel}</td>
    </tr>
  );
}

// Reproduces paragraph (C)'s boxed check-one table — the statutory form RCW
// 70.122.030(1) sets out — as an actual table rather than three prose
// sentences, so it still reads as a form a clinician can act on.
export function ElectionTable() {
  const plan = usePlan();
  const { artificialNutrition, artificialHydration, cpr } =
    plan.documents.healthCareDirective;

  return (
    <table class="election-table">
      <tbody>
        <ElectionRow
          path="documents.healthCareDirective.artificialNutrition"
          value={artificialNutrition}
          doLabel={
            <>
              I <strong>DO</strong> want artificial nutrition.
            </>
          }
          doNotLabel={
            <>
              I <strong>DO NOT</strong> want artificial nutrition.
            </>
          }
        />
        <ElectionRow
          path="documents.healthCareDirective.artificialHydration"
          value={artificialHydration}
          doLabel={
            <>
              I <strong>DO</strong> want artificial hydration.
            </>
          }
          doNotLabel={
            <>
              I <strong>DO NOT</strong> want artificial hydration.
            </>
          }
        />
        <ElectionRow
          path="documents.healthCareDirective.cpr"
          value={cpr}
          doLabel={
            <>
              I <strong>DO</strong> want CPR attempted.
            </>
          }
          doNotLabel={
            <>
              I <strong>DO NOT</strong> want CPR attempted.
            </>
          }
        />
      </tbody>
    </table>
  );
}
