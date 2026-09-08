import type { DocumentDefinition } from "../documents/registry";
import type { Plan } from "../model/plan";

// The two document-specific strings `print.css`'s `@page` margin boxes read
// via `--print-doc-label`/`--print-initials-label`: the running footer
// label and the signer-initials prompt. Shared by the live app (`./print.ts`,
// which sets them on `documentElement` before `window.print()`) and the
// standalone export (`../export/standaloneHtml.ts`, which inlines them into
// a generated stylesheet) so the two print paths cannot drift.
export function printDocLabel(
  plan: Plan,
  document: DocumentDefinition
): string {
  const name = plan.party.testator.name || "";
  return `${document.title} — ${name}`;
}

export function printInitialsLabel(document: DocumentDefinition): string {
  return `${document.roleNoun} initials: ________`;
}

// A CSS custom property's value is a quoted string; escape both characters
// that would otherwise terminate or escape it early.
export function escapeCssString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
