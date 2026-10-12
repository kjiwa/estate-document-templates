import { getPronouns } from "../../model/pronouns";
import type { Plan } from "../../model/plan";
import { Article } from "../shared/Article";
import { Blank } from "../shared/Blank";
import { Clause } from "../shared/Clause";
import { NotarialAcknowledgment } from "../shared/NotarialAcknowledgment";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { Value } from "../shared/Value";
import { ExecutionContext, usePlan } from "../shared/PlanContext";
import { isMarried } from "../will/Body";

const INSTRUMENT = "Revocable Living Trust";
const ROLE = "Trustor and Trustee";

function isJoint(plan: Plan): boolean {
  return plan.documents.revocableTrust.kind === "joint";
}

function TrustorNames() {
  const plan = usePlan();
  return (
    <>
      <Blank path="party.testator.name" chars={16} />
      {isJoint(plan) && (
        <>
          {" and "}
          <Blank path="party.spouse.name" chars={16} />
        </>
      )}
    </>
  );
}

function TitleAndPreamble() {
  const plan = usePlan();
  const joint = isJoint(plan);
  return (
    <>
      <h1 id="doc-title" class="doc-title">
        <span class="doc-title-line">Revocable Living Trust</span>
        <span class="doc-title-line">of</span>
        <span class="doc-title-line">
          <TrustorNames />
        </span>
      </h1>
      {"\n"}
      <p class="doc-preamble">
        This Revocable Living Trust is made in the State of{" "}
        <Blank path="party.testator.state" chars={14} /> by <TrustorNames />,{" "}
        {joint ? "spouses residing in" : "a resident of"}{" "}
        <Blank path="party.testator.county" chars={12} /> County{" "}
        {joint
          ? "(together, the Trustors, and each, a Trustor)"
          : "(the Trustor)"}
        , who {joint ? "also accept" : "also accepts"} appointment as the first
        trustee (the Trustee).
      </p>
    </>
  );
}

function Article1() {
  const plan = usePlan();
  const joint = isJoint(plan);
  return (
    <Article number={1} title="Declaration and Name">
      <Clause
        articleNum={1}
        clauses={[
          {
            title: "Declaration",
            body: (
              <>
                {joint
                  ? "Each Trustor declares that the Trustor holds"
                  : "The Trustor declares that the Trustor holds"}{" "}
                and will hold the property described in Schedule A, and all
                property later added to this Trust, in trust for the purposes
                and on the terms stated in this instrument. This Trust is
                created under RCW 11.98.011.{" "}
                {joint
                  ? "Each Trustor declares that the Trustor has"
                  : "The Trustor declares that the Trustor has"}{" "}
                the capacity required by RCW 11.103.020 to create this Trust,
                which is the same capacity required to make a will.
              </>
            ),
          },
          {
            title: "Name",
            body: (
              <>
                This Trust is known as{" "}
                <Blank path="documents.revocableTrust.trustName" chars={24} />,
                and property may be held in the name of the Trustee of this
                Trust under that name.
              </>
            ),
          },
          {
            title: "Trust Property",
            body: (
              <>
                {joint ? "Each Trustor transfers" : "The Trustor transfers"} to
                the Trustee the property listed in Schedule A.{" "}
                {joint ? "A Trustor" : "The Trustor"}, or any other person, may
                add property to this Trust at any time by transfer to the
                Trustee, whether or not Schedule A is amended to list it.
                Property is held in this Trust only if it has been transferred
                to the Trustee.
              </>
            ),
          },
          {
            title: "Trustees",
            body: (
              <>
                {joint
                  ? "The Trustors serve together as the first trustees of this Trust. When one Trustor dies or is unable to act, the other serves as sole trustee."
                  : "The Trustor serves as the first trustee of this Trust."}{" "}
                After that, the Trustee is the person named in Article 5.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article2() {
  const plan = usePlan();
  const joint = isJoint(plan);
  return (
    <Article number={2} title="Revocation and Amendment">
      <Clause
        articleNum={2}
        clauses={[
          {
            title: "Revocable Trust",
            body: (
              <>
                This Trust is revocable, as RCW 11.103.030 requires of a trust
                that is to be revocable. A Trustor may revoke this Trust, in
                whole or as to any property the Trustor has contributed, by a
                signed writing delivered to the Trustee
                {joint ? ", subject to Section 2.3" : ""}.
              </>
            ),
          },
          {
            title: "Amendment",
            body: (
              <>
                {joint
                  ? "The Trustors may amend this Trust together by a signed writing delivered to the Trustee."
                  : "The Trustor may amend this Trust by a signed writing delivered to the Trustee."}{" "}
                The Trustee may not amend this Trust. An amendment that changes
                the Trustee's duties requires the Trustee's consent.
              </>
            ),
          },
          joint
            ? {
                title: "Joint Trust Rules",
                body: (
                  <>
                    As RCW 11.103.030 provides for a trust created by spouses,
                    either Trustor acting alone may revoke this Trust as to
                    community property, and the Trustor who contributed separate
                    property may revoke it as to that property. This Trust may
                    be amended only by both Trustors acting together. Placing
                    property in this Trust does not change its character as
                    community property or separate property. The Trustee shall
                    promptly notify the other Trustor of any revocation by one
                    Trustor.
                  </>
                ),
              }
            : null,
          {
            title: "Agent of a Trustor",
            body: (
              <>
                A person acting for a Trustor under a power of attorney may
                revoke or amend this Trust only to the extent that RCW
                11.103.030 allows and both the power of attorney and this Trust
                permit.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article3() {
  const plan = usePlan();
  const joint = isJoint(plan);
  return (
    <Article number={3} title="Rights of the Trustor During Life">
      <Clause
        articleNum={3}
        clauses={[
          {
            title: "Duties Owed to the Trustor",
            body: (
              <>
                While {joint ? "a Trustor is" : "the Trustor is"} living, the
                Trustee owes the duties of a trustee exclusively to{" "}
                {joint ? "the living Trustors" : "the Trustor"}, as RCW
                11.103.040 provides.
              </>
            ),
          },
          {
            title: "Income and Principal",
            body: (
              <>
                During the lifetime of {joint ? "the Trustors" : "the Trustor"},
                the Trustee shall pay to or apply for the benefit of{" "}
                {joint ? "the Trustors" : "the Trustor"} as much of the income
                and principal as {joint ? "they direct" : "the Trustor directs"}
                .
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article4() {
  const plan = usePlan();
  const joint = isJoint(plan);
  return (
    <Article number={4} title="Incapacity of a Trustor">
      <Clause
        articleNum={4}
        clauses={[
          {
            title: "Determination",
            body: (
              <>
                A Trustor is incapacitated when two licensed physicians certify
                in writing that the Trustor cannot manage property and financial
                affairs, or when a court so finds. A Trustor ceases to be
                incapacitated on a like written certification of recovery.
              </>
            ),
          },
          {
            title: "Effect",
            body: (
              <>
                {joint
                  ? "If one Trustor is incapacitated, the other serves as sole trustee. If both are incapacitated, the successor trustee named in Article 5 serves."
                  : "If the Trustor is incapacitated, the successor trustee named in Article 5 serves."}{" "}
                While a Trustor is incapacitated, the Trustee shall apply as
                much of the trust property as is needed for that Trustor's
                health, support, and maintenance.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article5() {
  const joint = isJoint(usePlan());
  return (
    <Article number={5} title="Successor Trustees">
      <Clause
        articleNum={5}
        clauses={[
          {
            title: "Appointment",
            body: (
              <>
                When no Trustor can serve as trustee,{" "}
                {joint ? "the Trustors name" : "the Trustor names"}{" "}
                <Blank
                  path="documents.revocableTrust.successorTrustees.primary"
                  chars={16}
                />{" "}
                as successor Trustee. If that person is unable or unwilling to
                serve, {joint ? "the Trustors name" : "the Trustor names"}{" "}
                <Blank
                  path="documents.revocableTrust.successorTrustees.alternate"
                  chars={16}
                />{" "}
                as alternate successor Trustee.
              </>
            ),
          },
          {
            title: "Resignation and Vacancy",
            body: (
              <>
                A Trustee may resign by written notice to the Trustor, or if
                none can act, to the beneficiaries then eligible to receive
                distributions. If no named Trustee can serve, the adult
                beneficiaries then eligible to receive distributions may appoint
                a trustee, or a court may.
              </>
            ),
          },
          {
            title: "Bond and Compensation",
            body: (
              <>
                No Trustee need give bond. A Trustee is entitled to reasonable
                compensation and to reimbursement of expenses properly incurred.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function FinalTakerClause() {
  const plan = usePlan();
  const married = isMarried(plan);
  const joint = isJoint(plan);
  const finalTaker = plan.documents.revocableTrust.finalTaker;
  const pronouns = getPronouns(finalTaker.gender);
  const lead =
    joint || !married
      ? "If no descendant of the last surviving Trustor survives that Trustor"
      : "If neither the Trustor's spouse nor any descendant of the Trustor survives the Trustor";
  return (
    <>
      {lead}, the remaining trust property shall be distributed to{" "}
      {joint ? "the last surviving Trustor's" : "the Trustor's"}{" "}
      <Blank
        path="documents.revocableTrust.finalTaker.relationship"
        chars={12}
      />
      , <Blank path="documents.revocableTrust.finalTaker.name" chars={16} />, or
      if <Value value={pronouns.subjective} /> does not survive{" "}
      {joint || !married ? "the last surviving Trustor" : "the Trustor"}, to{" "}
      {joint
        ? "the heirs at law of the last surviving Trustor"
        : "the Trustor's heirs at law"}{" "}
      determined under the laws of the State of Washington.
    </>
  );
}

function Article6() {
  const plan = usePlan();
  const joint = isJoint(plan);
  const married = isMarried(plan);
  const spouseFirst = !joint && married;
  return (
    <Article number={6} title="Disposition After Death">
      <Clause
        articleNum={6}
        clauses={[
          joint
            ? {
                title: "Death of the First Trustor",
                body: (
                  <>
                    When the first Trustor dies, this Trust continues. The
                    Trustee shall hold all trust property for the surviving
                    Trustor. The surviving Trustor may revoke or amend this
                    Trust as to all trust property by a signed writing delivered
                    to the Trustee. On the death of the surviving Trustor,
                    Article 6 applies.
                  </>
                ),
              }
            : null,
          {
            title: "Expenses",
            body: (
              <>
                After the death of the last surviving Trustor, the Trustee may
                pay from the trust property{" "}
                {joint ? "each Trustor's" : "the Trustor's"} legally enforceable
                debts, the expenses of {joint ? "each Trustor's" : "the"} last
                illness and funeral, and the expenses of administering this
                Trust, to the extent {joint ? "the Trustors'" : "the Trustor's"}{" "}
                other property is insufficient.
              </>
            ),
          },
          spouseFirst
            ? {
                title: "Gift to Spouse",
                body: (
                  <>
                    The Trustee shall distribute the remaining trust property to
                    the Trustor's spouse,{" "}
                    <Blank path="party.spouse.name" chars={16} />, if the
                    Trustor's spouse survives the Trustor.
                  </>
                ),
              }
            : null,
          {
            title: "Gift to Descendants",
            body: (
              <>
                {spouseFirst
                  ? "If the Trustor's spouse does not survive the Trustor, the"
                  : "After the death of the last surviving Trustor, the"}{" "}
                Trustee shall distribute the remaining trust property to the
                then-surviving descendants of the last surviving Trustor, by
                right of representation pursuant to RCW 11.02.005(18), subject
                to Article 7 for any beneficiary under the age of twenty-five
                (25) years.
              </>
            ),
          },
          {
            title: "Final Taker",
            body: <FinalTakerClause />,
          },
        ]}
      />
    </Article>
  );
}

function Article7() {
  return (
    <Article number={7} title="Trust Shares for Young Beneficiaries">
      <Clause
        articleNum={7}
        clauses={[
          {
            title: "Support Standard",
            body: (
              <>
                Any share allocated to a beneficiary under age twenty-five (25)
                shall be held in a separate trust by the Trustee. The Trustee
                may distribute so much of the income and principal as necessary
                or advisable for the beneficiary's health, education, support,
                and maintenance.
              </>
            ),
          },
          {
            title: "Final Distribution",
            body: (
              <>
                When a beneficiary attains the age of twenty-five (25) years,
                the Trustee shall distribute to the beneficiary the remaining
                balance of that trust share outright and free of trust.
              </>
            ),
          },
          {
            title: "Small Trust Termination",
            body: (
              <>
                If the principal of any trust share falls below Fifteen Thousand
                Dollars ($15,000), the Trustee may terminate the trust share and
                distribute the remainder outright to the beneficiary.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article8() {
  const joint = isJoint(usePlan());
  return (
    <Article number={8} title="Spendthrift Provision">
      <p class="clause">
        Pursuant to RCW 6.32.250, no interest of any beneficiary under this
        Trust shall be subject to anticipation, assignment, pledge, attachment,
        execution, or the claims of creditors of any beneficiary before actual
        distribution by the Trustee. This provision does not apply to the rights
        of {joint ? "a Trustor" : "the Trustor"} over the trust property during{" "}
        {joint ? "that Trustor's" : "the Trustor's"} life.
      </p>
    </Article>
  );
}

function Article9() {
  const joint = isJoint(usePlan());
  return (
    <Article number={9} title="Powers of the Trustee">
      <p class="clause">
        In addition to all powers granted by law under chapter 11.98 RCW,
        including RCW 11.98.070, the Trustee has full power to manage and
        administer the trust property, including the power to retain, buy, and
        sell property of every kind, to invest and reinvest, to open and manage
        accounts, to lease, to borrow, and to pay taxes and expenses. The
        Trustee shall keep accurate records of the trust property and shall
        furnish an account to{" "}
        {joint ? "each living Trustor" : "the living Trustor"} on request.
      </p>
    </Article>
  );
}

function Article10() {
  return (
    <Article number={10} title="General Provisions">
      <Clause
        articleNum={10}
        clauses={[
          {
            title: "Governing Law",
            body: (
              <>
                The laws of the State of Washington govern the construction and
                administration of this Trust.
              </>
            ),
          },
          {
            title: "Severability",
            body: (
              <>
                If any provision of this Trust is held unenforceable, the
                remaining provisions continue in effect.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function ScheduleA() {
  const plan = usePlan();
  const assets = plan.documents.revocableTrust.scheduleA.filter(Boolean);
  return (
    <div>
      <h2 class="article-header">Schedule A: Trust Property</h2>
      {"\n"}
      {assets.length === 0 ? (
        <p class="clause">
          <Blank value="" chars={40} />
        </p>
      ) : (
        <ol class="powers-list">
          {assets.map((asset, idx) => (
            <li key={idx}>
              <Value value={asset} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SpouseSignature() {
  return (
    <div class="sig-block-principal">
      <div class="sig-lines-principal">
        <div class="sig-line">
          <strong>
            <Blank path="party.spouse.name" chars={20} />
          </strong>
          , {ROLE}
        </div>
        {"\n"}
        <div class="sig-caption">
          Residing at <Blank path="party.testator.county" chars={12} /> County,{" "}
          <Blank path="party.testator.state" chars={14} />
        </div>
      </div>
    </div>
  );
}

function TrustorAcknowledgment({ signer }: { signer?: "spouse" }) {
  return (
    <NotarialAcknowledgment
      preamble="This is the acknowledgment of the Trustor's signature on this Trust."
      signer={signer}
      juratOpener="Given under my hand and official seal this"
    >
      {(p) => (
        <>
          signed this instrument and acknowledged it to be{" "}
          <Value value={p.possessive} /> free and voluntary act for the uses and
          purposes mentioned in the instrument.
        </>
      )}
    </NotarialAcknowledgment>
  );
}

function Execution() {
  const plan = usePlan();
  const joint = isJoint(plan);
  return (
    <>
      <Testimonium instrument={INSTRUMENT} />
      {"\n"}
      <SignatureBlock role={ROLE} />
      {"\n"}
      {joint && <SpouseSignature />}
      {"\n"}
      <TrustorAcknowledgment />
      {"\n"}
      {joint && <TrustorAcknowledgment signer="spouse" />}
    </>
  );
}

function BodyContent() {
  return (
    <>
      <TitleAndPreamble />
      {"\n"}
      <Article1 />
      <Article2 />
      <Article3 />
      <Article4 />
      <Article5 />
      <Article6 />
      <Article7 />
      <Article8 />
      <Article9 />
      <Article10 />
      <ScheduleA />
      {"\n"}
      <Execution />
    </>
  );
}

export function Body() {
  return (
    <ExecutionContext.Provider value="executions.revocableTrust">
      <BodyContent />
    </ExecutionContext.Provider>
  );
}
