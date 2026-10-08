import { Blank } from "./Blank";
import { useExecutionPath } from "./PlanContext";

export function WitnessSigColumn({ index }: { index: 0 | 1 }) {
  const at = useExecutionPath();
  return (
    <div class="sig-column">
      <div class="sig-field">
        <div class="sig-field-line" />
        <div class="sig-field-label">Witness Signature</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">
          <Blank path={at(`witnesses.${index}.name`)} chars={20} />
        </div>
        <div class="sig-field-label">Printed Name</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">
          <Blank path={at(`witnesses.${index}.address`)} chars={20} />
        </div>
        <div class="sig-field-label">Residence Address</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">
          <Blank path={at(`witnesses.${index}.cityStateZip`)} chars={20} />
        </div>
        <div class="sig-field-label">City, State, Zip</div>
      </div>
    </div>
  );
}
