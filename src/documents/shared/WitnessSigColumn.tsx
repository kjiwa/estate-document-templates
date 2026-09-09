import { Blank } from "./Blank";

export function WitnessSigColumn({ index }: { index: 0 | 1 }) {
  return (
    <div class="sig-column">
      <div class="sig-field">
        <div class="sig-field-line" />
        <div class="sig-field-label">Witness Signature</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">
          <Blank path={`execution.witnesses.${index}.name`} chars={20} />
        </div>
        <div class="sig-field-label">Printed Name</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">
          <Blank path={`execution.witnesses.${index}.address`} chars={20} />
        </div>
        <div class="sig-field-label">Residence Address</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">
          <Blank
            path={`execution.witnesses.${index}.cityStateZip`}
            chars={20}
          />
        </div>
        <div class="sig-field-label">City, State, Zip</div>
      </div>
    </div>
  );
}
