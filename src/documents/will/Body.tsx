import { getPronouns } from "../../model/pronouns";
import { normalizeName } from "../../model/names";
import type { Plan } from "../../model/plan";
import { Article } from "../shared/Article";
import { Blank } from "../shared/Blank";
import { Clause } from "../shared/Clause";
import { NotaryCertificate } from "../shared/NotaryCertificate";
import { PowersList } from "../shared/PowersList";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { Value } from "../shared/Value";
import { WitnessAttestation } from "../shared/WitnessAttestation";
import { usePlan } from "../shared/PlanContext";

const COUNT_WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export function countWord(n: number): string {
  return COUNT_WORDS[n] || String(n);
}

export function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Tested against "unmarried" rather than for "married" so an absent or
// unrecognized value renders as married — today's only behavior.
export function isMarried(plan: Plan): boolean {
  return plan.party.maritalStatus !== "unmarried";
}

// "my spouse, NAME" is only true when NAME is in fact the spouse and the
// testator declares a spouse at all — an unmarried testator's spouse field
// may still hold a stale name, and that name must not resurrect the
// apposition.
export function isSpouse(plan: Plan, name: string | undefined): boolean {
  const n = normalizeName(name);
  return (
    isMarried(plan) && Boolean(n) && n === normalizeName(plan.party.spouse.name)
  );
}

function ChildrenSentence() {
  const plan = usePlan();
  const children = (plan.party.children || []).filter(Boolean);
  if (children.length === 0) {
    return <>I have no children as of the date of this Will.</>;
  }
  return (
    <>
      I have {countWord(children.length)}{" "}
      {children.length === 1 ? "child" : "children"},{" "}
      <Value value={formatList(children)} />.
    </>
  );
}

function FamilyBody() {
  const plan = usePlan();
  const married = isMarried(plan);
  const spousePronouns = getPronouns(plan.party.spouse.gender);

  if (married) {
    return (
      <>
        I declare that I am married to{" "}
        <Blank path="party.spouse.name" chars={16} />, and all references in
        this Will to “my spouse” are to{" "}
        <Value value={spousePronouns.objective} />. <ChildrenSentence /> All
        references in this Will to “my children” include these children and any
        children hereafter born to or adopted by me.
      </>
    );
  }
  return (
    <>
      I am not married. <ChildrenSentence /> All references in this Will to “my
      children” include these children and any children hereafter born to or
      adopted by me.
    </>
  );
}

function SurvivorPreface() {
  const plan = usePlan();
  if (!isMarried(plan)) return null;
  return (
    <>If my spouse does not survive me, or is unable or unwilling to act, </>
  );
}

function GuardianBody() {
  return (
    <>
      <SurvivorPreface />I appoint{" "}
      <Blank path="fiduciaries.guardians.primary" chars={16} /> as Guardian of
      the person of any minor child of mine, pursuant to chapter 11.130 RCW. If{" "}
      <Blank path="fiduciaries.guardians.primary" chars={16} /> is unable or
      unwilling to serve, I appoint{" "}
      <Blank path="fiduciaries.guardians.alternate" chars={16} /> as alternate
      Guardian.
    </>
  );
}

function ConservatorBody() {
  return (
    <>
      <SurvivorPreface />I appoint{" "}
      <Blank path="fiduciaries.conservators.primary" chars={16} /> as
      Conservator of the estate of any minor child of mine, pursuant to chapter
      11.130 RCW, to manage such child's property and financial affairs. If{" "}
      <Blank path="fiduciaries.conservators.primary" chars={16} /> is unable or
      unwilling to serve, I appoint{" "}
      <Blank path="fiduciaries.conservators.alternate" chars={16} /> as
      alternate Conservator.
    </>
  );
}

function TitleAndPreamble() {
  return (
    <>
      <h1 id="doc-title" class="doc-title">
        <span class="doc-title-line">Last Will and Testament</span>
        <span class="doc-title-line">of</span>
        <span class="doc-title-line">
          <Blank path="party.testator.name" chars={20} />
        </span>
      </h1>
      {"\n"}
      <p class="doc-preamble">
        I, <Blank path="party.testator.name" chars={16} />, a resident of{" "}
        <Blank path="party.testator.county" chars={12} /> County,{" "}
        <Blank path="party.testator.state" chars={14} />, declare this to be my
        Last Will and Testament, and I revoke all prior wills and codicils made
        by me.
      </p>
    </>
  );
}

function Article1() {
  return (
    <Article number={1} title="Family, Guardians, and Conservators">
      <Clause
        articleNum={1}
        clauses={[
          { title: "Family", body: <FamilyBody /> },
          { title: "Guardian of the Person", body: <GuardianBody /> },
          { title: "Conservator of the Estate", body: <ConservatorBody /> },
        ]}
      />
    </Article>
  );
}

function Article2() {
  const plan = usePlan();
  const preference = plan.fiduciaries.remains.preference;

  return (
    <Article number={2} title="Disposition of Remains">
      <Clause
        articleNum={2}
        clauses={[
          {
            title: "Disposition of Remains",
            body: (
              <>
                Pursuant to RCW 68.50.160, I appoint{" "}
                <Blank path="fiduciaries.remains.agent" chars={16} /> to control
                the disposition of my remains, including decisions concerning
                burial, cremation, and funeral arrangements. If{" "}
                <Blank path="fiduciaries.remains.agent" chars={16} /> is unable
                or unwilling to act, I appoint{" "}
                <Blank path="fiduciaries.remains.alternate" chars={16} /> as
                alternate.
              </>
            ),
          },
          preference
            ? {
                title: "Preference",
                body: (
                  <>
                    Without imposing any binding obligation on my agent, my
                    preference is: <Value value={preference} />.
                  </>
                ),
              }
            : null,
        ]}
      />
    </Article>
  );
}

function Article3() {
  const plan = usePlan();
  const married = isMarried(plan);
  const beneficiary = plan.documents.will.ultimateBeneficiary;
  const beneficiaryPronouns = getPronouns(beneficiary.gender);
  const disclaimerTrust = plan.documents.will.spousalGift === "disclaimerTrust";

  const spousalGiftClause = disclaimerTrust
    ? {
        title: "Primary Gift to Spouse; Disclaimer Trust",
        body: (
          <>
            I give, devise, and bequeath all of my estate, of every nature and
            wheresoever situated, to my spouse, if my spouse survives me. If my
            spouse disclaims any portion of this gift in accordance with RCW
            11.86.031 within nine months of my death, the disclaimed portion
            shall pass instead to the Trustee, to be held in trust for the
            benefit of my spouse and my then-surviving descendants, subject to
            the trust provisions of Article 4 of this Will.
          </>
        ),
      }
    : {
        title: "Primary Gift to Spouse",
        body: (
          <>
            I give, devise, and bequeath all of my estate, of every nature and
            wheresoever situated, to my spouse, if my spouse survives me.
          </>
        ),
      };

  const giftToDescendantsClause = {
    title: "Gift to Descendants",
    body: (
      <>
        I give, devise, and bequeath all of my estate, of every nature and
        wheresoever situated, to my then-surviving descendants, by right of
        representation pursuant to RCW 11.02.005(18), subject to the trust
        provisions of Article 4 of this Will for any beneficiary under the age
        of twenty-five (25) years.
      </>
    ),
  };

  return (
    <Article number={3} title="Disposition of Property">
      <Clause
        articleNum={3}
        clauses={[
          married
            ? {
                title: "Community Property Characterization",
                body: (
                  <>
                    To the extent any property comprising my estate constitutes
                    community property under the laws of the State of
                    Washington, I dispose by this Will of not more than my
                    one-half interest in such community property, pursuant to
                    RCW 26.16.030. My spouse's one-half interest in our
                    community property is not affected by this Will.
                  </>
                ),
              }
            : null,
          married && plan.documents.will.communityPropertyAgreement.exists
            ? {
                title: "Community Property Agreement",
                body: (
                  <>
                    I acknowledge that my spouse and I have entered into, or
                    intend to enter into, a Community Property Agreement dated{" "}
                    <Blank
                      path="documents.will.communityPropertyAgreement.date"
                      chars={10}
                    />
                    , pursuant to RCW 26.16.120. To the extent such an Agreement
                    is valid and effective at my death, it governs the
                    disposition of the community property described therein
                    notwithstanding any contrary provision of this Will; this
                    Will governs my estate only to the extent the Agreement does
                    not apply.
                  </>
                ),
              }
            : null,
          married ? spousalGiftClause : giftToDescendantsClause,
          {
            title: "Separate Writing",
            body: (
              <>
                Pursuant to RCW 11.12.260, I may dispose of tangible personal
                property by a separate written list or memorandum referenced in
                this Will.
              </>
            ),
          },
          married
            ? {
                title: "Residue and Contingent Gift to Descendants",
                body: (
                  <>
                    If my spouse does not survive me, I give the rest, residue,
                    and remainder of my estate to my then-surviving descendants,
                    by right of representation pursuant to RCW 11.02.005(18),
                    subject to the trust provisions of Article 4 of this Will
                    for any beneficiary under the age of twenty-five (25) years.
                  </>
                ),
              }
            : null,
          {
            title: "Ultimate Contingent Beneficiary",
            body: (
              <>
                {married
                  ? "If neither my spouse nor any of my descendants survive me"
                  : "If none of my descendants survive me"}
                , my estate shall be distributed to my{" "}
                <Blank
                  path="documents.will.ultimateBeneficiary.relationship"
                  chars={12}
                />
                ,{" "}
                <Blank
                  path="documents.will.ultimateBeneficiary.name"
                  chars={16}
                />
                , or if <Value value={beneficiaryPronouns.subjective} /> does
                not survive me, to my heirs at law determined under the laws of
                the State of Washington.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article4() {
  return (
    <Article number={4} title="Trust Beneficiaries and Distributions">
      <Clause
        articleNum={4}
        clauses={[
          {
            title: "Minor Support Standard",
            body: (
              <>
                Any share allocated to a beneficiary under age twenty-five (25)
                shall be held in trust by the Trustee. The Trustee may
                distribute so much of the income and principal as necessary or
                advisable for the beneficiary's health, education, support, and
                maintenance.
              </>
            ),
          },
          {
            title: "Final Distribution",
            body: (
              <>
                When a beneficiary attains the age of twenty-five (25) years,
                the Trustee shall distribute to such beneficiary the remaining
                balance of their trust share outright and free of trust.
              </>
            ),
          },
          {
            title: "Small Trust Termination",
            body: (
              <>
                If the principal of any trust share falls below Fifteen Thousand
                Dollars ($15,000), the Trustee may terminate the trust and
                distribute the remainder outright to the beneficiary.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article5() {
  return (
    <Article number={5} title="Spendthrift Provision">
      <p class="clause">
        Pursuant to RCW 6.32.250, no interest of any beneficiary under any trust
        created hereunder shall be subject to anticipation, assignment, pledge,
        attachment, execution, or the claims of creditors of any beneficiary
        prior to actual distribution by the Trustee. This provision does not
        apply to any outright, non-trust gift or devise under this Will.
      </p>
    </Article>
  );
}

function Article6() {
  return (
    <Article number={6} title="Powers and Duties of Trustee">
      <p class="clause">
        In addition to all powers granted by law under chapter 11.98 RCW, the
        Trustee shall have full power and authority to manage and administer any
        trust estate hereunder, including the following specific powers:
      </p>
      {"\n"}
      <PowersList
        articleNum={6}
        items={[
          {
            title: "General Powers",
            body: "To exercise all powers granted to trustees under RCW 11.98.070.",
          },
          {
            title: "Investment and Retention",
            body: "To invest, reinvest, and retain any property, including closely held business interests, without regard to diversification.",
          },
          {
            title: "Distribution Methods",
            body: "To make distributions directly to a beneficiary or apply funds directly for the beneficiary's benefit.",
          },
          {
            title: "Non-Pro-Rata Distributions in Kind",
            body: "To make distributions in cash or in kind, or partly in each, and allocate specific assets without regard to tax basis.",
          },
          {
            title: "Professional Advice",
            body: "To employ attorneys, accountants, investment advisors, and agents.",
          },
          {
            title: "Settlement and Compromise",
            body: "To compromise, contest, or settle claims.",
          },
          {
            title: "Digital Assets",
            body: "To exercise authority over digital assets and accounts under chapter 11.120 RCW.",
          },
          {
            title: "Merger and Consolidation",
            body: "To combine or pool trust shares for investment efficiency.",
          },
          {
            title: "Insurance",
            body: "To purchase, maintain, or surrender insurance policies.",
          },
          {
            title: "Reliance in Good Faith",
            body: "To act in good faith reliance on written advice or records without personal liability.",
          },
        ]}
      />
    </Article>
  );
}

function Article7() {
  const plan = usePlan();
  const prPrimary = plan.fiduciaries.personalRepresentatives.primary;
  const prIsSpouse = isSpouse(plan, prPrimary);

  return (
    <Article number={7} title="Administration and Fiduciaries">
      <Clause
        articleNum={7}
        clauses={[
          {
            title: "Trustee Appointment",
            body: (
              <>
                I appoint{" "}
                <Blank path="fiduciaries.trustees.primary" chars={16} /> as
                Trustee of any trust created under this Will. If{" "}
                <Blank path="fiduciaries.trustees.primary" chars={16} /> is
                unable or unwilling to serve, I appoint{" "}
                <Blank path="fiduciaries.trustees.alternate" chars={16} /> as
                alternate Trustee.
              </>
            ),
          },
          {
            title: "Personal Representative Appointment",
            body: (
              <>
                {prIsSpouse ? (
                  <>
                    I appoint my spouse,{" "}
                    <Blank
                      path="fiduciaries.personalRepresentatives.primary"
                      chars={16}
                    />
                    , as Personal Representative of my estate.
                  </>
                ) : (
                  <>
                    I appoint{" "}
                    <Blank
                      path="fiduciaries.personalRepresentatives.primary"
                      chars={16}
                    />{" "}
                    as Personal Representative of my estate.
                  </>
                )}{" "}
                If{" "}
                <Blank
                  path="fiduciaries.personalRepresentatives.primary"
                  chars={16}
                />{" "}
                is unable or unwilling to serve, I appoint{" "}
                <Blank
                  path="fiduciaries.personalRepresentatives.alternate"
                  chars={16}
                />{" "}
                as alternate Personal Representative. No fiduciary nominated
                herein shall be required to post bond or other security in any
                jurisdiction.
              </>
            ),
          },
          {
            title: "Debts, Expenses, and Taxes",
            body: (
              <>
                I direct that all my just debts, expenses of my last illness,
                and funeral expenses, together with all estate, inheritance,
                transfer, and succession taxes assessed against my probate or
                non-probate estate, be paid out of the residue of my estate
                without apportionment.
              </>
            ),
          },
          {
            title: "Digital Assets Disclosure Consent",
            body: (
              <>
                Pursuant to RCW 11.120.070, I consent to the disclosure of the
                content of my electronic communications to my Personal
                Representative and to my Trustee, to the fullest extent
                permitted by law, in addition to the powers over digital assets
                granted to the Trustee under Article 6.
              </>
            ),
          },
          {
            title: "Nonintervention Powers",
            body: (
              <>
                I request that my Personal Representative petition for, and that
                the court grant, nonintervention powers pursuant to RCW
                11.68.011 upon a determination that my estate is solvent, so
                that my estate may be administered with the least court
                involvement consistent with law.
              </>
            ),
          },
          {
            title: "Survivorship and Representation",
            body: (
              <>
                For purposes of this Will, a beneficiary must survive me by{" "}
                <Value path="documents.will.survivorshipDays" /> full days. If
                any beneficiary fails to survive me by that period, such
                beneficiary shall be deemed to have predeceased me for all
                purposes under this Will. Any gift to a deceased beneficiary's
                descendants shall pass by right of representation pursuant to
                RCW 11.02.005(18).
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function Article8() {
  return (
    <Article number={8} title="No Contest Provision">
      <p class="clause">
        If any beneficiary under this Will, directly or indirectly, contests
        this Will or any of its provisions, any share or interest in my estate
        given to that contesting beneficiary is revoked and shall be disposed of
        in the same manner provided herein as if that contesting beneficiary had
        predeceased me without issue.
      </p>
    </Article>
  );
}

function Article9() {
  return (
    <Article number={9} title="Ancillary Administration">
      <p class="clause">
        If ancillary administration is required in any other state or
        jurisdiction, I appoint my nominated Personal Representative to serve as
        ancillary administrator without bond.
      </p>
    </Article>
  );
}

function Article10() {
  return (
    <Article number={10} title="Severability and Governing Law">
      <Clause
        articleNum={10}
        clauses={[
          {
            title: "Severability",
            body: (
              <>
                If any provision of this Will is held invalid or unenforceable,
                such invalidity shall not affect the remaining provisions, which
                shall continue in full force and effect.
              </>
            ),
          },
          {
            title: "Governing Law",
            body: (
              <>
                This Will and any trust created hereunder shall be construed and
                governed in accordance with the laws of the State of Washington.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

// Ports `js/templates/will.js`'s `renderWill`, article by article, in its
// original order: preamble, Articles 1-10, testimonium + principal
// signature, witness attestation, notary certificate.
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
      <Article4 />
      {"\n"}
      <Article5 />
      {"\n"}
      <Article6 />
      {"\n"}
      <Article7 />
      {"\n"}
      <Article8 />
      {"\n"}
      <Article9 />
      {"\n"}
      <Article10 />
      {"\n"}
      <Testimonium instrument="Last Will and Testament" />
      {"\n"}
      <SignatureBlock role="Testator" />
      {"\n"}
      <WitnessAttestation />
      {"\n"}
      <NotaryCertificate />
    </>
  );
}
