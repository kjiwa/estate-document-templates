import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "./Blank";
import { PlanContext } from "./PlanContext";
import { Value } from "./Value";

function WitnessSigColumn({ index }: { index: 0 | 1 }) {
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

// Reproduces `renderWitnessAttestation`. `witnesses[0]`/`[1]` are read as
// fixed indices, same as today — `js/app.js` binds `witnesses.0.*` and
// `witnesses.1.*` by fixed index too.
export function WitnessAttestation() {
  const plan = useContext(PlanContext);
  const testatorPronouns = getPronouns(plan?.party.testator.gender);

  return (
    <div class="witness-block">
      <h2 class="doc-subtitle">Attestation of Witnesses</h2>
      <p class="witness-declaration">
        The foregoing instrument was on the date thereof signed, published, and
        declared by the Testator,{" "}
        <Blank path="party.testator.name" chars={16} />, to be{" "}
        <Value value={testatorPronouns.possessive} /> Last Will and Testament,
        in the presence of us, who, at{" "}
        <Value value={testatorPronouns.possessive} /> request and in{" "}
        <Value value={testatorPronouns.possessive} /> presence, have subscribed
        our names as attesting witnesses thereto, believing the Testator to be
        of sound mind and memory and under no constraint or undue influence.
      </p>
      <div class="sig-grid">
        <WitnessSigColumn index={0} />
        <WitnessSigColumn index={1} />
      </div>
    </div>
  );
}
