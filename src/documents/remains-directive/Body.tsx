import { Article } from "../shared/Article";
import { Blank } from "../shared/Blank";
import { Clause } from "../shared/Clause";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { Value } from "../shared/Value";
import { usePlan } from "../shared/PlanContext";
import { DeclarantAcknowledgment } from "./DeclarantAcknowledgment";
import { DeclarantAttestation } from "./DeclarantAttestation";

// The Disposition of Remains Directive under RCW 68.50.160. Phase 5's proof
// of the Phase 3 seam: every value below reads `party.testator`,
// `fiduciaries.remains`, and `execution` — fields the will already declares
// — so this document adds zero schema. RCW text quoted in comments below
// was fetched live from app.leg.wa.gov this session; see the child plan's
// Progress section for the full text.
const INSTRUMENT = "Disposition of Remains Directive";
const ROLE = "Declarant";

function TitleAndPreamble() {
  return (
    <>
      <h1 id="doc-title" class="doc-title">
        <span class="doc-title-line">Disposition of Remains Directive</span>
        <span class="doc-title-line">of</span>
        <span class="doc-title-line">
          <Blank path="party.testator.name" chars={20} />
        </span>
      </h1>
      {"\n"}
      <p class="doc-preamble">
        I, <Blank path="party.testator.name" chars={16} />, a resident of{" "}
        <Blank path="party.testator.county" chars={12} /> County,{" "}
        <Blank path="party.testator.state" chars={14} />, being of sound mind,
        declare this to be my Disposition of Remains Directive pursuant to RCW
        68.50.160, and I revoke all prior directives, designations, and
        directions regarding the disposition of my remains made by me.
      </p>
    </>
  );
}

function Article1() {
  const plan = usePlan();
  const preference = plan.fiduciaries.remains.preference;

  return (
    <Article number={1} title="Designation of Agent">
      <Clause
        articleNum={1}
        clauses={[
          {
            title: "Designation of Agent",
            body: (
              <>
                Pursuant to RCW 68.50.160(3)(b), I appoint{" "}
                <Blank path="fiduciaries.remains.agent" chars={16} /> as my
                agent to direct the disposition of my remains, including
                decisions concerning burial, cremation, and funeral
                arrangements. My agent's direction is sufficient to direct the
                type, place, and method of disposition of my remains. If{" "}
                <Blank path="fiduciaries.remains.agent" chars={16} /> is unable
                or unwilling to act, I appoint{" "}
                <Blank path="fiduciaries.remains.alternate" chars={16} /> as my
                alternate agent.
              </>
            ),
          },
          preference
            ? {
                title: "Wishes",
                body: (
                  <>
                    Without imposing any binding obligation on my agent, my
                    wishes regarding the place or method of disposition of my
                    remains are: <Value value={preference} />.
                  </>
                ),
              }
            : null,
        ]}
      />
    </Article>
  );
}

function Article2() {
  return (
    <Article number={2} title="Effect, Priority, and Revocation">
      <Clause
        articleNum={2}
        clauses={[
          {
            title: "Priority of Designation",
            body: (
              <>
                This designation of agent, made through a written document
                signed and dated by me in the presence of a witness pursuant to
                RCW 68.50.160(3)(b), takes priority over the surviving spouse or
                state registered domestic partner, surviving adult children,
                surviving parents, surviving siblings, and court-appointed
                guardian named in RCW 68.50.160(3)(c) through (g).
              </>
            ),
          },
          {
            title: "Revocation",
            body: (
              <>
                I revoke all prior designations of an agent to control the
                disposition of my remains made by me. This Directive remains
                effective until I revoke it in a signed writing.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article3() {
  return (
    <Article number={3} title="Severability and Governing Law">
      <Clause
        articleNum={3}
        clauses={[
          {
            title: "Severability",
            body: (
              <>
                If any provision of this Directive is held invalid or
                unenforceable, such invalidity shall not affect the remaining
                provisions, which shall continue in full force and effect.
              </>
            ),
          },
          {
            title: "Governing Law",
            body: (
              <>
                This Directive shall be construed and governed in accordance
                with the laws of the State of Washington.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

// Ports the will's `Body` structure: preamble, articles, testimonium +
// principal signature, witness attestation, notarial acknowledgment.
export function Body() {
  return (
    <>
      <TitleAndPreamble />
      {"\n"}
      <Article1 />
      {"\n"}
      <Article2 />
      {"\n"}
      <Article3 />
      {"\n"}
      <Testimonium instrument={INSTRUMENT} />
      {"\n"}
      <SignatureBlock role={ROLE} />
      {"\n"}
      <DeclarantAttestation />
      {"\n"}
      <DeclarantAcknowledgment />
    </>
  );
}
