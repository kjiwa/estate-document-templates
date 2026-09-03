// Content as data, not markup: one entry per decision the sidebar asks the
// user to make. Rendered by renderGuidance() into a native <details>
// disclosure inside the relevant fieldset — keyboard accessible, no JS for
// the toggle, no ARIA to get wrong. This is editor content: it must never
// reach #document-sheet or the standalone export.
export const GUIDANCE = {
  maritalStatus: {
    title: "Marital Status",
    whatItDoes:
      "Tells the document whether you have a spouse — every clause that mentions “my spouse” depends on this answer.",
    options: [
      "Married — the spouse name and gender fields, and the Disposition of Property fieldset, apply.",
      "Unmarried — those fields are hidden, and the Will names your descendants directly instead.",
    ],
    typical:
      "Most testators using this template are married, which is why it is the default.",
    impact:
      "Unmarried removes the community property characterization (RCW 26.16.030), the Community Property Agreement acknowledgment, and the spousal gift clause outright; the estate passes directly to your then-surviving descendants instead of first to a spouse.",
    statutes: ["RCW 26.16.030"],
  },
  children: {
    title: "Children",
    whatItDoes:
      "Names the children this Will's references to “my children” cover, and who Article 4's trust shares are held for.",
    options: [
      "List every living child by name, oldest first.",
      "Leave the list empty if you have no children — the clause adjusts its wording automatically.",
    ],
    typical:
      "Most testators list all children from every relationship. A class gift to “children hereafter born to or adopted by me” covers future children automatically, so this list does not need to be revisited for that reason alone.",
    impact:
      "An incomplete list does not disinherit an omitted child by itself — RCW 11.12.091 protects children born or adopted after the Will and not named here — but it can create confusion about who the trust and guardianship provisions were meant to cover.",
    statutes: ["RCW 11.12.091"],
  },
  guardians: {
    title: "Guardian of the Person",
    whatItDoes:
      "Nominates who raises your minor children — makes their day-to-day and medical, educational, and residential decisions — if neither parent can.",
    options: [
      "Name one person as primary, and a different person as alternate.",
      "The same person can serve as both Guardian and Conservator, but is not required to.",
    ],
    typical:
      "Most parents name a sibling, close friend, or the child's godparent as primary, with a second choice as alternate in case the first is unable or unwilling to serve.",
    impact:
      "Without a named guardian, a court decides who raises your children with no guidance from you on file.",
    statutes: ["RCW 11.130.010"],
  },
  conservators: {
    title: "Conservator of the Estate",
    whatItDoes:
      "Nominates who manages your minor children's property and financial affairs — separately from who raises them day to day.",
    options: [
      "Name the same person who serves as Guardian, if you want one person handling both.",
      "Name a different person — someone financially organized rather than the best day-to-day caregiver, for example.",
    ],
    typical:
      "Many families name the same person for both roles for simplicity. Larger or more complex estates sometimes split the roles.",
    impact:
      "Chapter 11.130 RCW (2022) separated guardianship of the person from conservatorship of the estate; a Will that still says “guardian of the person and estate” uses pre-2022 terminology a court will not recognize as naming a conservator.",
    statutes: ["RCW 11.130.010"],
  },
  remains: {
    title: "Disposition of Remains",
    whatItDoes:
      "Names who controls burial, cremation, and funeral arrangements for you — a decision that is otherwise made by statutory next-of-kin priority.",
    options: [
      "Name an agent and an alternate.",
      "Add a preference (burial, cremation, or other instructions) — advisory only, not binding on the agent.",
    ],
    typical:
      "Most testators name their spouse as agent, with an adult child or sibling as alternate.",
    impact:
      "A named agent in a witnessed Will ranks above the surviving spouse in Washington's statutory priority order, so this section lets you override the default even for your own spouse if you have reason to.",
    statutes: ["RCW 68.50.160"],
  },
  spousalGift: {
    title: "Spousal Gift Structure",
    whatItDoes:
      "Chooses how the gift to your surviving spouse is structured: outright, or outright with a disclaimer option into a trust.",
    options: [
      "Outright — simple, full control to the survivor, no tax planning at the first death.",
      "Disclaimer trust — the gift is still outright, but the survivor may disclaim any portion within nine months into a trust for the survivor and children, decided after death with real numbers.",
    ],
    typical:
      "Outright is the common default for smaller estates. A disclaimer trust is a standard, low-complexity hedge for estates that may approach Washington's estate tax exclusion, since Washington does not offer portability between spouses.",
    impact:
      "Washington's estate tax exclusion is $3,076,000 per individual for 2026 deaths, and is not portable between spouses. Leaving everything outright means no tax at the first death, but the first spouse's exclusion is then permanently unused, and only the survivor's single exclusion shelters the combined estate at the second death.",
    statutes: ["RCW 11.86.031"],
  },
  communityPropertyAgreement: {
    title: "Community Property Agreement",
    whatItDoes:
      "Acknowledges a separate Community Property Agreement (CPA), if you have one, and clarifies that this Will governs only to the extent the CPA does not apply.",
    options: [
      "Off (default) — no CPA on file.",
      "On — records the date of an existing or planned CPA.",
    ],
    typical:
      "Couples who want community property to pass automatically to the survivor outside probate sign a CPA separately from a Will.",
    impact:
      "A CPA operates by contract at death, generally passing community property outside probate — it overrides this Will's dispositive scheme for that property and, if a disclaimer trust structure is also selected above, can defeat that planning by putting everything in the survivor's estate regardless of any disclaimer.",
    statutes: ["RCW 26.16.120"],
  },
  ultimateBeneficiary: {
    title: "Ultimate Contingent Beneficiary",
    whatItDoes:
      "Names who inherits if neither your spouse nor any descendant survives you — the backstop before the estate would pass by intestate succession.",
    options: [
      "A relative (sister, parent, etc.) — name the relationship and the person.",
      "A charity or institution instead of an individual — describe the relationship field as its role (e.g. “charitable beneficiary”).",
    ],
    typical:
      "Most testators name a sibling or parent. This branch of the Will is rarely reached, since it requires both the spouse and every descendant to predecease the testator.",
    impact:
      "Left unnamed, this defaults to intestate succession under Washington law rather than a beneficiary you chose.",
    statutes: [],
  },
  survivorship: {
    title: "Survivorship Period",
    whatItDoes:
      "Sets how many full days a beneficiary must survive you to inherit, rather than being treated as predeceasing you.",
    options: ["Any number of days you choose — 60 is the default used here."],
    typical:
      "Washington's own statutory default survivorship period is 120 hours (5 days) absent a contrary Will provision. Many wills lengthen it — 30, 60, or 90 days — to avoid property passing through a beneficiary's estate for a death that follows shortly after the testator's.",
    impact:
      "Because this Will sets its own period, it overrides rather than tracks the statutory default — the number you choose here is the number that controls.",
    statutes: [],
  },
  personalRepresentatives: {
    title: "Personal Representative",
    whatItDoes:
      "Names who probates your estate — inventories the assets, pays debts and taxes, and distributes what remains under this Will.",
    options: [
      "Name a primary and a different alternate; the alternate is what keeps the office from falling to the statutory order.",
      "A nonresident may serve, but must appoint an agent who resides in the county where the estate is probated.",
    ],
    typical:
      "Most testators name their spouse as primary and an adult child or sibling as alternate. Article 7.2 waives bond for every fiduciary nominated here, and Article 7.5 requests nonintervention powers under RCW 11.68.011 so the estate can be administered with the least court involvement.",
    impact:
      "If no one is named, or everyone named declines, RCW 11.28.120 supplies the order instead: the surviving spouse or the person they nominate, then next of kin — children, then parents, then siblings, then grandchildren, then nieces and nephews. RCW 11.36.010 separately disqualifies minors, persons of unsound mind, anyone convicted of a felony or a crime involving moral turpitude, and anyone whose letters were revoked for cause within the last 24 months.",
    statutes: ["RCW 11.28.120", "RCW 11.36.010", "RCW 11.68.011"],
  },
  trustees: {
    title: "Trustee",
    whatItDoes:
      "Names who holds and administers any trust this Will creates — a share for a beneficiary under twenty-five, or a portion your spouse disclaims into trust.",
    options: [
      "Name a primary and an alternate, even though the trust may never come into existence.",
      "The same person can hold both this office and Personal Representative, but the two jobs are different — probate administration ends; a trust share can run for years.",
    ],
    typical:
      "Many testators name the same person for both offices. The trust here arises only for a beneficiary under twenty-five or through a spousal disclaimer, so in many estates this office is never filled.",
    impact:
      "Article 6 grants the Trustee the full statutory power set under RCW 11.98.070 in addition to the specific powers listed there. If the office falls vacant and no successor was named, RCW 11.98.039 requires either the agreement of every party with an interest in the trust or a petition to superior court — naming an alternate here avoids both.",
    statutes: ["RCW 11.98.070", "RCW 11.98.039"],
  },
  witnesses: {
    title: "Witnesses",
    whatItDoes:
      "Records the two witnesses who will sign the Will and the self-proving affidavit.",
    options: [
      "Name two witnesses who are not beneficiaries or named fiduciaries, if possible.",
      "Leave blank until execution — names, addresses, and signatures are typically completed together at the signing appointment.",
    ],
    typical:
      "Two adults unconnected to the estate — coworkers, neighbors, or the notary's office staff — are common choices specifically to avoid the interested-witness problem below.",
    impact:
      "RCW 11.12.160: a witness who is also a beneficiary or named fiduciary creates a rebuttable presumption that their gift was procured by undue influence, unless two other disinterested witnesses also sign. The Review panel flags this automatically once a witness is named.",
    statutes: ["RCW 11.12.020", "RCW 11.12.160"],
  },
  notary: {
    title: "Notary",
    whatItDoes:
      "Records the notary who will complete the self-proving affidavit, making the Will self-proving so witnesses do not need to testify in probate court.",
    options: [
      "Leave blank until execution — this is completed at the signing appointment.",
    ],
    typical:
      "A notary public, often at a bank, law office, or shipping/notary storefront, completes this at the same appointment as the witness signatures.",
    impact:
      "Without a notarized self-proving affidavit, the Will is still valid if properly witnessed, but probate requires locating and taking testimony from a witness instead.",
    statutes: ["RCW 11.20.020", "RCW 42.45.130"],
  },
};

function renderList(items) {
  if (!items || items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

export function renderGuidance(sectionId) {
  const entry = GUIDANCE[sectionId];
  if (!entry) return "";

  return `
    <details class="guidance">
      <summary>${entry.title} — what this means</summary>
      <p>${entry.whatItDoes}</p>
      <p><strong>Options:</strong></p>
      ${renderList(entry.options)}
      <p><strong>Typical:</strong> ${entry.typical}</p>
      <p><strong>Impact:</strong> ${entry.impact}</p>
      ${entry.statutes.length ? `<p><strong>Statutes:</strong> ${entry.statutes.join(", ")}</p>` : ""}
    </details>
  `.trim();
}
