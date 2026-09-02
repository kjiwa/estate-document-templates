# Estate Document Templates

A client-side web application for generating, customizing, and printing legally structured estate planning documents compliant with Washington State law (RCW Title 11).

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
  - **RCW 11.02.005(18)**: Representation (not per stirpes) for gifts to a deceased beneficiary's descendants; the survivorship period is editable per profile rather than tracking a statutory default.
  - **RCW 11.68.011**: Nonintervention powers, requested by petition rather than directed outright.
  - **RCW 11.20.020 & RCW 42.45.130**: Self-proving affidavit with testator and witness signature lines, and a dated notarial jurat.
- **Guidance Layer**: Every decision-bearing field carries a native `<details>` disclosure explaining what it does, the options, what's typical, and its impact — content only, never part of the printed document. A live Review panel raises advisories (e.g. an interested witness, a missing alternate fiduciary) computed by a pure `analyzeProfile()` function. An Attorney Memo export lists every choice and advisory for counsel.
- **Profile Switching & Pronoun Agreement**: Toggle between reciprocal spousal profiles, with automatic updates to pronouns, fiduciary appointments, and beneficiary declarations.
- **Variable Highlighting**: Toggle dynamic field indicators on screen to audit customizable terms without affecting printed output.
- **Screen-to-Print Fidelity**: Print stylesheets configured for standard Letter portrait dimensions (`8.5in x 11in`), calibrated margins, `@page` margin-box page numbers and testator initials, widow/orphan controls, and unbreakable signature and notary blocks.
- **State Persistence & Portability**:
  - Auto-persists drafting sessions in browser `localStorage`, deep-merged over the shipped defaults so an older or partial draft never invents a value for a field it doesn't have.
  - Export and import full profile state as structured JSON, validated by shape.
  - Export standalone, self-contained HTML files ready for offline viewing or printing — styled from the same `css/` files the app uses, with no guidance content.
- **Accessibility**: Built to WCAG 2.1/2.2 AA standards with semantic landmarks, keyboard navigation, focus indicators, and screen-reader status announcements.

## Document Structure (Last Will & Testament)

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

## Project Structure

```
.
├── index.html              # Application entry point and UI markup
├── css/
│   ├── tokens.css          # Design tokens (colors, typography, spacing)
│   ├── layout.css          # Responsive app layout and controls styling
│   ├── document.css        # Paged document styles and typography
│   └── print.css           # Print media rules and page-break controls
├── js/
│   ├── app.js               # Application bootstrapping and event wiring
│   ├── config.js             # Blank profile shape and schema constants
│   ├── state.js              # Reactive state store and persistence
│   ├── export.js             # Standalone HTML and attorney-memo generation
│   ├── guidance.js           # Guidance content and <details> rendering
│   ├── review.js             # analyzeProfile(): pure advisory computation
│   ├── utils.js               # Pronoun declensions, sanitization, and helpers
│   └── templates/
│       ├── registry.js       # Template registry
│       └── will.js           # Washington Last Will & Testament template
├── legal/
│   └── citations.json      # Snapshot of statute history notes, checked by CI
├── test/                   # Playwright end-to-end and fidelity test suites
├── package.json
└── playwright.config.js
```

## Getting Started

### Local Development

Serve the root directory using any static file server:

```sh
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080` in your web browser.

### Testing

Run the Playwright test suite (covers desktop/mobile viewports, WCAG accessibility, state reactivity, the guidance layer, and PDF rendering):

```sh
npm test
```

### Checking citations

RCW citations in `js/templates/will.js` and `js/guidance.js` are checked monthly by CI against `app.leg.wa.gov` and diffed against `legal/citations.json`. To run the same check by hand:

```sh
npm run check:citations
```
