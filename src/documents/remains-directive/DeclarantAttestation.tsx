import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "../shared/Blank";
import { PlanContext } from "../shared/PlanContext";
import { Value } from "../shared/Value";
import { WitnessSigColumn } from "../shared/WitnessSigColumn";

// Not `../shared/WitnessAttestation` — that component's prose attests to a
// Will ("Last Will and Testament", "Testator") and RCW 68.50.160(1)/(3)(b)
// require different attesting language (signed and dated in the presence
// of a witness, not "published and declared").
//
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
