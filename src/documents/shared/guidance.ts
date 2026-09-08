// Content as data, not markup: one entry per decision the sidebar asks the
// user to make. Editor-only content, never rendered into the document body
// or the standalone export. Lives here, not under any one document's
// directory, so `FieldGuidance.tsx` can resolve a `Section.guidance` id
// against whichever document is active.
export interface GuidanceEntry {
  title: string;
  whatItDoes: string;
  options: string[];
  typical: string;
  impact: string;
  statutes: string[];
}
