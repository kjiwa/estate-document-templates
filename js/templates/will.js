import { getPronouns, wrapVar } from "../utils.js";

function renderTitleAndPreamble(data, v) {
  const testatorName = data.testator?.name || "";
  const county = data.testator?.county || "King";
  const state = data.testator?.state || "Washington";

  return `
    <h1 class="doc-title">Last Will and Testament<br>of<br>${v(testatorName)}</h1>
    <p class="doc-preamble">
      I, ${v(testatorName)}, a resident of ${v(county)} County, ${v(state)}, declare this to be my Last Will and Testament, and I revoke all prior wills and codicils made by me.
    </p>
  `;
}

function renderArticle1(data, v) {
  const spouseName = data.spouse?.name || "";
  const spousePronouns = getPronouns(data.spouse?.gender);
  const children = data.children || "";
  const primaryGuardian = data.guardians?.primary || "";
  const altGuardian = data.guardians?.alternate || "";

  return `
    <h2 class="article-header">Article 1: Family and Guardians</h2>
    <p class="clause">
      <strong>1.1 Family.</strong> I declare that I am married to ${v(spouseName)}, and all references in this Will to &ldquo;my spouse&rdquo; are to ${v(spousePronouns.objective)}. I have two children, ${v(children)}. All references in this Will to &ldquo;my children&rdquo; include these children and any children hereafter born to or adopted by me.
    </p>
    <p class="clause">
      <strong>1.2 Guardian of Minor Children.</strong> If my spouse does not survive me, or is unable or unwilling to act, I appoint ${v(primaryGuardian)} as Guardian of the person and estate of any minor child of mine. If ${v(primaryGuardian)} is unable or unwilling to serve, I appoint ${v(altGuardian)} as alternate Guardian.
    </p>
  `;
}

function renderArticle2(data, v) {
  const tertiary = data.tertiaryBeneficiary || "my sister";

  return `
    <h2 class="article-header">Article 2: Disposition of Property</h2>
    <p class="clause">
      <strong>2.1 Primary Gift to Spouse.</strong> I give, devise, and bequeath all of my estate, of every nature and wheresoever situated, to my spouse, if my spouse survives me.
    </p>
    <p class="clause">
      <strong>2.2 Separate Writing.</strong> Pursuant to RCW 11.12.260, I may dispose of tangible personal property by a separate written list or memorandum referenced in this Will.
    </p>
    <p class="clause">
      <strong>2.3 Residue and Contingent Gift to Descendants.</strong> If my spouse does not survive me, I give the rest, residue, and remainder of my estate to my then-surviving descendants, per stirpes, subject to the trust provisions of Article 3 for any beneficiary under the age of twenty-five (25) years.
    </p>
    <p class="clause">
      <strong>2.4 Ultimate Contingent Beneficiary.</strong> If neither my spouse nor any of my descendants survive me, my estate shall be distributed to ${v(tertiary)}, or if she does not survive me, to my heirs at law determined under the laws of the State of Washington.
    </p>
  `;
}

function renderArticle3() {
  return `
    <h2 class="article-header">Article 3: Trust Beneficiaries and Distributions</h2>
    <p class="clause">
      <strong>3.1 Minor Support Standard.</strong> Any share allocated to a beneficiary under age twenty-five (25) shall be held in trust by the Trustee. The Trustee may distribute so much of the income and principal as necessary or advisable for the beneficiary's health, education, support, and maintenance.
    </p>
    <p class="clause">
      <strong>3.2 Final Distribution.</strong> When a beneficiary attains the age of twenty-five (25) years, the Trustee shall distribute to such beneficiary the remaining balance of their trust share outright and free of trust.
    </p>
    <p class="clause">
      <strong>3.3 Small Trust Termination.</strong> If the principal of any trust share falls below Fifteen Thousand Dollars ($15,000), the Trustee may terminate the trust and distribute the remainder outright to the beneficiary.
    </p>
    <p class="clause">
      <strong>3.4 Rule Against Perpetuities.</strong> All trusts created hereunder shall terminate no later than twenty-one (21) years after the death of the last surviving beneficiary living at the time of my death.
    </p>
  `;
}

function renderArticle4() {
  return `
    <h2 class="article-header">Article 4: Claims by Strangers</h2>
    <p class="clause">
      Pursuant to RCW 6.32.250, no interest of any beneficiary under this Will or any trust created hereunder shall be subject to anticipation, assignment, pledge, attachment, execution, or the claims of creditors of any beneficiary prior to actual distribution by the Personal Representative or Trustee.
    </p>
  `;
}

function renderArticle5() {
  return `
    <h2 class="article-header">Article 5: Powers and Duties of Trustee</h2>
    <p class="clause">
      In addition to all powers granted by law under the Washington Trust Act (RCW 11.98), the Trustee shall have full power and authority to manage and administer any trust estate hereunder, including the following specific powers:
    </p>
    <ol class="powers-list">
      <li><strong>5.1 General Powers.</strong> To exercise all powers granted to trustees under RCW 11.98.070.</li>
      <li><strong>5.2 Investment and Retention.</strong> To invest, reinvest, and retain any property, including closely held business interests, without regard to diversification.</li>
      <li><strong>5.3 Distribution Methods.</strong> To make distributions directly to a beneficiary or apply funds directly for the beneficiary's benefit.</li>
      <li><strong>5.4 Non-Pro-Rata Distributions in Kind.</strong> To make distributions in cash or in kind, or partly in each, and allocate specific assets without regard to tax basis.</li>
      <li><strong>5.5 Professional Advice.</strong> To employ attorneys, accountants, investment advisors, and agents.</li>
      <li><strong>5.6 Settlement and Compromise.</strong> To compromise, contest, or settle claims.</li>
      <li><strong>5.7 Digital Assets.</strong> To exercise authority over digital assets and accounts under RCW 11.120.</li>
      <li><strong>5.8 Merger and Consolidation.</strong> To combine or pool trust shares for investment efficiency.</li>
      <li><strong>5.9 Insurance.</strong> To purchase, maintain, or surrender insurance policies.</li>
      <li><strong>5.10 Reliance in Good Faith.</strong> To act in good faith reliance on written advice or records without personal liability.</li>
      <li><strong>5.11 Governing Law.</strong> This trust shall be construed and governed in accordance with the laws of the State of Washington.</li>
    </ol>
  `;
}

function renderArticle6(data, v) {
  const primaryTrustee = data.trustees?.primary || "";
  const altTrustee = data.trustees?.alternate || "";
  const primaryPR = data.personalRepresentatives?.primary || "";
  const altPR = data.personalRepresentatives?.alternate || "";

  return `
    <h2 class="article-header">Article 6: Administration and Fiduciaries</h2>
    <p class="clause">
      <strong>6.1 Trustee Appointment.</strong> I appoint ${v(primaryTrustee)} as Trustee of any trust created under this Will. If ${v(primaryTrustee)} is unable or unwilling to serve, I appoint ${v(altTrustee)} as alternate Trustee.
    </p>
    <p class="clause">
      <strong>6.2 Personal Representative Appointment.</strong> I appoint my spouse, ${v(primaryPR)}, as Personal Representative of my estate. If my spouse is unable or unwilling to serve, I appoint ${v(altPR)} as alternate Personal Representative. No fiduciary nominated herein shall be required to post bond or other security in any jurisdiction.
    </p>
    <p class="clause">
      <strong>6.3 Nonintervention Powers.</strong> I direct that my estate be administered with nonintervention powers under RCW 11.68, without the necessity of court supervision, decree, or order, except as required by law.
    </p>
    <p class="clause">
      <strong>6.4 Taxes and Expenses.</strong> All estate, inheritance, transfer, and succession taxes assessed against my probate or non-probate estate shall be paid out of the residue of my estate without apportionment.
    </p>
    <p class="clause">
      <strong>6.5 Survivorship and Representation.</strong> For purposes of this Will, a beneficiary must survive me by sixty (60) full days. Any gift to a deceased beneficiary's descendants shall pass by right of representation pursuant to RCW 11.02.005(18).
    </p>
  `;
}

function renderArticles7To10() {
  return `
    <h2 class="article-header">Article 7: No Contest Provision</h2>
    <p class="clause">
      If any beneficiary under this Will, directly or indirectly, contests this Will or any of its provisions, any share or interest in my estate given to that contesting beneficiary is revoked and shall be disposed of in the same manner provided herein as if that contesting beneficiary had predeceased me without issue. King County Superior Court shall have full TEDRA (RCW 11.96A) jurisdiction.
    </p>

    <h2 class="article-header">Article 8: Ancillary Administration</h2>
    <p class="clause">
      If ancillary administration is required in any other state or jurisdiction, I appoint my nominated Personal Representative to serve as ancillary administrator without bond.
    </p>

    <h2 class="article-header">Article 9: Presumption of Survivorship</h2>
    <p class="clause">
      Pursuant to RCW 11.05A, if any person named herein as a beneficiary fails to survive me by sixty (60) days, such beneficiary shall be deemed to have predeceased me for all purposes under this Will.
    </p>

    <h2 class="article-header">Article 10: Severability</h2>
    <p class="clause">
      If any provision of this Will is held invalid or unenforceable, such invalidity shall not affect the remaining provisions, which shall continue in full force and effect.
    </p>
  `;
}

function renderTestimoniumAndSignatures(data, v) {
  const testatorName = data.testator?.name || "";
  const county = data.testator?.county || "King";
  const state = data.testator?.state || "Washington";
  const city = data.city || "Seattle";
  const date = data.executionDate || {};

  const dayStr = date.day ? v(date.day) : "_____";
  const monthStr = date.month ? v(date.month) : "__________________";
  const yearStr = date.year ? v(date.year) : "20____";

  return `
    <div class="testimonium">
      <strong>IN WITNESS WHEREOF</strong>, I have signed this Last Will and Testament, consisting of this and the preceding pages, in the City of ${v(city)}, ${v(county)} County, ${v(state)}, on this ${dayStr} day of ${monthStr}, ${yearStr}.
    </div>

    <div class="sig-block-principal">
      <div class="sig-lines-principal">
        <div class="sig-line">
          <strong>${v(testatorName)}</strong>, Testator
        </div>
        <div class="sig-caption">Residing at ${v(county)} County, ${v(state)}</div>
      </div>
    </div>
  `;
}

function renderWitnessAttestation(data, v) {
  const testatorName = data.testator?.name || "";
  const testatorPronouns = getPronouns(data.testator?.gender);

  return `
    <div class="witness-block">
      <h2 class="doc-subtitle">Attestation of Witnesses</h2>
      <p class="witness-declaration">
        The foregoing instrument was on the date thereof signed, published, and declared by the Testator, ${v(testatorName)}, to be ${v(testatorPronouns.possessive)} Last Will and Testament, in the presence of us, who, at ${v(testatorPronouns.possessive)} request, in ${v(testatorPronouns.possessive)} presence, and in the presence of each other, have subscribed our names as attesting witnesses thereto, believing the Testator to be of sound mind and memory and under no constraint or undue influence.
      </p>
      <div class="sig-grid">
        <div class="sig-column">
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Witness Signature</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Printed Name</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Residence Address</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">City, State, Zip</div>
          </div>
        </div>
        <div class="sig-column">
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Witness Signature</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Printed Name</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Residence Address</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">City, State, Zip</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNotaryCertificate(data, v) {
  const testatorName = data.testator?.name || "";
  const testatorPronouns = getPronouns(data.testator?.gender);
  const county = data.testator?.county || "King";
  const state = data.testator?.state || "Washington";

  return `
    <div class="notary-block">
      <div class="notary-heading">Self-Proving Affidavit &amp; Notarial Certificate</div>
      <div class="notary-venue">
        STATE OF ${v(state.toUpperCase())} )<br>
        COUNTY OF ${v(county.toUpperCase())} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) ss.
      </div>
      <p class="notary-body">
        Each of the undersigned, being first duly sworn on oath, deposes and states under penalty of perjury under the laws of the State of ${v(state)} that: on the date last above written, the Testator, ${v(testatorName)}, in our presence declared this instrument to be ${v(testatorPronouns.possessive)} Last Will and Testament and requested us to act as witnesses; the Testator signed this Will in our presence; and we subscribed our names as witnesses in the Testator's presence and in each other's presence.
      </p>
      <div class="notary-sig-row">
        <div class="sig-column">
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Signature of Notary Public</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Title / Commission Expiration</div>
          </div>
        </div>
        <div class="notary-seal-box">
          Notary Seal Box
        </div>
      </div>
    </div>
  `;
}

export function renderWill(data = {}, options = {}) {
  const highlight = options.highlightVariables !== false;
  const v = (val) => wrapVar(val, highlight);

  return [
    renderTitleAndPreamble(data, v),
    renderArticle1(data, v),
    renderArticle2(data, v),
    renderArticle3(),
    renderArticle4(),
    renderArticle5(),
    renderArticle6(data, v),
    renderArticles7To10(),
    renderTestimoniumAndSignatures(data, v),
    renderWitnessAttestation(data, v),
    renderNotaryCertificate(data, v),
  ]
    .map((chunk) => chunk.trim())
    .join("\n\n");
}
