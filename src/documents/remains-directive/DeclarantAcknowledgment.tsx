import { NotarialAcknowledgment } from "../shared/NotarialAcknowledgment";
import { Value } from "../shared/Value";

// RCW 68.50.160 has no self-proving-affidavit equivalent of a Will's RCW
// 11.20.020 affidavit; this is an ordinary acknowledgment of the Declarant's
// own signature, included because it is not required, so its prose must not
// claim otherwise. See `../guidance.ts`'s "notary" entry.
export function DeclarantAcknowledgment() {
  return (
    <NotarialAcknowledgment
      preamble="This acknowledgment is not required by RCW 68.50.160 for this Directive to be effective; it is included so that a funeral establishment or cemetery authority receiving this instrument has independent proof of the Declarant's signature."
      signerRow
      juratOpener="Subscribed and acknowledged before me this"
    >
      {(p) => (
        <>
          signed and dated this instrument in the presence of the witnesses
          named below, and acknowledged it to be <Value value={p.possessive} />{" "}
          free and voluntary act for the uses and purposes stated in it.
        </>
      )}
    </NotarialAcknowledgment>
  );
}
