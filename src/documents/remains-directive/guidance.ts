import type { GuidanceEntry } from "../shared/guidance";

// Content as data, not markup — mirrors `will/guidance.ts`'s pattern.
export const DIRECTIVE_GUIDANCE: Record<string, GuidanceEntry> = {
  agent: {
    title: "Designation of Agent",
    whatItDoes:
      "Names who controls burial, cremation, and funeral arrangements for you, under RCW 68.50.160 — overriding the statutory next-of-kin priority order that would otherwise apply.",
    options: [
      "Name an agent and an alternate.",
      "Add non-binding wishes here (burial, cremation, or other preferences). Binding instructions go in the Funeral and Disposition Instructions sections, which become Article 2.",
    ],
    typical:
      "Most declarants name their spouse as agent, with an adult child or sibling as alternate.",
    impact:
      "A named agent under RCW 68.50.160(3)(b) ranks above the surviving spouse or state registered domestic partner, adult children, parents, siblings, and a court-appointed guardian in Washington's statutory priority order — so this section lets you override the default even for your own spouse if you have reason to. It does not override a designation already on file on a U.S. Department of Defense DD Form 93 for a declarant who dies while serving in the armed forces, reserves, or national guard — RCW 68.50.160(3)(a) ranks ahead of an agent named here.",
    statutes: ["RCW 68.50.160"],
  },
  instructions: {
    title: "Funeral and Disposition Instructions",
    whatItDoes:
      "Records your direction for burial or cremation and any prearrangements, as a written Article 2 of this Directive. RCW 68.50.160(1) lets you direct the disposition of your remains in a signed writing.",
    options: [
      "Choose burial or cremation, or leave blank to leave the method to your agent.",
      "Record prearrangements with a funeral establishment, if any.",
    ],
    typical:
      "Most declarants who have prepaid or prearranged name the establishment here so survivors know to use it.",
    impact:
      "Prearrangements made under RCW 68.50.160(2) are not subject to cancellation or substantial revision by your survivors. Article 2 appears in the document only once at least one instruction is filled in.",
    statutes: ["RCW 68.50.160"],
  },
  cremains: {
    title: "Cremated Remains",
    whatItDoes:
      "Says what happens to cremated remains. Shown only when cremation is chosen.",
    options: [
      "Columbarium, scattering, or interment at a place you name.",
      "Held by a person you name.",
    ],
    typical: "Name the specific place or the person who will hold the remains.",
    impact:
      "Without a stated disposition, your agent decides what to do with the cremated remains.",
    statutes: ["RCW 68.50.160"],
  },
  arranger: {
    title: "Arrangements",
    whatItDoes:
      "Names the funeral home or person who should make the arrangements.",
    options: ["Leave blank to have your Article 1 agent arrange everything."],
    typical: "A funeral home you have already spoken with.",
    impact:
      "This is a direction for your agent and survivors; it does not change who controls disposition under RCW 68.50.160(3).",
    statutes: ["RCW 68.50.160"],
  },
  notify: {
    title: "Persons to Notify",
    whatItDoes:
      "Lists people to contact upon your death, with their addresses and telephone numbers.",
    options: ["Add one row per person; blank rows are left out."],
    typical: "Close family, friends, and your attorney.",
    impact:
      "Contact details appear in the printed Directive, so keep them current.",
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
