export interface DocumentContent {
  description: string;
  summary: string;
  audience: string;
  signing: string[];
  after: string[];
  citations: string[];
}

export const CONTENT: Record<string, DocumentContent> = {
  will: {
    description:
      "Draft a Washington will in your browser: guardians, fiduciaries, property disposition, and a self-proving affidavit, to bring to an attorney.",
    summary:
      "A will names who receives property at death, who serves as personal representative and trustee, and who is nominated as guardian of the person and conservator of the estate. The draft covers family identification, disposition of remains, community property characterization, an optional spousal gift in trust or by disclaimer trust, residuary disposition by representation, trustee powers, a no-contest provision, and a self-proving affidavit.",
    audience:
      "Washington residents drafting a will, including married couples who draft reciprocal wills from one shared plan.",
    signing: [
      "The will is signed by the testator in front of two witnesses, who each sign a witness declaration.",
      "The self-proving affidavit is signed by the testator and the witnesses and completed with a dated notarial jurat.",
    ],
    after: [
      "The Attorney Memo export lists every choice and advisory for counsel to review.",
    ],
    citations: [
      "RCW 11.12.260",
      "RCW 11.130.010",
      "RCW 68.50.160",
      "RCW 6.32.250",
      "RCW 11.120.070",
      "RCW 11.68.011",
      "RCW 11.20.020",
      "RCW 42.45.130",
    ],
  },
  "remains-directive": {
    description:
      "Draft a Washington disposition of remains directive under RCW 68.50.160 that names an agent to control burial, cremation, and funeral arrangements.",
    summary:
      "A disposition of remains directive designates an agent and an alternate to control burial, cremation, and funeral arrangements, with an optional statement of wishes and optional funeral and disposition instructions. A named agent ranks above the statutory next-of-kin order.",
    audience:
      "Washington residents who want to name who controls the disposition of their remains, whether or not they also have a will.",
    signing: [
      "The declarant signs and dates the directive in the presence of two witnesses, who attest to it.",
      "A notarial acknowledgment is included but is not required by RCW 68.50.160. It gives a funeral establishment or cemetery authority independent proof of the declarant's signature.",
    ],
    after: [
      "The Attorney Memo export lists every choice and advisory for counsel to review.",
    ],
    citations: ["RCW 68.50.160"],
  },
  "health-care-directive": {
    description:
      "Draft a Washington health care directive under the Natural Death Act, with a two-witness declaration, to bring to an attorney.",
    summary:
      "A health care directive under the Natural Death Act states the declarer's wishes about life-sustaining treatment when a terminal or permanent unconscious condition is diagnosed, with an election about artificial nutrition and hydration and an optional place-of-death preference. It is one continuous declaration of lettered paragraphs.",
    audience:
      "Washington residents who want to record their wishes about life-sustaining treatment in advance.",
    signing: [
      "The declarer signs the directive in the presence of two witnesses, who sign a witness declaration.",
      "No notarial acknowledgment is part of this document.",
    ],
    after: [
      "The Attorney Memo export lists every choice and advisory for counsel to review.",
    ],
    citations: ["RCW 70.122.020", "RCW 70.122.030"],
  },
  "general-power-of-attorney": {
    description:
      "Draft a Washington general power of attorney, a non-durable power that ends on incapacity, with a notarial acknowledgment.",
    summary:
      "A general power of attorney appoints an attorney-in-fact to act for the principal in property, financial, business, and digital-asset matters, and nominates that person as guardian if guardianship proceedings are brought. It is non-durable: it ends on the principal's incapacity, so it is meant to be paired with a durable power of attorney.",
    audience:
      "Washington residents who want someone to act for them in financial matters while they have capacity.",
    signing: [
      "The principal signs the document, and a notary completes the acknowledgment that RCW 11.125.050 provides for.",
    ],
    after: [
      "The Attorney Memo export lists every choice and advisory for counsel to review.",
    ],
    citations: ["RCW 11.125.050", "RCW 11.125.100", "chapter 11.120 RCW"],
  },
  "durable-power-of-attorney": {
    description:
      "Draft a Washington durable power of attorney, a springing power that begins on incapacity, with a notarial acknowledgment.",
    summary:
      "A durable power of attorney appoints a primary and an alternate attorney-in-fact. It is springing: the powers begin on the principal's incapacity and continue through it. It covers financial, digital-account, and health care decision powers, with optional authority over minor children and a last-goodbyes direction.",
    audience:
      "Washington residents who want someone named to act for them if they become incapacitated.",
    signing: [
      "The principal signs the document, and a notary completes the acknowledgment that RCW 11.125.050 provides for.",
      "The certification page is a separate page that the agent or physicians complete at the time of incapacity, not at signing.",
    ],
    after: [
      "The Attorney Memo export lists every choice and advisory for counsel to review.",
    ],
    citations: [
      "RCW 11.125.040",
      "RCW 11.125.020",
      "RCW 11.125.090",
      "RCW 11.125.400",
      "RCW 11.125.410",
      "RCW 11.130.335",
    ],
  },
  "revocable-trust": {
    description:
      "Draft a Washington revocable living trust, single or joint, with successor trustees, a schedule of trust property, and a notarial acknowledgment.",
    summary:
      "A revocable living trust holds property for the trustors during life and passes it at death without naming a personal representative. The draft covers the declaration and name, revocation and amendment, the trustors' rights during life, incapacity, successor trustees, disposition after death to a surviving spouse, then to descendants by representation with a holdback until age 25, then to a final taker, spendthrift protection, trustee powers, and a schedule of trust property. A joint trust is created by spouses together.",
    audience:
      "Washington residents, single or married, who want to name who manages their property if they cannot and who receives it afterward.",
    signing: [
      "The trustor signs the trust as trustor and as trustee. In a joint trust, both spouses sign.",
      "A notary completes a notarial acknowledgment for each trustor. This document provides for no witnesses.",
    ],
    after: [
      "A trust holds only property that has been transferred to the trustee, so accounts and real property still have to be retitled.",
      "The Attorney Memo export lists every choice and advisory for counsel to review, with a funding checklist.",
    ],
    citations: [
      "RCW 11.103.020",
      "RCW 11.103.030",
      "RCW 11.103.040",
      "RCW 11.98.011",
      "RCW 11.98.070",
      "RCW 11.02.005",
      "RCW 6.32.250",
      "RCW 26.16.030",
    ],
  },
};
