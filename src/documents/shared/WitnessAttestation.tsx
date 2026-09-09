import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "./Blank";
import { PlanContext } from "./PlanContext";
import { Value } from "./Value";
import { WitnessSigColumn } from "./WitnessSigColumn";

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
