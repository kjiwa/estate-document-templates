import type { Plan } from "../../model/plan";
import type { Path } from "../../model/paths";
import { Blank } from "./Blank";

export function NotaryVenue({
  statePath,
  countyPath,
  state,
  county,
}: {
  statePath: Path<Plan>;
  countyPath: Path<Plan>;
  state: string;
  county: string;
}) {
  return (
    <div class="notary-venue">
      STATE OF{" "}
      <Blank
        path={statePath}
        value={state ? state.toUpperCase() : ""}
        chars={14}
      />{" "}
      )<br />
      {"\n"}
      COUNTY OF{" "}
      <Blank
        path={countyPath}
        value={county ? county.toUpperCase() : ""}
        chars={12}
      />{" "}
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) ss.
    </div>
  );
}
