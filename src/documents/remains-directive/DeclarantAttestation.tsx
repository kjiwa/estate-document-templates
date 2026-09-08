import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "../shared/Blank";
import { PlanContext } from "../shared/PlanContext";
import { Value } from "../shared/Value";

// Not `../shared/WitnessAttestation` — that component's prose attests to a
// Will ("Last Will and Testament", "Testator") and RCW 68.50.160(1)/(3)(b)
// require different attesting language (signed and dated in the presence
// of a witness, not "published and declared").
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

// The attestation RCW 68.50.160(1) and (3)(b) require: the declarant signed
// and dated the instrument in the presence of a witness. `witnesses[0]`/`[1]`
// read as fixed indices, same as the will's `WitnessAttestation`.
export function DeclarantAttestation() {
  const plan = useContext(PlanContext);
  const declarantPronouns = getPronouns(plan?.party.testator.gender);

  return (
    <div class="witness-block">
      <h2 class="doc-subtitle">Attestation of Witnesses</h2>
      <p class="witness-declaration">
        The foregoing instrument was on the date thereof signed and dated by the
        Declarant, <Blank path="party.testator.name" chars={16} />, in the
        presence of us, who, at <Value value={declarantPronouns.possessive} />{" "}
        request and in <Value value={declarantPronouns.possessive} /> presence,
        have subscribed our names as witnesses thereto, believing the Declarant
        to be of sound mind and under no constraint or undue influence.
      </p>
      <div class="sig-grid">
        <WitnessSigColumn index={0} />
        <WitnessSigColumn index={1} />
      </div>
    </div>
  );
}
