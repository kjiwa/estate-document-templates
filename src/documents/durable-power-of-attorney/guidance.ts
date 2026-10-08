import type { GuidanceEntry } from "../shared/guidance";

export const DURABLE_POA_GUIDANCE: Record<string, GuidanceEntry> = {
  agents: {
    title: "Attorney-in-Fact",
    whatItDoes:
      "Names the person who may act for you once you are incapacitated, and the alternate who steps in if the first cannot or will not serve. The powers begin only on your incapacity, as defined in Paragraph 2, and continue through it.",
    options: [
      "Name one person, and an alternate who is a different person.",
      "Leave blank to name the attorney-in-fact by hand at signing.",
    ],
    typical:
      "Most principals name a spouse or adult child, with a second relative or close friend as alternate.",
    impact:
      "Under RCW 11.125.100(7), a later power of attorney that revokes all other powers of attorney revokes this one, so sign any general power of attorney first and this one after it. Your health care directive states your treatment wishes for an agent to follow; keep the two consistent. RCW 11.125.400(3) subjects the health care authority to the limits that chapter 11.130 RCW places on guardians, and RCW 11.125.090 lets a physician or licensed psychologist who is unrelated to you determine that incapacity has occurred.",
    statutes: ["RCW 11.125.090", "RCW 11.125.100", "RCW 11.125.400"],
  },
  elections: {
    title: "Optional Paragraphs",
    whatItDoes:
      "Two paragraphs appear only if you choose them: authority over decisions for your minor children, and a direction to keep you alive for a reasonable time so loved ones can say goodbye.",
    options: [
      "Minor children: leave off if you have none; turn on to let the attorney-in-fact act for them.",
      "Last goodbyes: turn on to direct the attorney-in-fact to allow loved ones time to travel to you.",
    ],
    typical:
      "Parents of minor children usually turn on the first. The second is a personal choice.",
    impact:
      "Authority over minor children takes effect only if no other parent or legal representative is readily available (RCW 11.125.410), and a court-appointed guardian supersedes it. It does not nominate a guardian for your children; your will does.",
    statutes: ["RCW 11.125.410"],
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
      "This document is set up for notarial acknowledgment, which RCW 11.125.050 accepts in place of two witnesses and which third parties expect. Sign before the notary. The certification page is not completed at signing.",
    statutes: ["RCW 11.125.050"],
  },
};
