import { getTemplate } from "./templates/registry.js";
import { getActiveProfile } from "./state.js";
import { escapeCssString } from "./utils.js";
import { analyzeProfile } from "./review.js";

const STYLESHEET_HREFS = [
  "css/tokens.css",
  "css/document.css",
  "css/print.css",
];

async function inlineStylesheets() {
  const responses = await Promise.all(
    STYLESHEET_HREFS.map((href) => fetch(href))
  );
  const texts = await Promise.all(responses.map((res) => res.text()));
  return texts.join("\n\n");
}

function buildPrintDocLabel(profile) {
  const name = profile?.testator?.name || "";
  const label = `Last Will and Testament — ${name}`;
  return `:root { --print-doc-label: "${escapeCssString(label)}"; }`;
}

// Minimal screen-only chrome for the standalone file: the sheet itself is
// fully styled by document.css, but a bare white page on a white background
// with no margin reads as broken, so a couple of presentation rules are
// generated here rather than fetched (they belong to the export, not to the
// app shell in layout.css).
const GENERATED_SCREEN_STYLES = `
body {
  font-family: var(--font-serif);
  background-color: var(--color-bg-app);
  padding: var(--space-8) var(--space-4);
}
.paged-sheet {
  margin: 0 auto;
}
`;

export async function generateStandaloneHtml(templateId = "will") {
  const template = getTemplate(templateId);
  const profile = getActiveProfile();
  if (!template || !profile) return "";

  const renderedBody = template.render(profile, { highlightVariables: false });
  const title = `Last Will and Testament - ${profile.testator?.name || "Document"}`;
  const css = await inlineStylesheets();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${css}
${buildPrintDocLabel(profile)}
${GENERATED_SCREEN_STYLES}
  </style>
</head>
<body>
  <article class="paged-sheet">
    ${renderedBody}
  </article>
</body>
</html>`;
}

const OPEN_QUESTIONS_FOR_COUNSEL = [
  "Credit shelter / QTIP formula funding under chapter 11.108 RCW, if the disclaimer approach proves insufficient — deliberately out of scope for this template.",
  "The estate tax exclusion figures used in guidance are point-in-time and indexed annually; confirm the current-year figure before relying on them.",
  "No-contest clause enforceability is subject to judicially developed limits, not a statute this template can check.",
];

function formatChoice(label, value) {
  return `- ${label}: ${value || "(unset)"}`;
}

// A plain-text companion document listing every choice made and every
// advisory raised, meant to be handed to counsel alongside the draft. It is
// generated from the same profile and the same analyzeProfile() the Review
// panel uses, so it never says anything the editor didn't already surface.
export function generateAttorneyMemo(profile) {
  const advisories = analyzeProfile(profile);
  const lines = [];

  lines.push("ATTORNEY MEMORANDUM");
  lines.push(
    `Draft prepared for: ${profile.testator?.name || "(unnamed testator)"}`
  );
  lines.push("");

  lines.push("CHOICES MADE");
  lines.push(formatChoice("Spousal gift structure", profile.spousalGift));
  lines.push(
    formatChoice("Survivorship period (days)", profile.survivorshipDays)
  );
  lines.push(
    formatChoice(
      "Guardian of the person (primary / alternate)",
      `${profile.guardians?.primary || "(unset)"} / ${profile.guardians?.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Conservator of the estate (primary / alternate)",
      `${profile.conservators?.primary || "(unset)"} / ${profile.conservators?.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Personal Representative (primary / alternate)",
      `${profile.personalRepresentatives?.primary || "(unset)"} / ${profile.personalRepresentatives?.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Trustee (primary / alternate)",
      `${profile.trustees?.primary || "(unset)"} / ${profile.trustees?.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Disposition of remains (agent / alternate)",
      `${profile.remains?.agent || "(unset)"} / ${profile.remains?.alternate || "(unset)"}`
    )
  );
  lines.push(
    formatChoice(
      "Ultimate contingent beneficiary",
      profile.ultimateBeneficiary?.name
        ? `${profile.ultimateBeneficiary.name} (${profile.ultimateBeneficiary.relationship || "relationship unset"})`
        : ""
    )
  );
  lines.push(
    formatChoice(
      "Community property agreement on file",
      profile.communityPropertyAgreement?.exists ? "yes" : "no"
    )
  );
  lines.push("");

  lines.push("ADVISORIES RAISED");
  if (advisories.length === 0) {
    lines.push("- None raised by automated review.");
  } else {
    advisories.forEach((advisory) => {
      lines.push(
        `- [${advisory.severity}] ${advisory.title}: ${advisory.message}`
      );
    });
  }
  lines.push("");

  lines.push("OPEN QUESTIONS FOR COUNSEL");
  OPEN_QUESTIONS_FOR_COUNSEL.forEach((question) => lines.push(`- ${question}`));

  return lines.join("\n");
}
