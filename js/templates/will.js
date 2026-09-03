import { getPronouns, wrapVar, fillIn, normalizeName } from "../utils.js";

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

function countWord(n) {
  return COUNT_WORDS[n] || String(n);
}

function formatList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// "my spouse, NAME" is only true when NAME is in fact the spouse. The field
// takes any name, so the apposition is derived, never assumed.
function isSpouse(data, name) {
  const n = normalizeName(name);
  return Boolean(n) && n === normalizeName(data.spouse?.name);
}

// Builds a "<articleNum>.<n> Title." numbered clause list from an array that
// may contain falsy entries (conditional clauses), so optional clauses like
// the CPA acknowledgment or the disclaimer trust branch never leave a gap in
// the numbering — the numbers are always sequential for what actually renders.
function renderClauses(articleNum, clauses) {
  return clauses
    .filter(Boolean)
    .map(
      (clause, idx) =>
        `<p class="clause"><strong>${articleNum}.${idx + 1} ${clause.title}.</strong> ${clause.body}</p>`
    )
    .join("\n");
}

function renderPowersList(articleNum, items) {
  const lis = items
    .filter(Boolean)
    .map(
      (item, idx) =>
        `<li><strong>${articleNum}.${idx + 1} ${item.title}.</strong> ${item.body}</li>`
    )
    .join("\n");
  return `<ol class="powers-list">\n${lis}\n</ol>`;
}

function renderTitleAndPreamble(data, v, fill) {
  const testatorName = data.testator?.name || "";
  const county = data.testator?.county || "";
  const state = data.testator?.state || "";

  return `
    <h1 id="doc-title" class="doc-title"><span class="doc-title-line">Last Will and Testament</span><span class="doc-title-line">of</span><span class="doc-title-line">${fill(testatorName, 20)}</span></h1>
    <p class="doc-preamble">
      I, ${fill(testatorName, 16)}, a resident of ${fill(county, 12)} County, ${fill(state, 14)}, declare this to be my Last Will and Testament, and I revoke all prior wills and codicils made by me.
    </p>
  `;
}

function renderArticle1(data, v, fill) {
  const spousePronouns = getPronouns(data.spouse?.gender);
  const children = (data.children || []).filter(Boolean);
  const childrenSentence = children.length
    ? `I have ${countWord(children.length)} ${children.length === 1 ? "child" : "children"}, ${v(formatList(children))}.`
    : "I have no children as of the date of this Will.";

  return `
    <h2 class="article-header">Article 1: Family, Guardians, and Conservators</h2>
    ${renderClauses(1, [
      {
        title: "Family",
        body: `I declare that I am married to ${fill(data.spouse?.name, 16)}, and all references in this Will to &ldquo;my spouse&rdquo; are to ${v(spousePronouns.objective)}. ${childrenSentence} All references in this Will to &ldquo;my children&rdquo; include these children and any children hereafter born to or adopted by me.`,
      },
      {
        title: "Guardian of the Person",
        body: `If my spouse does not survive me, or is unable or unwilling to act, I appoint ${fill(data.guardians?.primary, 16)} as Guardian of the person of any minor child of mine, pursuant to chapter 11.130 RCW. If ${fill(data.guardians?.primary, 16)} is unable or unwilling to serve, I appoint ${fill(data.guardians?.alternate, 16)} as alternate Guardian.`,
      },
      {
        title: "Conservator of the Estate",
        body: `If my spouse does not survive me, or is unable or unwilling to act, I appoint ${fill(data.conservators?.primary, 16)} as Conservator of the estate of any minor child of mine, pursuant to chapter 11.130 RCW, to manage such child's property and financial affairs. If ${fill(data.conservators?.primary, 16)} is unable or unwilling to serve, I appoint ${fill(data.conservators?.alternate, 16)} as alternate Conservator.`,
      },
    ])}
  `;
}

function renderArticle2(data, v, fill) {
  const remains = data.remains || {};

  return `
    <h2 class="article-header">Article 2: Disposition of Remains</h2>
    ${renderClauses(2, [
      {
        title: "Disposition of Remains",
        body: `Pursuant to RCW 68.50.160, I appoint ${fill(remains.agent, 16)} to control the disposition of my remains, including decisions concerning burial, cremation, and funeral arrangements. If ${fill(remains.agent, 16)} is unable or unwilling to act, I appoint ${fill(remains.alternate, 16)} as alternate.`,
      },
      remains.preference
        ? {
            title: "Preference",
            body: `Without imposing any binding obligation on my agent, my preference is: ${v(remains.preference)}.`,
          }
        : null,
    ])}
  `;
}

function renderArticle3(data, v, fill) {
  const beneficiary = data.ultimateBeneficiary || {};
  const beneficiaryPronouns = getPronouns(beneficiary.gender);

  const spousalGiftClause =
    data.spousalGift === "disclaimerTrust"
      ? {
          title: "Primary Gift to Spouse; Disclaimer Trust",
          body: `I give, devise, and bequeath all of my estate, of every nature and wheresoever situated, to my spouse, if my spouse survives me. If my spouse disclaims any portion of this gift in accordance with RCW 11.86.031 within nine months of my death, the disclaimed portion shall pass instead to the Trustee, to be held in trust for the benefit of my spouse and my then-surviving descendants, subject to the trust provisions of Article 4 of this Will.`,
        }
      : {
          title: "Primary Gift to Spouse",
          body: `I give, devise, and bequeath all of my estate, of every nature and wheresoever situated, to my spouse, if my spouse survives me.`,
        };

  return `
    <h2 class="article-header">Article 3: Disposition of Property</h2>
    ${renderClauses(3, [
      {
        title: "Community Property Characterization",
        body: `To the extent any property comprising my estate constitutes community property under the laws of the State of Washington, I dispose by this Will of not more than my one-half interest in such community property, pursuant to RCW 26.16.030. My spouse's one-half interest in our community property is not affected by this Will.`,
      },
      data.communityPropertyAgreement?.exists
        ? {
            title: "Community Property Agreement",
            body: `I acknowledge that my spouse and I have entered into, or intend to enter into, a Community Property Agreement dated ${fill(data.communityPropertyAgreement?.date, 10)}, pursuant to RCW 26.16.120. To the extent such an Agreement is valid and effective at my death, it governs the disposition of the community property described therein notwithstanding any contrary provision of this Will; this Will governs my estate only to the extent the Agreement does not apply.`,
          }
        : null,
      spousalGiftClause,
      {
        title: "Separate Writing",
        body: `Pursuant to RCW 11.12.260, I may dispose of tangible personal property by a separate written list or memorandum referenced in this Will.`,
      },
      {
        title: "Residue and Contingent Gift to Descendants",
        body: `If my spouse does not survive me, I give the rest, residue, and remainder of my estate to my then-surviving descendants, by right of representation pursuant to RCW 11.02.005(18), subject to the trust provisions of Article 4 of this Will for any beneficiary under the age of twenty-five (25) years.`,
      },
      {
        title: "Ultimate Contingent Beneficiary",
        body: `If neither my spouse nor any of my descendants survive me, my estate shall be distributed to my ${fill(beneficiary.relationship, 12)}, ${fill(beneficiary.name, 16)}, or if ${v(beneficiaryPronouns.subjective)} does not survive me, to my heirs at law determined under the laws of the State of Washington.`,
      },
    ])}
  `;
}

function renderArticle4() {
  return `
    <h2 class="article-header">Article 4: Trust Beneficiaries and Distributions</h2>
    ${renderClauses(4, [
      {
        title: "Minor Support Standard",
        body: `Any share allocated to a beneficiary under age twenty-five (25) shall be held in trust by the Trustee. The Trustee may distribute so much of the income and principal as necessary or advisable for the beneficiary's health, education, support, and maintenance.`,
      },
      {
        title: "Final Distribution",
        body: `When a beneficiary attains the age of twenty-five (25) years, the Trustee shall distribute to such beneficiary the remaining balance of their trust share outright and free of trust.`,
      },
      {
        title: "Small Trust Termination",
        body: `If the principal of any trust share falls below Fifteen Thousand Dollars ($15,000), the Trustee may terminate the trust and distribute the remainder outright to the beneficiary.`,
      },
    ])}
  `;
}

function renderArticle5() {
  return `
    <h2 class="article-header">Article 5: Spendthrift Provision</h2>
    <p class="clause">
      Pursuant to RCW 6.32.250, no interest of any beneficiary under any trust created hereunder shall be subject to anticipation, assignment, pledge, attachment, execution, or the claims of creditors of any beneficiary prior to actual distribution by the Trustee. This provision does not apply to any outright, non-trust gift or devise under this Will.
    </p>
  `;
}

function renderArticle6() {
  return `
    <h2 class="article-header">Article 6: Powers and Duties of Trustee</h2>
    <p class="clause">
      In addition to all powers granted by law under chapter 11.98 RCW, the Trustee shall have full power and authority to manage and administer any trust estate hereunder, including the following specific powers:
    </p>
    ${renderPowersList(6, [
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
    ])}
  `;
}

function renderArticle7(data, v, fill) {
  const prPrimary = data.personalRepresentatives?.primary;
  const prAppointment = isSpouse(data, prPrimary)
    ? `I appoint my spouse, ${fill(prPrimary, 16)}, as Personal Representative of my estate.`
    : `I appoint ${fill(prPrimary, 16)} as Personal Representative of my estate.`;

  return `
    <h2 class="article-header">Article 7: Administration and Fiduciaries</h2>
    ${renderClauses(7, [
      {
        title: "Trustee Appointment",
        body: `I appoint ${fill(data.trustees?.primary, 16)} as Trustee of any trust created under this Will. If ${fill(data.trustees?.primary, 16)} is unable or unwilling to serve, I appoint ${fill(data.trustees?.alternate, 16)} as alternate Trustee.`,
      },
      {
        title: "Personal Representative Appointment",
        body: `${prAppointment} If ${fill(prPrimary, 16)} is unable or unwilling to serve, I appoint ${fill(data.personalRepresentatives?.alternate, 16)} as alternate Personal Representative. No fiduciary nominated herein shall be required to post bond or other security in any jurisdiction.`,
      },
      {
        title: "Debts, Expenses, and Taxes",
        body: `I direct that all my just debts, expenses of my last illness, and funeral expenses, together with all estate, inheritance, transfer, and succession taxes assessed against my probate or non-probate estate, be paid out of the residue of my estate without apportionment.`,
      },
      {
        title: "Digital Assets Disclosure Consent",
        body: `Pursuant to RCW 11.120.070, I consent to the disclosure of the content of my electronic communications to my Personal Representative and to my Trustee, to the fullest extent permitted by law, in addition to the powers over digital assets granted to the Trustee under Article 6.`,
      },
      {
        title: "Nonintervention Powers",
        body: `I request that my Personal Representative petition for, and that the court grant, nonintervention powers pursuant to RCW 11.68.011 upon a determination that my estate is solvent, so that my estate may be administered with the least court involvement consistent with law.`,
      },
      {
        title: "Survivorship and Representation",
        body: `For purposes of this Will, a beneficiary must survive me by ${v(data.survivorshipDays)} full days. If any beneficiary fails to survive me by that period, such beneficiary shall be deemed to have predeceased me for all purposes under this Will. Any gift to a deceased beneficiary's descendants shall pass by right of representation pursuant to RCW 11.02.005(18).`,
      },
    ])}
  `;
}

function renderArticle8() {
  return `
    <h2 class="article-header">Article 8: No Contest Provision</h2>
    <p class="clause">
      If any beneficiary under this Will, directly or indirectly, contests this Will or any of its provisions, any share or interest in my estate given to that contesting beneficiary is revoked and shall be disposed of in the same manner provided herein as if that contesting beneficiary had predeceased me without issue.
    </p>
  `;
}

function renderArticle9() {
  return `
    <h2 class="article-header">Article 9: Ancillary Administration</h2>
    <p class="clause">
      If ancillary administration is required in any other state or jurisdiction, I appoint my nominated Personal Representative to serve as ancillary administrator without bond.
    </p>
  `;
}

function renderArticle10() {
  return `
    <h2 class="article-header">Article 10: Severability and Governing Law</h2>
    ${renderClauses(10, [
      {
        title: "Severability",
        body: `If any provision of this Will is held invalid or unenforceable, such invalidity shall not affect the remaining provisions, which shall continue in full force and effect.`,
      },
      {
        title: "Governing Law",
        body: `This Will and any trust created hereunder shall be construed and governed in accordance with the laws of the State of Washington.`,
      },
    ])}
  `;
}

function renderTestimoniumAndSignatures(data, v, fill) {
  const testatorName = data.testator?.name || "";
  const county = data.testator?.county || "";
  const state = data.testator?.state || "";
  const city = data.city || "";
  const date = data.executionDate || {};

  return `
    <div class="testimonium">
      <strong>IN WITNESS WHEREOF</strong>, I have signed this Last Will and Testament, consisting of this and the preceding pages, in the City of ${fill(city, 12)}, ${fill(county, 12)} County, ${fill(state, 14)}, on this ${fill(date.day, 5)} day of ${fill(date.month, 14)}, ${fill(date.year, 6)}.
    </div>

    <div class="sig-block-principal">
      <div class="sig-lines-principal">
        <div class="sig-line">
          <strong>${fill(testatorName, 20)}</strong>, Testator
        </div>
        <div class="sig-caption">Residing at ${fill(county, 12)} County, ${fill(state, 14)}</div>
      </div>
    </div>
  `;
}

function renderWitnessSigColumn(fill, witness) {
  return `
    <div class="sig-column">
      <div class="sig-field">
        <div class="sig-field-line"></div>
        <div class="sig-field-label">Witness Signature</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">${fill(witness?.name, 20)}</div>
        <div class="sig-field-label">Printed Name</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">${fill(witness?.address, 20)}</div>
        <div class="sig-field-label">Residence Address</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line">${fill(witness?.cityStateZip, 20)}</div>
        <div class="sig-field-label">City, State, Zip</div>
      </div>
    </div>
  `;
}

function renderWitnessAttestation(data, v, fill) {
  const testatorName = data.testator?.name || "";
  const testatorPronouns = getPronouns(data.testator?.gender);
  const witnesses = data.witnesses || [];

  return `
    <div class="witness-block">
      <h2 class="doc-subtitle">Attestation of Witnesses</h2>
      <p class="witness-declaration">
        The foregoing instrument was on the date thereof signed, published, and declared by the Testator, ${fill(testatorName, 16)}, to be ${v(testatorPronouns.possessive)} Last Will and Testament, in the presence of us, who, at ${v(testatorPronouns.possessive)} request and in ${v(testatorPronouns.possessive)} presence, have subscribed our names as attesting witnesses thereto, believing the Testator to be of sound mind and memory and under no constraint or undue influence.
      </p>
      <div class="sig-grid">
        ${renderWitnessSigColumn(fill, witnesses[0])}
        ${renderWitnessSigColumn(fill, witnesses[1])}
      </div>
    </div>
  `;
}

function renderNotaryCertificate(data, v, fill) {
  const testatorName = data.testator?.name || "";
  const testatorPronouns = getPronouns(data.testator?.gender);
  const county = data.testator?.county || "";
  const state = data.testator?.state || "";
  const date = data.executionDate || {};
  const witnesses = data.witnesses || [];
  const notary = data.notary || {};

  return `
    <div class="notary-block">
      <div class="notary-heading">Self-Proving Affidavit &amp; Notarial Certificate</div>
      <div class="notary-venue">
        STATE OF ${fill(state ? state.toUpperCase() : "", 14)} )<br>
        COUNTY OF ${fill(county ? county.toUpperCase() : "", 12)} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) ss.
      </div>
      <p class="notary-body">
        Each of the undersigned, being first duly sworn on oath, deposes and states under penalty of perjury under the laws of the State of ${fill(state, 14)} that: on the date last above written, the Testator, ${fill(testatorName, 16)}, in our presence declared this instrument to be ${v(testatorPronouns.possessive)} Last Will and Testament and requested us to act as witnesses; the Testator signed this Will in our presence; and we subscribed our names as witnesses in the Testator's presence.
      </p>
      <div class="affidavit-sig-row">
        <div class="sig-field">
          <div class="sig-field-line"></div>
          <div class="sig-field-label">Testator Signature — ${fill(testatorName, 16)}</div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line"></div>
          <div class="sig-field-label">Witness Signature — ${fill(witnesses[0]?.name, 12)}</div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line"></div>
          <div class="sig-field-label">Witness Signature — ${fill(witnesses[1]?.name, 12)}</div>
        </div>
      </div>
      <div class="notary-jurat">
        Subscribed and sworn to before me this ${fill(date.day, 5)} day of ${fill(date.month, 14)}, ${fill(date.year, 6)}.
      </div>
      <div class="notary-sig-row">
        <div class="sig-column">
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Signature of Notary Public</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line">${fill(notary.name, 20)}</div>
            <div class="sig-field-label">Printed Name</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line"></div>
            <div class="sig-field-label">Title</div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line">${fill(notary.commissionExpires, 20)}</div>
            <div class="sig-field-label">Commission Expires</div>
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
  const fill = (val, chars) => fillIn(val, chars, highlight);

  return [
    renderTitleAndPreamble(data, v, fill),
    renderArticle1(data, v, fill),
    renderArticle2(data, v, fill),
    renderArticle3(data, v, fill),
    renderArticle4(),
    renderArticle5(),
    renderArticle6(),
    renderArticle7(data, v, fill),
    renderArticle8(),
    renderArticle9(),
    renderArticle10(),
    renderTestimoniumAndSignatures(data, v, fill),
    renderWitnessAttestation(data, v, fill),
    renderNotaryCertificate(data, v, fill),
  ]
    .map((chunk) => chunk.trim())
    .join("\n\n");
}
