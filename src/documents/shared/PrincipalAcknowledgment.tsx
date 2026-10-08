import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "./Blank";
import { NotarySignature } from "./NotarySignature";
import { NotaryVenue } from "./NotaryVenue";
import { PlanContext } from "./PlanContext";
import { Value } from "./Value";

export function PrincipalAcknowledgment() {
  const plan = useContext(PlanContext);
  const principalPronouns = getPronouns(plan?.party.testator.gender);
  const state = plan?.party.testator.state ?? "";
  const county = plan?.party.testator.county ?? "";

  return (
    <div class="notary-block">
      <div class="notary-heading">Notarial Acknowledgment</div>
      <p class="clause">
        This is the acknowledgment of the Principal's signature that RCW
        11.125.050 provides for.
      </p>
      <NotaryVenue
        statePath="party.testator.state"
        countyPath="party.testator.county"
        state={state}
        county={county}
      />
      <p class="notary-body">
        I certify that I know or have satisfactory evidence that{" "}
        <Blank path="party.testator.name" chars={16} /> is the person who
        appeared before me, and said person acknowledged that{" "}
        <Value value={principalPronouns.subjective} /> signed this instrument
        and acknowledged it to be <Value value={principalPronouns.possessive} />{" "}
        free and voluntary act for the uses and purposes mentioned in the
        instrument.
      </p>
      <div class="notary-jurat">
        Given under my hand and official seal this{" "}
        <Blank path="execution.executionDate.day" chars={5} /> day of{" "}
        <Blank path="execution.executionDate.month" chars={14} />,{" "}
        <Blank path="execution.executionDate.year" chars={6} />.
      </div>
      <NotarySignature />
    </div>
  );
}
