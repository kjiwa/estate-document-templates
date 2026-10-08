import type { GuidanceEntry } from "../shared/guidance";

export const GENERAL_POA_GUIDANCE: Record<string, GuidanceEntry> = {
  agent: {
    title: "Attorney-in-Fact",
    whatItDoes:
      "Names the person who may act for you in property, financial, business, and digital-asset matters, and whom you nominate as your guardian if guardianship proceedings are ever brought. These are two separate legal effects of one name.",
    options: [
      "Name one person you trust with broad control of your property.",
      "Leave blank to name the attorney-in-fact by hand at signing.",
    ],
    typical:
      "Most principals name a spouse, adult child, or close friend. Choose someone who is willing, organized, and able to act without conflict.",
    impact:
      "This power of attorney is not durable: under RCW 11.125.100 it ends when you become incapacitated, so it does not cover the situation people most often need an agent for. Pair it with a durable power of attorney. The guardianship nomination is a distinct effect: it asks a court to appoint this person as your guardian, and the court is not bound by it. The gifting paragraph lets your attorney-in-fact make gifts that exceed the annual gift tax exclusion for public-benefit qualification, so have counsel review it before you sign.",
    statutes: ["RCW 11.125.050", "RCW 11.125.100"],
  },
  notary: {
    title: "Notary",
    whatItDoes:
      "Records the notary who acknowledges your signature. RCW 11.125.050 requires either a notarial acknowledgment or two qualified witnesses; this document uses the notary.",
    options: [
      "Leave blank until execution; the notary completes it at the signing appointment.",
    ],
    typical:
      "The same notary who completes your other documents at the same appointment.",
    impact:
      "Without the acknowledgment, the power of attorney does not meet RCW 11.125.050's execution requirement, and third parties may refuse to honor it.",
    statutes: ["RCW 11.125.050"],
  },
};
