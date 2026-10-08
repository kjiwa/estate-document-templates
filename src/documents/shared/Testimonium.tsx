import { Blank } from "./Blank";
import { useExecutionPath } from "./PlanContext";

interface TestimoniumProps {
  instrument: string;
}

// Reproduces `renderTestimoniumAndSignatures`'s first block. Reads the
// document's own execution record through `ExecutionContext`. The
// instrument name is a prop so a second document's execution block reads
// correctly; the will passes its value explicitly so the goldens stay
// byte-identical.
export function Testimonium({ instrument }: TestimoniumProps) {
  const at = useExecutionPath();
  return (
    <div class="testimonium">
      <strong>IN WITNESS WHEREOF</strong>, I have signed this {instrument},
      consisting of this and the preceding pages, in the City of{" "}
      <Blank path={at("city")} chars={12} />,{" "}
      <Blank path="party.testator.county" chars={12} /> County,{" "}
      <Blank path="party.testator.state" chars={14} />, on this{" "}
      <Blank path={at("executionDate.day")} chars={5} /> day of{" "}
      <Blank path={at("executionDate.month")} chars={14} />,{" "}
      <Blank path={at("executionDate.year")} chars={6} />.
    </div>
  );
}
