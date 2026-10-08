import { NotarialAcknowledgment } from "./NotarialAcknowledgment";
import { Value } from "./Value";

export function PrincipalAcknowledgment() {
  return (
    <NotarialAcknowledgment
      preamble="This is the acknowledgment of the Principal's signature that RCW 11.125.050 provides for."
      juratOpener="Given under my hand and official seal this"
    >
      {(p) => (
        <>
          signed this instrument and acknowledged it to be{" "}
          <Value value={p.possessive} /> free and voluntary act for the uses and
          purposes mentioned in the instrument.
        </>
      )}
    </NotarialAcknowledgment>
  );
}
