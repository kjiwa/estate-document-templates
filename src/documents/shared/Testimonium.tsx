import { Blank } from "./Blank";

interface TestimoniumProps {
  instrument: string;
}

// Reproduces `renderTestimoniumAndSignatures`'s first block. Reads fixed
// `party`/`execution` paths directly — these groups are shared across every
// planned document — but the instrument name is a prop, not a literal, so a
// second document's execution block reads correctly; the will passes its
// value explicitly so the goldens stay byte-identical.
export function Testimonium({ instrument }: TestimoniumProps) {
  return (
    <div class="testimonium">
      <strong>IN WITNESS WHEREOF</strong>, I have signed this {instrument},
      consisting of this and the preceding pages, in the City of{" "}
      <Blank path="execution.city" chars={12} />,{" "}
      <Blank path="party.testator.county" chars={12} /> County,{" "}
      <Blank path="party.testator.state" chars={14} />, on this{" "}
      <Blank path="execution.executionDate.day" chars={5} /> day of{" "}
      <Blank path="execution.executionDate.month" chars={14} />,{" "}
      <Blank path="execution.executionDate.year" chars={6} />.
    </div>
  );
}
