import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "../shared/Blank";
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
      <div class="notary-venue">
        STATE OF{" "}
        <Blank
          path="party.testator.state"
          value={state ? state.toUpperCase() : ""}
          chars={14}
        />{" "}
        )<br />
        {"\n"}
        COUNTY OF{" "}
        <Blank
          path="party.testator.county"
          value={county ? county.toUpperCase() : ""}
          chars={12}
        />{" "}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) ss.
      </div>
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
      <div class="notary-sig-row">
        <div class="sig-column">
          <div class="sig-field">
            <div class="sig-field-line" />
            <div class="sig-field-label">Signature of Notary Public</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line">
              <Blank path="execution.notary.name" chars={20} />
            </div>
            <div class="sig-field-label">Printed Name</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line" />
            <div class="sig-field-label">Title</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line">
              <Blank path="execution.notary.commissionExpires" chars={20} />
            </div>
            <div class="sig-field-label">Commission Expires</div>
          </div>
        </div>
        <div class="notary-seal-box">Notary Seal Box</div>
      </div>
    </div>
  );
}
