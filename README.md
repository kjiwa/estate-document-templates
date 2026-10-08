# Estate Document Templates

A client-side web application for generating, customizing, and printing legally structured estate planning documents compliant with Washington State law. Ships five document types today — a Last Will and Testament (RCW Title 11), a Disposition of Remains Directive (RCW 68.50.160), a Health Care Directive (RCW 70.122.030, the Natural Death Act), a General Power of Attorney (RCW 11.125), and a Durable Power of Attorney (RCW 11.125) — switchable from the header picker, drafted from one shared plan.

## Features

- **Live Reactive Drafting**: Real-time two-way synchronization between sidebar input controls and the paged document preview.
- **Washington Statutory Alignment**: Pre-configured legal provisions conforming to:
  - **RCW 11.12**: Execution, revocation, and separate lists for tangible personal property.
  - **RCW 11.130**: Guardian of the person and conservator of the estate as independent nominations.
  - **RCW 68.50.160**: Disposition of remains.
  - **RCW 26.16.030 & 26.16.120**: Community property characterization and Community Property Agreement acknowledgment.
  - **RCW 11.86.031**: Optional disclaimer-trust structure for the spousal gift.
  - **RCW 11.98**: Trustee powers and small trust terminations under chapter 11.98 RCW.
  - **RCW 11.120.070**: Fiduciary access to digital assets, including express consent to disclosure of communication content.
  - **RCW 6.32.250**: Spendthrift protection, limited to trust interests.
  - **RCW 11.02.005(18)**: Representation (not per stirpes) for gifts to a deceased beneficiary's descendants; the survivorship period is editable per plan rather than tracking a statutory default.
  - **RCW 11.68.011**: Nonintervention powers, requested by petition rather than directed outright.
  - **RCW 11.20.020 & RCW 42.45.130**: Self-proving affidavit with testator and witness signature lines, and a dated notarial jurat.
  - **RCW 70.122.020 & RCW 70.122.030**: Health Care Directive under the Natural Death Act — terminal/permanent unconscious condition elections and witness or notarial execution.
  - **RCW 11.125.050 & RCW 11.125.100**: General Power of Attorney — execution by notarial acknowledgment, and the statutory termination provisions, recited verbatim for a non-durable power of attorney.
  - **RCW 11.125.040, 11.125.090, 11.125.400 & 11.125.410**: Durable Power of Attorney — the durability statement, determination of incapacity, health care authority bounded by the guardian limits of RCW 11.130.335(3), and authority over minor children.
- **Guidance Layer**: Every decision-bearing field carries a native `<details>` disclosure explaining what it does, the options, what's typical, and its impact — content only, never part of the printed document. A live Review panel raises advisories (e.g. an interested witness, a missing alternate fiduciary) computed by a pure `analyzeProfile()` function. An Attorney Memo export lists every choice and advisory for counsel.
- **Plan Switching & Pronoun Agreement**: Toggle between reciprocal spousal plans, with automatic updates to pronouns, fiduciary appointments, and beneficiary declarations.
- **Variable Highlighting**: Toggle dynamic field indicators on screen to audit customizable terms without affecting printed output.
- **Screen-to-Print Fidelity**: Print stylesheets configured for standard Letter portrait dimensions (`8.5in x 11in`), calibrated margins, `@page` margin-box page numbers and testator initials, widow/orphan controls, and unbreakable signature and notary blocks.
- **State Persistence & Portability**:
  - Auto-persists drafting sessions in browser `localStorage`, deep-merged over the shipped defaults so an older or partial draft never invents a value for a field it doesn't have.
  - Export and import full plan state as structured JSON, validated by shape.
  - Export standalone, self-contained HTML files ready for offline viewing or printing — styled from the same source the app uses, with no guidance content.

## Document Structure

### Last Will & Testament

1. **Title & Preamble**: Testator identification, domicile declaration, and revocation of prior wills.
2. **Article 1: Family, Guardians, and Conservators**: Spouse and children identification; guardian of the person and conservator of the estate nominated independently (RCW 11.130.010).
3. **Article 2: Disposition of Remains**: Agent and alternate for control of remains (RCW 68.50.160).
4. **Article 3: Disposition of Property**: Community property characterization, optional CPA acknowledgment, spousal gift (outright or disclaimer trust), incorporation of separate lists (RCW 11.12.260), residuary disposition by representation, and the ultimate contingent beneficiary.
5. **Article 4: Trust Beneficiaries and Distributions**: Health, education, support, and maintenance (HEMS) standard for beneficiaries under age 25, and small trust termination.
6. **Article 5: Spendthrift Provision**: Creditor protection under RCW 6.32.250, limited to trust interests.
7. **Article 6: Powers and Duties of Trustee**: Statutory powers under chapter 11.98 RCW, investment flexibility, and non-pro-rata in-kind distributions.
8. **Article 7: Administration and Fiduciaries**: Trustee and Personal Representative appointments, debts/last-illness/funeral expenses, digital-asset content-disclosure consent (RCW 11.120.070), nonintervention powers requested by petition (RCW 11.68.011), and survivorship/representation.
9. **Article 8: No Contest Provision**: In terrorem clause revoking interests of challenging parties.
10. **Article 9: Ancillary Administration**: Out-of-state property administration.
11. **Article 10: Severability and Governing Law**: Clause independence and choice of Washington law.
12. **Testimonium & Attestation**: Execution statement, testator signature block, witness declaration, and two-witness signature grid.
13. **Self-Proving Affidavit**: Testator and witness signature lines plus a dated notarial jurat conforming to RCW 11.20.020 and RCW 42.45.130.

### Disposition of Remains Directive

1. **Title & Declaration**: Declarant identification, domicile declaration, and revocation of prior remains directives.
2. **Article 1: Designation of Agent**: Agent and alternate to control disposition of remains, with an optional non-binding statement of wishes (RCW 68.50.160(3)(b)).
3. **Article 2: Effect, Priority, and Revocation**: Priority over the statutory next-of-kin order (RCW 68.50.160(3)(c)-(g)) and revocation of prior designations.
4. **Article 3: Severability and Governing Law**: Clause independence and choice of Washington law.
5. **Testimonium & Attestation**: Execution statement, declarant signature block, and a two-witness attestation that the declarant signed and dated the instrument in their presence (RCW 68.50.160(1)).
6. **Notarial Acknowledgment**: Not required by RCW 68.50.160 — included, and stated as not required in the document's own text, so a funeral establishment or cemetery authority receiving the instrument cold has independent proof of the declarant's signature.

### Health Care Directive

Unlike the will and the remains directive, this instrument has no Article/Clause numbering — it is one continuous declaration of lettered paragraphs (A)-(G) under the Natural Death Act, none of them optional.

1. **Title & Preamble**: Declarer identification, domicile declaration, and the Natural Death Act declaration (RCW 70.122.030).
2. **Paragraph (A)**: Direction to withhold or withdraw life-sustaining treatment on diagnosis of a terminal or permanent unconscious condition (RCW 70.122.020, RCW 70.122.030), with an optional place-of-death preference.
3. **Paragraph (B)**: Instruction that the Directive be honored by family, physicians, and any health care decision-maker.
4. **Paragraph (C)**: The statutory boxed check-one election table for artificial nutrition and hydration.
5. **Paragraphs (D)-(G)**: Capacity statement, right to amend, severability, and revocation of prior directives.
6. **Testimonium & Attestation**: Execution statement, declarer signature block, and witness declaration conforming to RCW 70.122.030(1)'s two-witness or notarial-acknowledgment alternative.

### General Power of Attorney

A non-durable power of attorney: it ends on the principal's incapacity, so it is meant to be paired with a durable power of attorney. Like the health care directive, it has no Article/Clause numbering.

1. **Title & Appointment**: Principal identification, domicile, appointment of the attorney-in-fact, and revocation of prior general powers of attorney.
2. **Powers**: Property transactions and collection of debts; goods, choses in action, and business; instruments; gifts for public-benefit qualification; digital assets (chapter 11.120 RCW); and the giving-and-granting ratification.
3. **Termination**: Revocation, death, third-party reliance, nomination of the attorney-in-fact as guardian, and RCW 11.125.100 recited verbatim.
4. **Testimonium & Acknowledgment**: Execution statement, principal signature block, and the notarial acknowledgment RCW 11.125.050 provides for.

### Durable Power of Attorney

A springing, durable power of attorney: the powers begin on the principal's incapacity and continue through it (RCW 11.125.040). Like the general power of attorney, it numbers its own paragraphs rather than using Article/Clause numbering; the two optional paragraphs are filtered before numbering, so numbers never gap.

1. **Title & Preamble**: Principal identification, domicile, and revocation of prior durable powers of attorney.
2. **Paragraphs 1-6**: Appointment of a primary and alternate attorney-in-fact, effectiveness on incapacity (RCW 11.125.020(5), RCW 11.125.090), powers (A)-(K) including health care decisions (RCW 11.125.400) and financial and digital-account powers, taxes, duration, and revocation.
3. **Paragraphs 7-11 and the closing paragraphs**: Reliance, applicable law, indemnity, limitation of power, HIPAA release, optional authority over minor children (RCW 11.125.410), digital assets (chapter 11.120 RCW), photocopies, and the optional last-goodbyes direction.
4. **Testimonium & Acknowledgment**: Execution statement, principal signature block, and the notarial acknowledgment RCW 11.125.050 provides for.
5. **Certification page**: A separate page, completed by the agent or physicians at the time of incapacity, not at signing.

## Project Structure

```
.
├── index.html               # Application entry point, loads /src/main.tsx
├── src/
│   ├── main.tsx             # Bootstraps the Preact app and store
│   ├── App.tsx              # Top-level view switch (document/plans/execute/print)
│   ├── components/          # Header, rail, contextual panel/sheet, plan and execute views
│   ├── documents/
│   │   ├── registry.ts      # DOCUMENTS: the document-type registry
│   │   ├── shared/          # Plan context and clauses shared across document types
│   │   ├── will/             # Washington Last Will & Testament: sections, body, guidance, review
│   │   ├── remains-directive/ # Disposition of Remains Directive: sections, body, guidance, review
│   │   ├── health-care-directive/ # Health Care Directive: sections, body, guidance, review
│   │   ├── general-power-of-attorney/ # General Power of Attorney: sections, body, guidance, review
│   │   └── durable-power-of-attorney/ # Durable Power of Attorney: sections, body, certification page, guidance, review
│   ├── export/               # Attorney memo and standalone HTML generation
│   ├── form/                 # FieldSpec union, <Field> renderer, field registry/traversal
│   ├── model/                 # Plan schema (zod), paths, migrations, pronouns, dates
│   ├── store/                # Reactive plan store and persistence (localStorage)
│   ├── ui/                   # Signals-derived UI state: editing, advisories, execute, files, theme
│   ├── fonts/                 # Bundled webfonts, each under its own src/fonts/LICENSE-* file
│   └── styles/                # Design tokens and app/document/print CSS
├── legal/
│   └── citations.json      # Snapshot of statute history notes, checked by CI
├── design/                  # Frozen Phase 2 mockups and design tokens reference
├── test/                    # Playwright end-to-end and fidelity test suites
├── package.json
└── playwright.config.js
```

## Getting Started

### Deploy Your Own

This is a client-side app with no backend. To run your own copy:

1. Fork this repository.
2. In the fork's settings, go to **Settings → Pages** and set **Source** to
   **GitHub Actions** — this is required, not a fallback; the deploy job
   uploads the Vite build output (`dist/`), not the repository root.
3. Push to `main`. The included workflow builds the app and deploys it; the fork is
   served at `https://<your-username>.github.io/estate-document-templates/`.

No account beyond GitHub is required.

### Local Development

This is a Vite app; `index.html` loads `/src/main.tsx` as a module, which a plain
static file server hands to the browser unprocessed. Use Vite's dev server instead:

```sh
npm install
npm run dev
```

Open the printed local URL in your web browser. To check a production build instead:

```sh
npm run build && npm run preview
```

### Testing

Run the unit test suite (Vitest — store, model, and pure logic):

```sh
npm run test:unit
```

Run the Playwright end-to-end suite (covers desktop/mobile viewports, semantic landmarks and keyboard navigation, state reactivity, the guidance layer, and PDF rendering):

```sh
npm test
```

### Checking citations

RCW citations across `src/documents/**` are checked monthly by CI against `app.leg.wa.gov` and diffed against `legal/citations.json`. To run the same check by hand:

```sh
npm run check:citations
```

## Your Data

Every draft lives in the browser's `localStorage`, on the machine that typed it.
Nothing is uploaded and there is no server. **Export JSON is the only backup** —
clearing site data, using a private window, or switching browsers loses the draft.

## Disclaimer

This tool is a drafting aid, not legal advice, and using it does not create an
attorney-client relationship. It generates documents under Washington State law
only. Have a licensed attorney review any document before you sign it.
