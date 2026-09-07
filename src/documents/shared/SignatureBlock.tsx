import { Blank } from "./Blank";

// Reproduces `renderTestimoniumAndSignatures`'s second block — the
// principal (testator) signature.
export function SignatureBlock() {
  return (
    <div class="sig-block-principal">
      <div class="sig-lines-principal">
        <div class="sig-line">
          <strong>
            <Blank path="party.testator.name" chars={20} />
          </strong>
          , Testator
        </div>
        {"\n"}
        <div class="sig-caption">
          Residing at <Blank path="party.testator.county" chars={12} /> County,{" "}
          <Blank path="party.testator.state" chars={14} />
        </div>
      </div>
    </div>
  );
}
