# Estate Document Templates

A client-side web application for generating, customizing, and printing legally structured estate planning documents compliant with Washington State law (RCW Title 11).

## Features

- **Live Reactive Drafting**: Real-time two-way synchronization between sidebar input controls and the paged document preview.
- **Washington Statutory Alignment**: Pre-configured legal provisions conforming to:
  - **RCW 11.12**: Execution, revocation, and separate lists for tangible personal property.
  - **RCW 11.98**: Trustee powers and small trust terminations under the Washington Trust Act.
  - **RCW 11.120**: Fiduciary access to digital assets.
  - **RCW 6.32.250**: Spendthrift creditor protection.
  - **RCW 11.04 & 11.05A**: Intestate succession and 120-hour uniform survivorship requirements.
- **Profile Switching & Pronoun Agreement**: Toggle between reciprocal spousal profiles with automatic updates to pronouns, fiduciary appointments, and beneficiary declarations.
- **Variable Highlighting**: Toggle dynamic field indicators on screen to audit customizable terms without affecting printed output.
- **Screen-to-Print Fidelity**: Print stylesheets configured for standard Letter portrait dimensions (`8.5in x 11in`), calibrated margins (`0.85in` top/bottom, `0.8in` left/right), widow/orphan controls, and unbreakable signature and notary blocks.
- **State Persistence & Portability**:
  - Auto-persists drafting sessions in browser `localStorage`.
  - Export and import full profile state as structured JSON.
  - Export standalone, self-contained HTML files ready for offline viewing or printing.
- **Accessibility**: Built to WCAG 2.1/2.2 AA standards with semantic landmarks, keyboard navigation, focus indicators, and screen-reader status announcements.

## Document Structure (Last Will & Testament)

1. **Title & Preamble**: Testator identification, domicile declaration, and revocation of prior wills.
2. **Article 1: Family and Guardians**: Spouse and children identification; primary and alternate guardian nominations for minor children.
3. **Article 2: Disposition of Property**: Primary spousal bequest, incorporation of separate lists (RCW 11.12.260), residuary trust disposition, and ultimate contingent beneficiaries.
4. **Article 3: Trust Beneficiaries and Distributions**: Health, education, support, and maintenance (HEMS) standard for beneficiaries under age 25, small trust termination, and rule against perpetuities.
5. **Article 4: Claims by Strangers**: Spendthrift protection pursuant to RCW 6.32.250.
6. **Article 5: Powers and Duties of Trustee**: Statutory powers under RCW 11.98.070, investment flexibility, non-pro-rata in-kind distributions, and digital assets under RCW 11.120.
7. **Article 6: Administration and Fiduciaries**: Personal representative and trustee appointments, alternates, nonintervention powers (RCW 11.68), and bond waivers.
8. **Article 7: No Contest Provision**: In terrorem clause revoking interests of challenging parties.
9. **Article 8: Ancillary Administration**: Out-of-state property administration.
10. **Article 9: Presumption of Survivorship**: 120-hour survival rule under RCW 11.05A.
11. **Article 10: Severability**: Clause independence safeguard.
12. **Testimonium & Attestation**: Execution statement, testator signature block, witness declaration, and two-witness signature grid.
13. **Self-Proving Affidavit**: Notary certificate conforming to RCW 11.20.020.

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
│   ├── app.js              # Application bootstrapping and event wiring
│   ├── config.js           # Default testator profiles and constants
│   ├── state.js            # Reactive state store, persistence, and exports
│   ├── utils.js            # Pronoun declensions, sanitization, and helpers
│   └── templates/
│       ├── registry.js     # Template registry
│       └── will.js         # Washington Last Will & Testament template
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

Run the Playwright test suite (covers desktop/mobile viewports, WCAG accessibility, state reactivity, and PDF rendering):

```sh
npm test
```
