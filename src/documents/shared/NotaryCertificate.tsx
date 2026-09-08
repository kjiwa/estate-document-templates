import { useContext } from "preact/hooks";

import { getPronouns } from "../../model/pronouns";
import { Blank } from "./Blank";
import { PlanContext } from "./PlanContext";
import { Value } from "./Value";

// Reproduces `renderNotaryCertificate`. The venue lines are the one site
// that uppercases before interpolating (`will.js:420-421`).
export function NotaryCertificate() {
  const plan = useContext(PlanContext);
  const testatorPronouns = getPronouns(plan?.party.testator.gender);
  const state = plan?.party.testator.state ?? "";
  const county = plan?.party.testator.county ?? "";

  return (
    <div class="notary-block">
      <div class="notary-heading">
        Self-Proving Affidavit &amp; Notarial Certificate
      </div>
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
        Each of the undersigned, being first duly sworn on oath, deposes and
        states under penalty of perjury under the laws of the State of{" "}
        <Blank path="party.testator.state" chars={14} /> that: on the date last
        above written, the Testator,{" "}
        <Blank path="party.testator.name" chars={16} />, in our presence
        declared this instrument to be{" "}
        <Value value={testatorPronouns.possessive} /> Last Will and Testament
        and requested us to act as witnesses; the Testator signed this Will in
        our presence; and we subscribed our names as witnesses in the Testator's
        presence.
      </p>
      <div class="affidavit-sig-row">
        <div class="sig-field">
          <div class="sig-field-line" />
          <div class="sig-field-label">
            Testator Signature — <Blank path="party.testator.name" chars={16} />
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
        Subscribed and sworn to before me this{" "}
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
