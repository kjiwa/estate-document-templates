import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "../shared/Blank";
import { PlanContext } from "../shared/PlanContext";
import { Value } from "../shared/Value";
import { WitnessBlock } from "../shared/WitnessBlock";

// RCW 68.50.160(1) and (3)(b) require attestation that the declarant signed
// and dated the instrument in the presence of a witness, not the will's
// "published and declared".
export function DeclarantAttestation() {
  const plan = useContext(PlanContext);
  const declarantPronouns = getPronouns(plan?.party.testator.gender);

  return (
    <WitnessBlock title="Attestation of Witnesses">
      The foregoing instrument was on the date thereof signed and dated by the
      Declarant, <Blank path="party.testator.name" chars={16} />, in the
      presence of us, who, at <Value value={declarantPronouns.possessive} />{" "}
      request and in <Value value={declarantPronouns.possessive} /> presence,
      have subscribed our names as witnesses thereto, believing the Declarant to
      be of sound mind and under no constraint or undue influence.
    </WitnessBlock>
  );
}
