import type { GuidanceEntry } from "../shared/guidance";

export const REVOCABLE_TRUST_GUIDANCE: Record<string, GuidanceEntry> = {
  kind: {
    title: "Kind of Trust",
    whatItDoes:
      "Chooses whether one person or two spouses create the trust. In a joint trust both spouses are trustors and serve together as the first trustees.",
    options: [
      "Single: one trustor, who serves as the first trustee.",
      "Joint: both spouses are trustors and first trustees. Enter the spouse's name under Marital Status.",
    ],
    typical:
      "Married couples who own community property often use one joint trust; a person with separate property or a separate plan uses a single trust.",
    impact:
      "Under RCW 11.103.030, either spouse alone may revoke a joint trust as to community property, but amending it takes both spouses. Separate property may be revoked by the spouse who contributed it. Putting property in a trust does not change whether it is community or separate property. After the first spouse dies, the survivor may revoke or amend a joint trust as to all trust property; have counsel confirm this choice against RCW 11.103.030(2).",
    statutes: ["RCW 11.103.030"],
  },
  trustName: {
    title: "Trust Name",
    whatItDoes:
      "Gives the trust a name that is used to retitle accounts and property into the trustee's hands.",
    options: [
      "Use a plain descriptive name, such as the family name followed by Revocable Living Trust.",
      "Leave blank to write the name in by hand.",
    ],
    typical:
      "Most trusts carry the trustor's family name and the signing year.",
    impact:
      "Banks and title companies match the name and date on the trust to the account or deed, so use the same wording everywhere it is cited. A trust is created only when its creation requirements are met, including a trustee and a beneficiary other than the same single person (RCW 11.98.011).",
    statutes: ["RCW 11.98.011"],
  },
  successorTrustees: {
    title: "Successor Trustees",
    whatItDoes:
      "Names who manages the trust after the last trustor dies or becomes unable to act, and the alternate who steps in if the first cannot or will not serve.",
    options: [
      "Name one person, and an alternate who is a different person.",
      "Leave blank to name the successor trustee by hand at signing.",
    ],
    typical:
      "Most trustors name an adult child or trusted relative, with a second relative or friend as alternate.",
    impact:
      "Without a named successor, no one is chosen to manage the trust when the trustors cannot, and the beneficiaries or a court must appoint one. The trustee's powers come from the trust and chapter 11.98 RCW, including RCW 11.98.070.",
    statutes: ["RCW 11.98.070"],
  },
  finalTaker: {
    title: "Final Taker",
    whatItDoes:
      "Names who receives the trust property if no spouse and no descendant survives the last trustor. Beyond that person, the property passes to the trustor's heirs at law.",
    options: [
      "Name a relative, friend, or charity and state the relationship.",
      "Leave blank to fill in by hand; the document falls back to heirs at law.",
    ],
    typical:
      "Most trustors name a sibling, parent, or a charity as the last taker.",
    impact:
      "This gift matters only when all earlier takers fail. Descendants take by representation as RCW 11.02.005(18) defines it, with any share for a beneficiary under age 25 held in trust.",
    statutes: ["RCW 11.02.005"],
  },
  scheduleA: {
    title: "Schedule A",
    whatItDoes:
      "Lists the property that is placed in the trust. Listing an asset here records the intent; titling still has to be changed with the bank, broker, or county.",
    options: [
      "List each asset in one line: a bank account by institution and type, real property by street address, an investment account by institution.",
      "Leave empty and complete the list by hand.",
    ],
    typical:
      "Most trustors list their home, bank and brokerage accounts, and any business interests.",
    impact:
      "A trust holds only property that has actually been transferred to the trustee. Retitle each asset and keep the list current as property is bought or sold.",
    statutes: [],
  },
  notary: {
    title: "Notary",
    whatItDoes:
      "Records the notary who completes the acknowledgment of the trustor's signature at signing.",
    options: [
      "Leave blank until signing; the notary fills these in.",
      "Enter the notary's name and commission expiration if you know them in advance.",
    ],
    typical:
      "Trustors usually sign before a notary at the same appointment as their other documents.",
    impact:
      "This document provides for no witnesses; the notarial acknowledgment is the only completion step besides the trustor's signature.",
    statutes: [],
  },
};
