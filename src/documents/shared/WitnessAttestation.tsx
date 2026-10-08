import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "./Blank";
import { PlanContext } from "./PlanContext";
import { Value } from "./Value";
import { WitnessBlock } from "./WitnessBlock";

export function WitnessAttestation() {
  const plan = useContext(PlanContext);
  const testatorPronouns = getPronouns(plan?.party.testator.gender);

  return (
    <WitnessBlock title="Attestation of Witnesses">
      The foregoing instrument was on the date thereof signed, published, and
      declared by the Testator, <Blank path="party.testator.name" chars={16} />,
      to be <Value value={testatorPronouns.possessive} /> Last Will and
      Testament, in the presence of us, who, at{" "}
      <Value value={testatorPronouns.possessive} /> request and in{" "}
      <Value value={testatorPronouns.possessive} /> presence, have subscribed
      our names as attesting witnesses thereto, believing the Testator to be of
      sound mind and memory and under no constraint or undue influence.
    </WitnessBlock>
  );
}
