import type { GuidanceEntry } from "../shared/guidance";

export const HEALTH_CARE_GUIDANCE: Record<string, GuidanceEntry> = {
  directions: {
    title: "Health Care Directions",
    whatItDoes:
      "Directs that life-sustaining treatment be withheld or withdrawn if you are later diagnosed with a terminal condition or a permanent unconscious condition, under RCW 70.122.030, and lets you state a place-of-death preference.",
    options: [
      "At home, if reasonable.",
      "In the hospital, if that eases funeral arrangements for your loved ones.",
      "No preference stated.",
    ],
    typical:
      "Most declarers state a preference so their family is not left guessing at an already difficult time.",
    impact:
      "This paragraph only takes effect once a terminal condition is diagnosed in writing by the attending physician, or a permanent unconscious condition is diagnosed by two physicians, under RCW 70.122.030(2) — it has no effect on ordinary medical treatment.",
    statutes: ["RCW 70.122.020", "RCW 70.122.030"],
  },
  elections: {
    title: "Elections",
    whatItDoes:
      "Records your choice — DO or DO NOT — for artificial nutrition, artificial hydration, and CPR if you are diagnosed with a terminal condition or a permanent unconscious condition.",
    options: [
      "Leave any row undecided — it prints as a blank line that can still be marked by hand.",
      "Elect DO or DO NOT for each of the three rows independently.",
    ],
    typical:
      "Most declarers elect DO NOT for all three, paired with the comfort-care paragraph that always applies regardless of these elections.",
    impact:
      "An undecided row gives the attending physician no direction for that specific treatment, leaving them to fall back on the general standard of care rather than your stated choice.",
    statutes: ["RCW 70.122.030"],
  },
  witnesses: {
    title: "Witnesses",
    whatItDoes:
      "Records who witnessed you sign and date this Directive. RCW 70.122.030(1) requires either two witnesses not related to you by blood or marriage, or a notarized acknowledgment — this document uses the witness option.",
    options: [
      "Leave blank until execution — this is completed at the signing appointment.",
      "Use a witness who is not your spouse, a beneficiary under your Will, your attending physician, or an employee of your attending physician or health facility.",
    ],
    typical:
      "This Directive is typically signed at the same appointment as your Will, using witnesses who are not related to you and have no interest in your estate.",
    impact:
      "Without two qualifying witnesses (or notarization instead), the Directive does not meet RCW 70.122.030(1)'s execution requirement and may not be honored.",
    statutes: ["RCW 70.122.030"],
  },
};
