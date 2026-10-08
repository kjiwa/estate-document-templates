import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "../shared/Blank";
import { NotarySignature } from "../shared/NotarySignature";
import { NotaryVenue } from "../shared/NotaryVenue";
import { PlanContext } from "../shared/PlanContext";
import { Value } from "../shared/Value";

// Not `../shared/NotaryCertificate` — that component is a Will's
// self-proving affidavit under RCW 11.20.020, a sworn statement by the
// witnesses. RCW 68.50.160 has no self-proving-affidavit equivalent; this
// is an ordinary notarial acknowledgment of the Declarant's own signature —
// included because it is not required, so its prose must not claim
// otherwise. See `../guidance.ts`'s "notary" entry.
export function DeclarantAcknowledgment() {
  const plan = useContext(PlanContext);
  const declarantPronouns = getPronouns(plan?.party.testator.gender);
  const state = plan?.party.testator.state ?? "";
  const county = plan?.party.testator.county ?? "";

  return (
    <div class="notary-block">
      <div class="notary-heading">Notarial Acknowledgment</div>
      <p class="clause">
        This acknowledgment is not required by RCW 68.50.160 for this Directive
        to be effective; it is included so that a funeral establishment or
        cemetery authority receiving this instrument has independent proof of
        the Declarant's signature.
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
        <Value value={declarantPronouns.subjective} /> signed and dated this
        instrument in the presence of the witnesses named below, and
        acknowledged it to be <Value value={declarantPronouns.possessive} />{" "}
        free and voluntary act for the uses and purposes stated in it.
      </p>
      <div class="affidavit-sig-row">
        <div class="sig-field">
          <div class="sig-field-line" />
          <div class="sig-field-label">
            Declarant Signature —{" "}
            <Blank path="party.testator.name" chars={16} />
          </div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line" />
          <div class="sig-field-label">
            Witness Signature —{" "}
            <Blank path="execution.witnesses.0.name" chars={12} />
          </div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line" />
          <div class="sig-field-label">
            Witness Signature —{" "}
            <Blank path="execution.witnesses.1.name" chars={12} />
          </div>
        </div>
      </div>
      <div class="notary-jurat">
        Subscribed and acknowledged before me this{" "}
        <Blank path="execution.executionDate.day" chars={5} /> day of{" "}
        <Blank path="execution.executionDate.month" chars={14} />,{" "}
        <Blank path="execution.executionDate.year" chars={6} />.
      </div>
      <NotarySignature />
    </div>
  );
}
