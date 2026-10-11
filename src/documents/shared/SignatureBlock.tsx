import { Blank } from "./Blank";

interface SignatureBlockProps {
  role: string;
}

// The principal signer's signature. `role` is the noun the instrument uses
// for its own signer ("Testator", "Declarant").
export function SignatureBlock({ role }: SignatureBlockProps) {
  return (
    <div class="sig-block-principal">
      <div class="sig-lines-principal">
        <div class="sig-line">
          <strong>
            <Blank path="party.testator.name" chars={20} />
          </strong>
          , {role}
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
