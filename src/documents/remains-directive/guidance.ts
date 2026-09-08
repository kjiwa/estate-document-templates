import type { GuidanceEntry } from "../shared/guidance";

// Content as data, not markup — mirrors `will/guidance.ts`'s pattern.
export const DIRECTIVE_GUIDANCE: Record<string, GuidanceEntry> = {
  agent: {
    title: "Designation of Agent",
    whatItDoes:
      "Names who controls burial, cremation, and funeral arrangements for you, under RCW 68.50.160 — overriding the statutory next-of-kin priority order that would otherwise apply.",
    options: [
      "Name an agent and an alternate.",
      "Add your wishes (burial, cremation, or other instructions) — advisory only, not binding on your agent.",
    ],
    typical:
      "Most declarants name their spouse as agent, with an adult child or sibling as alternate.",
    impact:
      "A named agent under RCW 68.50.160(3)(b) ranks above the surviving spouse or state registered domestic partner, adult children, parents, siblings, and a court-appointed guardian in Washington's statutory priority order — so this section lets you override the default even for your own spouse if you have reason to. It does not override a designation already on file on a U.S. Department of Defense DD Form 93 for a declarant who dies while serving in the armed forces, reserves, or national guard — RCW 68.50.160(3)(a) ranks ahead of an agent named here.",
    statutes: ["RCW 68.50.160"],
  },
  witnesses: {
    title: "Witnesses",
    whatItDoes:
      "Records who witnessed you sign and date this Directive — RCW 68.50.160 requires at least one witness for the agent designation to take effect.",
    options: [
      "Leave blank until execution — this is completed at the signing appointment.",
      "Use a witness who is not your named agent or alternate, to avoid any appearance of self-interest, even though the statute does not disqualify an interested witness here the way it does for a will.",
    ],
    typical:
      "This Directive is typically signed at the same appointment as your Will, using the same two witnesses.",
    impact:
      "Without at least one witness present at signing, the written document does not meet RCW 68.50.160(3)(b)'s requirement, and control of your remains falls back to the statutory priority order instead of your own choice.",
    statutes: ["RCW 68.50.160"],
  },
  notary: {
    title: "Notary",
    whatItDoes:
      "Records the notary who completes an acknowledgment of your signature — not required by RCW 68.50.160, but included so a funeral establishment or cemetery authority receiving this Directive without other context has independent proof it is genuine.",
    options: [
      "Leave blank until execution — this is completed at the signing appointment.",
    ],
    typical:
      "The same notary who completes the Will's self-proving affidavit at the same appointment, if a Will is being signed at the same time.",
    impact:
      "Without a notarized acknowledgment, this Directive remains legally effective under RCW 68.50.160 as long as it is signed, dated, and witnessed — notarization only makes it easier for a funeral establishment or cemetery authority to accept on sight.",
    statutes: ["RCW 11.20.020", "RCW 42.45.130"],
  },
};
